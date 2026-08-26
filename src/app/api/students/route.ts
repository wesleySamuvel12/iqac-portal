import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth-helpers'

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
      password
    } = data

    if (!registerNumber || !departmentId) {
      return NextResponse.json(
        { success: false, error: 'Register Number and Department are required' },
        { status: 400 }
      )
    }

    const trimmedRegNo = registerNumber.trim()
    const userEmail = (email ? email.trim() : `${trimmedRegNo.toLowerCase()}@niet.ac.in`).toLowerCase()

    // Check if register number already exists
    const existingStudent = await db.student.findUnique({ where: { registerNumber: trimmedRegNo } })
    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: `Register number '${trimmedRegNo}' already exists` },
        { status: 409 }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email: userEmail } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: `Email '${userEmail}' already exists` },
        { status: 409 }
      )
    }

    // Hash initial password securely
    const rawPassword = password && password.trim() ? password.trim() : '12345678'
    const hashedPassword = await hashPassword(rawPassword)
    const userName = name ? name.trim() : `Student ${trimmedRegNo}`
    
    const student = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: userEmail,
          password: hashedPassword,
          name: userName,
          role: 'STUDENT',
          phone: phone || null,
          departmentId,
        }
      })

      return await tx.student.create({
        data: {
          registerNumber: trimmedRegNo,
          userId: user.id,
          departmentId,
          batchId: batchId || null,
          semester: semester ? parseInt(semester) : null,
          section: section || null,
          batch: batch || null,
          cgpa: cgpa ? parseFloat(cgpa) : null,
          admissionYear: admissionYear ? parseInt(admissionYear) : null,
        },
        include: {
          user: { select: { id: true, email: true, name: true, role: true } },
          department: true,
          batchInfo: true,
        },
      })
    })

    return NextResponse.json({ success: true, student })
  } catch (error: any) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create student' },
      { status: 500 }
    )
  }
}
