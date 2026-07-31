import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Bulk import students from CSV data
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const departmentId = formData.get('departmentId') as string
    const batchId = formData.get('batchId') as string || null
    
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
    
    // Expected columns (flexible - can be in any order)
    const requiredFields = ['registernumber', 'regno', 'register_no', 'registrationnumber']
    const nameFields = ['name', 'studentname', 'student_name']
    const emailFields = ['email', 'emailid', 'email_id']
    const phoneFields = ['phone', 'mobile', 'phonenumber', 'contact']
    const semesterFields = ['semester', 'sem']
    const sectionFields = ['section', 'sec']
    const cgpaFields = ['cgpa', 'gpa']
    const admissionYearFields = ['admissionyear', 'admission_year', 'yearofadmission', 'batchyear']

    // Find column indices
    const getColumnIndex = (fields: string[]): number => {
      for (const field of fields) {
        const index = header.findIndex(h => h === field || h.includes(field) || field.includes(h))
        if (index !== -1) return index
      }
      return -1
    }

    const regNoCol = getColumnIndex(requiredFields)
    
    if (regNoCol === -1) {
      return NextResponse.json(
        { success: false, error: 'CSV must contain a register number column (registerNumber, regNo, etc.)' },
        { status: 400 }
      )
    }

    const nameCol = getColumnIndex(nameFields)
    const emailCol = getColumnIndex(emailFields)
    const phoneCol = getColumnIndex(phoneFields)
    const semesterCol = getColumnIndex(semesterFields)
    const sectionCol = getColumnIndex(sectionFields)
    const cgpaCol = getColumnIndex(cgpaFields)
    const admissionYearCol = getColumnIndex(admissionYearFields)

    // Process data rows
    const results = {
      success: [] as any[],
      errors: [] as { row: number; registerNumber: string; reason: string }[],
      total: lines.length - 1,
      created: 0,
      skipped: 0,
      failed: 0
    }

    // Get existing register numbers to check for duplicates
    const existingStudents = await db.student.findMany({
      where: { departmentId },
      select: { registerNumber: true }
    })
    const existingRegNos = new Set(existingStudents.map(s => s.registerNumber))

    for (let i = 1; i < lines.length; i++) {
      const rowNum = i + 1
      const values = parseCSVLine(lines[i])
      
      // Skip empty rows
      if (values.every(v => !v.trim())) continue

      const registerNumber = values[regNoCol]?.trim()
      
      if (!registerNumber) {
        results.errors.push({ row: rowNum, registerNumber: 'N/A', reason: 'Missing register number' })
        results.failed++
        continue
      }

      // Check duplicate
      if (existingRegNos.has(registerNumber)) {
        results.errors.push({ row: rowNum, registerNumber, reason: 'Register number already exists' })
        results.skipped++
        continue
      }

      try {
        const name = nameCol >= 0 ? values[nameCol]?.trim() : `Student ${registerNumber}`
        const email = emailCol >= 0 ? values[emailCol]?.trim() : `${registerNumber.toLowerCase()}@niet.edu`
        const phone = phoneCol >= 0 ? values[phoneCol]?.trim() || null : null
        const semester = semesterCol >= 0 ? parseInt(values[semesterCol]) || null : null
        const section = sectionCol >= 0 ? values[sectionCol]?.trim() || null : null
        const cgpa = cgpaCol >= 0 ? parseFloat(values[cgpaCol]) || null : null
        const admissionYear = admissionYearCol >= 0 ? parseInt(values[admissionYearCol]) || null : null

        // Create user
        const user = await db.user.create({
          data: {
            email: email || `${registerNumber.toLowerCase()}@niet.edu`,
            password: 'student123',
            name: name || `Student ${registerNumber}`,
            role: 'STUDENT',
            phone,
            departmentId,
          }
        })

        // Create student
        const student = await db.student.create({
          data: {
            registerNumber,
            userId: user.id,
            departmentId,
            batchId,
            semester,
            section,
            cgpa,
            admissionYear,
          },
          include: {
            user: { select: { id: true, email: true, name: true } },
            batchInfo: true,
          }
        })

        existingRegNos.add(registerNumber)
        results.success.push(student)
        results.created++

      } catch (error: any) {
        results.errors.push({ 
          row: rowNum, 
          registerNumber, 
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
    console.error('Error importing students:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to import students' },
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
