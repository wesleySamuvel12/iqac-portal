import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const semester = searchParams.get('semester')

    const where: any = {}
    if (departmentId) where.departmentId = departmentId
    if (semester) where.semester = parseInt(semester)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { registerNumber: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    const [students, total] = await Promise.all([
      db.student.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true, role: true } },
          department: { select: { id: true, name: true, code: true } },
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { registerNumber, userId, departmentId, semester, section, batch, cgpa, admissionYear } = data

    if (!registerNumber || !userId || !departmentId) {
      return NextResponse.json(
        { success: false, error: 'Register Number, User ID, and Department are required' },
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

    const student = await db.student.create({
      data: {
        registerNumber,
        userId,
        departmentId,
        semester: semester ? parseInt(semester) : null,
        section,
        batch,
        cgpa: cgpa ? parseFloat(cgpa) : null,
        admissionYear: admissionYear ? parseInt(admissionYear) : null,
      },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        department: true,
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
