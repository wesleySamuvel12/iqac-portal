import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateTempPassword } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let records: any[] = []
    let departmentId = ''
    let createLoginAccess = false // DEFAULT IS FALSE
    let duplicateStrategy = 'skip'
    let action = 'import'

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File
      departmentId = (formData.get('departmentId') as string) || ''
      createLoginAccess = formData.get('createLoginAccess') === 'true'
      duplicateStrategy = (formData.get('duplicateStrategy') as string) || 'skip'
      action = (formData.get('action') as string) || 'import'

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
        const row: any = { _rowNumber: i + 1 }
        headers.forEach((h, idx) => {
          row[h] = values[idx] || ''
        })
        records.push(row)
      }
    } else {
      const body = await request.json()
      records = body.students || body.records || []
      departmentId = body.departmentId || ''
      createLoginAccess = body.createLoginAccess === true
      duplicateStrategy = body.duplicateStrategy || 'skip'
      action = body.action || 'import'
    }

    if (records.length === 0) {
      return NextResponse.json({ success: false, error: 'No student records found in CSV' }, { status: 400 })
    }

    // Default department fallback if not provided
    if (!departmentId) {
      const firstDept = await db.department.findFirst()
      if (firstDept) departmentId = firstDept.id
    }

    // Pre-fetch departments
    const allDepartments = await db.department.findMany({ select: { id: true, code: true, name: true } })
    const deptMap = new Map<string, string>()
    allDepartments.forEach(d => {
      deptMap.set(d.code.toLowerCase(), d.id)
      deptMap.set(d.name.toLowerCase(), d.id)
    })

    // STEP 1: PRE-VALIDATION PHASE
    const validRecords: any[] = []
    const invalidRecords: { row: number; regNo?: string; name?: string; email?: string; error: string }[] = []
    const existingEmailsInDb = new Set<string>()

    // Fetch existing users/students to detect duplicates
    const existingUsers = await db.user.findMany({ select: { email: true } })
    existingUsers.forEach(u => existingEmailsInDb.add(u.email.toLowerCase()))

    for (const record of records) {
      const rowNum = record._rowNumber || validRecords.length + invalidRecords.length + 2
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
        (regNo ? `Student ${regNo}` : '')
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
      const customPassword = (record.password || record.pass || record.studentpassword || '').trim()

      let rowDeptId = departmentId
      const deptVal = (record.department || record.departmentcode || record.dept || record.deptcode || '').trim().toLowerCase()
      if (deptVal && deptMap.has(deptVal)) {
        rowDeptId = deptMap.get(deptVal)!
      }

      if (!regNo) {
        invalidRecords.push({ row: rowNum, error: 'Missing Register Number' })
        continue
      }

      if (!email) {
        invalidRecords.push({ row: rowNum, regNo, error: 'Missing Email address' })
        continue
      }

      const isDuplicate = existingEmailsInDb.has(email)

      validRecords.push({
        row: rowNum,
        regNo,
        name: name || `Student ${regNo}`,
        email,
        phone,
        departmentId: rowDeptId,
        semester,
        section,
        batch,
        cgpa,
        customPassword,
        isDuplicate,
      })
    }

    // IF ACTION IS 'validate', RETURN PREVIEW & VALIDATION MATRIX
    if (action === 'validate') {
      return NextResponse.json({
        success: true,
        totalRecords: records.length,
        validCount: validRecords.length,
        invalidCount: invalidRecords.length,
        invalidRecords,
        duplicateCount: validRecords.filter(r => r.isDuplicate).length,
        validRecords: validRecords.map(r => ({
          row: r.row,
          regNo: r.regNo,
          name: r.name,
          email: r.email,
          departmentId: r.departmentId,
          isDuplicate: r.isDuplicate,
        }))
      })
    }

    // STEP 2: IMPORT EXECUTION PHASE
    const importedStudents: any[] = []
    let loginAccountsCreated = 0
    let failedLoginAccounts = 0
    const importErrors: string[] = []

    for (const record of validRecords) {
      try {
        let userId: string | null = null

        // IF USER SELECTED "YES, CREATE LOGIN ACCESS"
        if (createLoginAccess) {
          const passToUse = record.customPassword || generateTempPassword()
          const isTempPass = !record.customPassword
          const hashedPassword = await hashPassword(passToUse)

          try {
            const user = await db.user.upsert({
              where: { email: record.email },
              update: {
                name: record.name,
                phone: record.phone || undefined,
                departmentId: record.departmentId || undefined,
                role: 'STUDENT',
                isActive: true,
                status: 'ACTIVE',
              },
              create: {
                email: record.email,
                password: hashedPassword,
                name: record.name,
                role: 'STUDENT',
                phone: record.phone || null,
                departmentId: record.departmentId || undefined,
                isActive: true,
                status: 'ACTIVE',
                mustChangePassword: isTempPass,
              }
            })
            userId = user.id
            loginAccountsCreated++
          } catch (userErr: any) {
            console.error(`Login account creation failed for ${record.email}:`, userErr)
            failedLoginAccounts++
          }
        }

        // UPSERT STUDENT PROFILE
        const student = await db.student.upsert({
          where: { registerNumber: record.regNo },
          update: {
            name: record.name,
            email: record.email,
            phone: record.phone || undefined,
            ...(userId ? { userId } : {}),
            departmentId: record.departmentId || undefined,
            semester: record.semester,
            section: record.section,
            batch: record.batch,
            cgpa: record.cgpa,
          },
          create: {
            registerNumber: record.regNo,
            name: record.name,
            email: record.email,
            phone: record.phone || null,
            userId: userId || null,
            departmentId: record.departmentId || undefined,
            semester: record.semester,
            section: record.section,
            batch: record.batch,
            cgpa: record.cgpa,
          },
          include: {
            user: { select: { id: true, email: true, name: true, role: true, status: true } },
            department: { select: { id: true, name: true, code: true } },
          }
        })

        importedStudents.push({
          id: student.id,
          registerNumber: student.registerNumber,
          name: record.name,
          email: record.email,
          loginAccess: Boolean(student.userId || userId),
          department: student.department?.name || 'Assigned Department',
          semester: student.semester,
          section: student.section,
        })
      } catch (err: any) {
        console.error(`Error importing student ${record.regNo}:`, err)
        importErrors.push(`Row ${record.row} (${record.regNo}): ${err.message || 'Import failed'}`)
      }
    }

    return NextResponse.json({
      success: true,
      recordsImported: importedStudents.length,
      recordsFailed: invalidRecords.length + importErrors.length,
      totalRecords: records.length,
      loginAccess: createLoginAccess ? 'YES' : 'NO',
      loginAccountsCreated,
      failedLoginAccounts,
      invalidRecords,
      importErrors,
      imported: importedStudents,
    })
  } catch (error: any) {
    console.error('Bulk import error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to process CSV import' }, { status: 500 })
  }
}
