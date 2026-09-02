import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createOrUpdateUserAccount } from '@/lib/user-service'

// GET all students or filter by department/batch
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const batchId = searchParams.get('batchId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const search = searchParams.get('search') || ''
    const semester = searchParams.get('semester')

    const where: any = {}

    // Resolve valid departmentId (supports department code, ID cuid, or ignore if 'ALL'/'undefined'/'null')
    if (departmentId && departmentId !== 'undefined' && departmentId !== 'null' && departmentId !== 'ALL' && departmentId !== 'all') {
      const dept = await db.department.findFirst({
        where: {
          OR: [
            { id: departmentId },
            { code: departmentId }
          ]
        },
        select: { id: true }
      })
      if (dept) {
        where.departmentId = dept.id
      } else {
        where.departmentId = departmentId
      }
    }

    if (batchId) where.batchId = batchId
    if (semester) where.semester = parseInt(semester)
    if (search) {
      where.OR = [
        { registerNumber: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
      ]
    }

    const [students, total] = await Promise.all([
      db.student.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true, role: true, phone: true, status: true, isActive: true } },
          department: { select: { id: true, name: true, code: true } },
          batchInfo: { select: { id: true, name: true, year: true, section: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { registerNumber: 'asc' },
      }),
      db.student.count({ where }),
    ])

    const formattedStudents = students.map(s => ({
      ...s,
      name: s.name || s.user?.name || `Student (${s.registerNumber})`,
      email: s.email || s.user?.email || '',
      phone: s.phone || s.user?.phone || null,
    }))

    return NextResponse.json({
      success: true,
      students: formattedStudents,
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
      password,
      createLoginAccess = true
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

    // If createLoginAccess is true, check existing user email
    if (createLoginAccess) {
      const existingUser = await db.user.findUnique({ where: { email: userEmail } })
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: `Email '${userEmail}' already exists` },
          { status: 409 }
        )
      }
    }

    const userName = name ? name.trim() : `Student ${trimmedRegNo}`

    const result = await createOrUpdateUserAccount({
      name: userName,
      email: userEmail,
      password,
      role: 'STUDENT',
      departmentId,
      phone,
      registerNumber: trimmedRegNo,
      semester: semester ? parseInt(String(semester)) : 1,
      section: section || 'A',
      batch: batch || null,
      createLoginAccess: createLoginAccess !== false,
      createdBy: 'API'
    })

    return NextResponse.json({
      success: true,
      student: result.profile,
      user: result.user,
      loginAccess: result.loginAccess,
      rawPassword: result.rawPassword
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create student' },
      { status: 500 }
    )
  }
}

