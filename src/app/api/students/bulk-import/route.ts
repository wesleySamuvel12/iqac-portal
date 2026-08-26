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

      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''))
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
        if (values.length < 1 || (values.length === 1 && !values[0])) continue
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

    // Pre-fetch all departments for department code mapping
    const allDepartments = await db.department.findMany({ select: { id: true, code: true, name: true } })
    const deptMap = new Map<string, string>()
    allDepartments.forEach(d => {
      deptMap.set(d.code.toLowerCase(), d.id)
      deptMap.set(d.name.toLowerCase(), d.id)
    })

    const defaultHashedPassword = await hashPassword('12345678')
    const importedStudents: any[] = []
    const errors: string[] = []

    for (const record of records) {
      // Flexible field resolution
      const regNo = (
        record.registernumber || 
        record.registerNumber || 
        record.regno || 
        record.reg_no || 
        record.rollno || 
        record.roll_no || 
        record['sno'] || 
        ''
      ).trim()

      const name = (
        record.name || 
        record.studentname || 
        record.student_name || 
        record.fullname || 
        record.full_name || 
        `Student ${regNo}`
      ).trim()

      const email = (
        record.email || 
        record.studentemail || 
        record.useremail || 
        (regNo ? `${regNo.toLowerCase()}@niet.ac.in` : '')
      ).trim().toLowerCase()

      const phone = (record.phone || record.mobile || record.phonenumber || '').trim()
      const semester = parseInt(record.semester || record.sem || '1') || 1
      const section = (record.section || record.sec || 'A').toUpperCase()
      const batch = record.batch || record.batchyear || '2024-2028'
      const cgpa = parseFloat(record.cgpa || '0.00') || 0.0
      
      // Check for row department or use default
      let rowDeptId = departmentId
      const deptVal = (record.department || record.departmentcode || record.dept || record.deptcode || '').trim().toLowerCase()
      if (deptVal && deptMap.has(deptVal)) {
        rowDeptId = deptMap.get(deptVal)!
      }

      if (!regNo) {
        errors.push(`Row missing Register Number: ${JSON.stringify(record)}`)
        continue
      }

      if (!email) {
        errors.push(`RegNo ${regNo}: Missing email address`)
        continue
      }

      try {
        // Resolve row password if custom password provided, otherwise use default '12345678'
        const customPass = (record.password || record.pass || record.studentpassword || '').trim()
        const userPassword = customPass ? await hashPassword(customPass) : defaultHashedPassword

        // Upsert User account with STUDENT role and login access password '12345678'
        const user = await db.user.upsert({
          where: { email },
          update: { 
            name, 
            phone: phone || undefined,
            departmentId: rowDeptId || undefined,
            role: 'STUDENT',
            isActive: true,
          },
          create: {
            email,
            password: userPassword,
            name,
            role: 'STUDENT',
            phone: phone || null,
            departmentId: rowDeptId || undefined,
            isActive: true,
          }
        })

        // Upsert Student profile linked to user account
        const student = await db.student.upsert({
          where: { registerNumber: regNo },
          update: {
            userId: user.id,
            departmentId: rowDeptId || undefined,
            semester,
            section,
            batch,
            cgpa,
          },
          create: {
            registerNumber: regNo,
            userId: user.id,
            departmentId: rowDeptId || undefined,
            semester,
            section,
            batch,
            cgpa,
          },
          include: {
            user: { select: { id: true, email: true, name: true, role: true } },
            department: { select: { id: true, name: true, code: true } },
          }
        })

        importedStudents.push({
          id: student.id,
          registerNumber: student.registerNumber,
          name: user.name,
          email: user.email,
          defaultPassword: customPass || '12345678',
          department: student.department?.name || 'Assigned Department',
          semester: student.semester,
          section: student.section,
        })
      } catch (err: any) {
        console.error(`Error importing student ${regNo}:`, err)
        errors.push(`RegNo ${regNo}: ${err.message || 'Import failed'}`)
      }
    }

    return NextResponse.json({
      success: true,
      count: importedStudents.length,
      defaultPassword: '12345678',
      message: `Successfully imported ${importedStudents.length} students with default login password '12345678'`,
      imported: importedStudents,
      errors
    })
  } catch (error: any) {
    console.error('Bulk import error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to import CSV' }, { status: 500 })
  }
}
