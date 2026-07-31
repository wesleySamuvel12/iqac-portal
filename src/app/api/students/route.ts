import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all students or filter by department/batch
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const batchId = searchParams.get('batchId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const semester = searchParams.get('semester')

    const where: any = {}
    if (departmentId) where.departmentId = departmentId
    if (batchId) where.batchId = batchId
    if (semester) where.semester = parseInt(semester)
    if (search) {
      where.OR = [
        { registerNumber: { contains: search, mode: 'insensitive' as const } },
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
      ]
    }

    const [students, total] = await Promise.all([
      db.student.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true, role: true, phone: true } },
          department: { select: { id: true, name: true, code: true } },
          batchInfo: { select: { id: true, name: true, year: true, section: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { registerNumber: 'asc' },
      }),
      db.student.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// POST - Create new student
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { 
      registerNumber, 
      email, 
      name, 
      phone,
      departmentId, 
      batchId,
      semester, 
      section, 
      batch, 
      cgpa, 
      admissionYear,
      password = 'student123'
    } = data

    if (!registerNumber || !departmentId) {
      return NextResponse.json(
        { success: false, error: 'Register Number and Department are required' },
        { status: 400 }
      )
    }

    // Check if register number already exists
    const existingStudent = await db.student.findUnique({ where: { registerNumber } })
    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Register number already exists' },
        { status: 409 }
      )
    }

    // Create user account for student
    const userEmail = email || `${registerNumber.toLowerCase()}@niet.edu`
    const userName = name || `Student ${registerNumber}`
    
    const user = await db.user.create({
      data: {
        email: userEmail,
        password, // In production, hash this password
        name: userName,
        role: 'STUDENT',
        phone: phone || null,
        departmentId,
      }
    })

    const student = await db.student.create({
      data: {
        registerNumber,
        userId: user.id,
        departmentId,
        batchId: batchId || null,
        semester: semester ? parseInt(semester) : null,
        section,
        batch,
        cgpa: cgpa ? parseFloat(cgpa) : null,
        admissionYear: admissionYear ? parseInt(admissionYear) : null,
      },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        department: true,
        batchInfo: true,
      },
    })

    return NextResponse.json({ success: true, student })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create student' },
      { status: 500 }
    )
  }
}
