import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Bulk import staff/faculty from CSV data
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const departmentId = formData.get('departmentId') as string
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }
    
    if (!departmentId) {
      return NextResponse.json(
        { success: false, error: 'Department ID is required' },
        { status: 400 }
      )
    }

    // Read file content
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, error: 'CSV file must have a header row and at least one data row' },
        { status: 400 }
      )
    }

    // Parse header
    const header = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim())
    
    // Expected columns (flexible)
    const requiredFields = ['employeeid', 'empid', 'employee_id', 'emp_no', 'staffid']
    const nameFields = ['name', 'employeename', 'employee_name', 'staffname', 'fullname']
    const emailFields = ['email', 'emailid', 'email_id']
    const phoneFields = ['phone', 'mobile', 'phonenumber', 'contact']
    const designationFields = ['designation', 'designation', 'post', 'role', 'title']
    const qualificationFields = ['qualification', 'qual', 'degree']
    const specializationFields = ['specialization', 'specialisation', 'spec', 'subject', 'department']
    const experienceFields = ['experience', 'exp', 'years', 'yearsofexperience']
    const researchAreaFields = ['researcharea', 'research_area', 'areaofspecialization', 'researchinterest']
    const isHODFields = ['ishod', 'is_hod', 'hod']

    // Find column indices
    const getColumnIndex = (fields: string[]): number => {
      for (const field of fields) {
        const index = header.findIndex(h => h === field || h.includes(field) || field.includes(h))
        if (index !== -1) return index
      }
      return -1
    }

    const empIdCol = getColumnIndex(requiredFields)
    
    if (empIdCol === -1) {
      return NextResponse.json(
        { success: false, error: 'CSV must contain an employee ID column (employeeId, empId, etc.)' },
        { status: 400 }
      )
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

    // Process data rows
    const results = {
      success: [] as any[],
      errors: [] as { row: number; employeeId: string; reason: string }[],
      total: lines.length - 1,
      created: 0,
      skipped: 0,
      failed: 0
    }

    // Get existing employee IDs to check for duplicates
    const existingFaculty = await db.faculty.findMany({
      where: { departmentId },
      select: { employeeId: true }
    })
    const existingEmpIds = new Set(existingFaculty.map(f => f.employeeId))

    for (let i = 1; i < lines.length; i++) {
      const rowNum = i + 1
      const values = parseCSVLine(lines[i])
      
      // Skip empty rows
      if (values.every(v => !v.trim())) continue

      const employeeId = values[empIdCol]?.trim()
      
      if (!employeeId) {
        results.errors.push({ row: rowNum, employeeId: 'N/A', reason: 'Missing employee ID' })
        results.failed++
        continue
      }

      // Check duplicate
      if (existingEmpIds.has(employeeId)) {
        results.errors.push({ row: rowNum, employeeId, reason: 'Employee ID already exists' })
        results.skipped++
        continue
      }

      try {
        const name = nameCol >= 0 ? values[nameCol]?.trim() : `Staff ${employeeId}`
        const email = emailCol >= 0 ? values[emailCol]?.trim() : `${employeeId.toLowerCase()}@niet.edu`
        const phone = phoneCol >= 0 ? values[phoneCol]?.trim() || null : null
        const designation = designationCol >= 0 ? values[designationCol]?.trim() || null : null
        const qualification = qualificationCol >= 0 ? values[qualificationCol]?.trim() || null : null
        const specialization = specializationCol >= 0 ? values[specializationCol]?.trim() || null : null
        const experience = experienceCol >= 0 ? parseFloat(values[experienceCol]) || null : null
        const researchArea = researchAreaCol >= 0 ? values[researchAreaCol]?.trim() || null : null
        
        let isHOD = false
        if (isHODCol >= 0) {
          const hodValue = values[isHODCol]?.trim().toLowerCase()
          isHOD = hodValue === 'true' || hodValue === 'yes' || hodValue === '1' || hodValue === 'hod'
        }

        // Create user
        const user = await db.user.create({
          data: {
            email: email || `${employeeId.toLowerCase()}@niet.edu`,
            password: 'faculty123',
            name: name || `Staff ${employeeId}`,
            role: isHOD ? 'HOD' : 'STAFF',
            phone,
            departmentId,
          }
        })

        // Create faculty
        const faculty = await db.faculty.create({
          data: {
            employeeId,
            userId: user.id,
            departmentId,
            designation,
            qualification,
            specialization,
            experience,
            researchArea,
            isHOD,
          },
          include: {
            user: { select: { id: true, email: true, name: true } },
          }
        })

        existingEmpIds.add(employeeId)
        results.success.push(faculty)
        results.created++

      } catch (error: any) {
        results.errors.push({ 
          row: rowNum, 
          employeeId, 
          reason: error.message?.includes('Unique') ? 'Duplicate entry' : 'Failed to create record' 
        })
        results.failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.created} created, ${results.skipped} skipped, ${results.failed} failed`,
      results
    })

  } catch (error) {
    console.error('Error importing faculty:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to import staff' },
      { status: 500 }
    )
  }
}

// Helper function to parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // skip next quote
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
