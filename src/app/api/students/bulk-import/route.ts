import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let records: any[] = []
    let departmentId = ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File
      departmentId = (formData.get('departmentId') as string) || ''

      if (!file) {
        return NextResponse.json({ success: false, error: 'No CSV file provided' }, { status: 400 })
      }

      const text = await file.text()
      const lines = text.split(/\r?\n/).filter(line => line.trim())
      if (lines.length <= 1) {
        return NextResponse.json({ success: false, error: 'CSV file is empty or missing headers' }, { status: 400 })
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''))
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
        if (values.length < 2) continue
        const row: any = {}
        headers.forEach((h, idx) => {
          row[h] = values[idx] || ''
        })
        records.push(row)
      }
    } else {
      const body = await request.json()
      records = body.students || body.records || []
      departmentId = body.departmentId || ''
    }

    if (records.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid student records found to import' }, { status: 400 })
    }

    // Default department fallback if not provided
    if (!departmentId) {
      const firstDept = await db.department.findFirst()
      if (firstDept) departmentId = firstDept.id
    }

    const importedStudents: any[] = []
    const errors: string[] = []
    const defaultPassword = await hashPassword('Student@123')

    for (const record of records) {
      const regNo = (record.registerNumber || record.regNo || record.reg_no || '').trim()
      const name = (record.name || record.studentName || `Student ${regNo}`).trim()
      const email = (record.email || `${regNo.toLowerCase()}@niet.ac.in`).trim().toLowerCase()
      const phone = (record.phone || '').trim()
      const semester = parseInt(record.semester || '1') || 1
      const section = (record.section || 'A').toUpperCase()
      const batch = record.batch || '2024-2028'
      const cgpa = parseFloat(record.cgpa || '0.00') || 0.0

      if (!regNo) continue

      try {
        // Check if student exists
        const existingStudent = await db.student.findUnique({ where: { registerNumber: regNo } })
        if (existingStudent) {
          importedStudents.push(existingStudent)
          continue
        }

        const user = await db.user.upsert({
          where: { email },
          update: { name, phone: phone || null },
          create: {
            email,
            password: defaultPassword,
            name,
            role: 'STUDENT',
            phone: phone || null,
            departmentId: departmentId || undefined,
          }
        })

        const student = await db.student.create({
          data: {
            registerNumber: regNo,
            userId: user.id,
            departmentId: departmentId || undefined,
            semester,
            section,
            batch,
            cgpa,
          },
          include: {
            user: { select: { id: true, email: true, name: true } },
            department: true,
          }
        })

        importedStudents.push(student)
      } catch (err: any) {
        console.error(`Error importing ${regNo}:`, err)
        errors.push(`RegNo ${regNo}: ${err.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      count: importedStudents.length,
      imported: importedStudents,
      errors
    })
  } catch (error: any) {
    console.error('Bulk import error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to import CSV' }, { status: 500 })
  }
}
