import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all faculty/staff or filter by department
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (departmentId) where.departmentId = departmentId
    if (search) {
      where.OR = [
        { employeeId: { contains: search, mode: 'insensitive' as const } },
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
        { designation: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    const [faculty, total] = await Promise.all([
      db.faculty.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true, role: true, phone: true, isActive: true } },
          department: { select: { id: true, name: true, code: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.faculty.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      faculty,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch faculty' },
      { status: 500 }
    )
  }
}

// POST - Create new faculty/staff
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { 
      employeeId, 
      email, 
      name, 
      phone,
      departmentId, 
      designation, 
      qualification, 
      specialization, 
      experience, 
      dateOfJoining, 
      researchArea,
      isHOD = false,
      password = 'faculty123'
    } = data

    if (!employeeId || !departmentId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and Department are required' },
        { status: 400 }
      )
    }

    // Check if employee ID already exists
    const existingFaculty = await db.faculty.findUnique({ where: { employeeId } })
    if (existingFaculty) {
      return NextResponse.json(
        { success: false, error: 'Employee ID already exists' },
        { status: 409 }
      )
    }

    // Create user account for faculty
    const userEmail = email || `${employeeId.toLowerCase()}@niet.edu`
    const userName = name || `Faculty ${employeeId}`
    
    const user = await db.user.create({
      data: {
        email: userEmail,
        password, // In production, hash this password
        name: userName,
        role: isHOD ? 'HOD' : 'STAFF',
        phone: phone || null,
        departmentId,
      }
    })

    const faculty = await db.faculty.create({
      data: {
        employeeId,
        userId: user.id,
        departmentId,
        designation,
        qualification,
        specialization,
        experience: experience ? parseFloat(experience) : null,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null,
        researchArea,
        isHOD,
      },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        department: true,
      },
    })

    return NextResponse.json({ success: true, faculty })
  } catch (error) {
    console.error('Error creating faculty:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create faculty' },
      { status: 500 }
    )
  }
}
