import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateTempPassword } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const departmentId = formData.get('departmentId') as string
    const createLoginAccess = formData.get('createLoginAccess') === 'true' // DEFAULT IS FALSE
    const action = (formData.get('action') as string) || 'import'
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No CSV file provided' }, { status: 400 })
    }
    
    if (!departmentId) {
      return NextResponse.json({ success: false, error: 'Department ID is required' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split(/\r?\n/).filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ success: false, error: 'CSV file must have a header row and at least one data row' }, { status: 400 })
    }

    const header = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim())
    
    const requiredFields = ['employeeid', 'empid', 'employee_id', 'emp_no', 'staffid', 'sno']
    const nameFields = ['name', 'employeename', 'employee_name', 'staffname', 'fullname']
    const emailFields = ['email', 'emailid', 'email_id']
    const phoneFields = ['phone', 'mobile', 'phonenumber', 'contact']
    const designationFields = ['designation', 'post', 'role', 'title']
    const qualificationFields = ['qualification', 'qual', 'degree']
    const specializationFields = ['specialization', 'specialisation', 'spec']
    const experienceFields = ['experience', 'exp', 'years']
    const researchAreaFields = ['researcharea', 'research_area']
    const isHODFields = ['ishod', 'is_hod', 'hod']
    const passwordFields = ['password', 'pass']

    const getColumnIndex = (fields: string[]): number => {
      for (const field of fields) {
        const index = header.findIndex(h => h === field || h.includes(field))
        if (index !== -1) return index
      }
      return -1
    }

    const empIdCol = getColumnIndex(requiredFields)
    if (empIdCol === -1) {
      return NextResponse.json({ success: false, error: 'CSV must contain an Employee ID column (employeeId, empId, etc.)' }, { status: 400 })
    }

    const nameCol = getColumnIndex(nameFields)
    const emailCol = getColumnIndex(emailFields)
    const phoneCol = getColumnIndex(phoneFields)
    const designationCol = getColumnIndex(designationFields)
    const qualificationCol = getColumnIndex(qualificationFields)
    const specializationCol = getColumnIndex(specializationFields)
    const experienceCol = getColumnIndex(experienceFields)
    const researchAreaCol = getColumnIndex(researchAreaFields)
    const isHODCol = getColumnIndex(isHODFields)
    const passwordCol = getColumnIndex(passwordFields)

    const validRecords: any[] = []
    const invalidRecords: { row: number; employeeId?: string; name?: string; error: string }[] = []

    const existingUsers = await db.user.findMany({ select: { email: true } })
    const existingEmailsInDb = new Set(existingUsers.map(u => u.email.toLowerCase()))

    for (let i = 1; i < lines.length; i++) {
      const rowNum = i + 1
      const values = parseCSVLine(lines[i])
      if (values.every(v => !v.trim())) continue

      const employeeId = values[empIdCol]?.trim()
      if (!employeeId) {
        invalidRecords.push({ row: rowNum, error: 'Missing Employee ID' })
        continue
      }

      const name = nameCol >= 0 ? values[nameCol]?.trim() || `Staff ${employeeId}` : `Staff ${employeeId}`
      const email = emailCol >= 0 ? values[emailCol]?.trim().toLowerCase() || `${employeeId.toLowerCase()}@niet.ac.in` : `${employeeId.toLowerCase()}@niet.ac.in`
      const phone = phoneCol >= 0 ? values[phoneCol]?.trim() || null : null
      const designation = designationCol >= 0 ? values[designationCol]?.trim() || null : null
      const qualification = qualificationCol >= 0 ? values[qualificationCol]?.trim() || null : null
      const specialization = specializationCol >= 0 ? values[specializationCol]?.trim() || null : null
      const experience = experienceCol >= 0 ? parseFloat(values[experienceCol]) || null : null
      const researchArea = researchAreaCol >= 0 ? values[researchAreaCol]?.trim() || null : null
      const customPassword = passwordCol >= 0 ? values[passwordCol]?.trim() || '' : ''
      
      let isHOD = false
      if (isHODCol >= 0) {
        const hodValue = values[isHODCol]?.trim().toLowerCase()
        isHOD = hodValue === 'true' || hodValue === 'yes' || hodValue === '1' || hodValue === 'hod'
      }

      const isDuplicate = existingEmailsInDb.has(email)

      validRecords.push({
        row: rowNum,
        employeeId,
        name,
        email,
        phone,
        designation,
        qualification,
        specialization,
        experience,
        researchArea,
        isHOD,
        customPassword,
        isDuplicate,
      })
    }

    if (action === 'validate') {
      return NextResponse.json({
        success: true,
        totalRecords: lines.length - 1,
        validCount: validRecords.length,
        invalidCount: invalidRecords.length,
        invalidRecords,
        duplicateCount: validRecords.filter(r => r.isDuplicate).length,
        validRecords,
      })
    }

    const importedFaculty: any[] = []
    let loginAccountsCreated = 0
    let failedLoginAccounts = 0
    const importErrors: string[] = []

    for (const record of validRecords) {
      try {
        let userId: string | null = null

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
                departmentId,
                role: record.isHOD ? 'HOD' : 'STAFF',
                isActive: true,
                status: 'ACTIVE',
              },
              create: {
                email: record.email,
                password: hashedPassword,
                name: record.name,
                role: record.isHOD ? 'HOD' : 'STAFF',
                phone: record.phone || null,
                departmentId,
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

        const faculty = await db.faculty.upsert({
          where: { employeeId: record.employeeId },
          update: {
            name: record.name,
            email: record.email,
            phone: record.phone || undefined,
            ...(userId ? { userId } : {}),
            departmentId,
            designation: record.designation,
            qualification: record.qualification,
            specialization: record.specialization,
            experience: record.experience,
            researchArea: record.researchArea,
            isHOD: record.isHOD,
          },
          create: {
            employeeId: record.employeeId,
            name: record.name,
            email: record.email,
            phone: record.phone || null,
            userId: userId || null,
            departmentId,
            designation: record.designation,
            qualification: record.qualification,
            specialization: record.specialization,
            experience: record.experience,
            researchArea: record.researchArea,
            isHOD: record.isHOD,
          },
          include: {
            user: { select: { id: true, email: true, name: true, role: true, status: true } }
          }
        })

        importedFaculty.push(faculty)
      } catch (err: any) {
        importErrors.push(`Row ${record.row} (${record.employeeId}): ${err.message || 'Import failed'}`)
      }
    }

    return NextResponse.json({
      success: true,
      recordsImported: importedFaculty.length,
      recordsFailed: invalidRecords.length + importErrors.length,
      totalRecords: lines.length - 1,
      loginAccess: createLoginAccess ? 'YES' : 'NO',
      loginAccountsCreated,
      failedLoginAccounts,
      invalidRecords,
      importErrors,
      imported: importedFaculty,
    })
  } catch (error: any) {
    console.error('Error importing faculty:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to import staff' }, { status: 500 })
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}
