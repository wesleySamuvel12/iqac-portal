import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (departmentId) where.departmentId = departmentId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { employeeId: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    const [faculty, total] = await Promise.all([
      db.faculty.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true, role: true } },
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { employeeId, userId, departmentId, designation, qualification, specialization, experience, dateOfJoining, researchArea } = data

    if (!employeeId || !userId || !departmentId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID, User ID, and Department are required' },
        { status: 400 }
      )
    }

    // Check if employee ID already exists
    const existingEmployee = await db.faculty.findUnique({ where: { employeeId } })
    if (existingEmployee) {
      return NextResponse.json(
        { success: false, error: 'Employee ID already exists' },
        { status: 409 }
      )
    }

    const faculty = await db.faculty.create({
      data: {
        employeeId,
        userId,
        departmentId,
        designation,
        qualification,
        specialization,
        experience: experience ? parseFloat(experience) : null,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null,
        researchArea,
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
