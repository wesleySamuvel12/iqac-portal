import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createOrUpdateUserAccount } from '@/lib/user-service'

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
      password = 'faculty123',
      createLoginAccess = true
    } = data

    if (!employeeId || !departmentId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and Department are required' },
        { status: 400 }
      )
    }

    const trimmedEmpId = employeeId.trim()
    const userEmail = (email ? email.trim() : `${trimmedEmpId.toLowerCase()}@niet.edu`).toLowerCase()
    const userName = name ? name.trim() : `Faculty ${trimmedEmpId}`

    console.log(`[HOD Add Staff] Creating staff: email="${userEmail}", employeeId="${trimmedEmpId}", role="${isHOD ? 'HOD' : 'STAFF'}", departmentId="${departmentId}"`)

    // Check if employee ID or email already exists
    const [existingFaculty, existingUser] = await Promise.all([
      db.faculty.findFirst({
        where: {
          OR: [
            { employeeId: trimmedEmpId },
            { email: userEmail }
          ]
        }
      }),
      db.user.findFirst({
        where: { email: userEmail }
      })
    ])

    if (existingUser || existingFaculty) {
      if (existingFaculty && existingFaculty.employeeId.toLowerCase() === trimmedEmpId.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: `Employee ID '${trimmedEmpId}' already exists` },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { success: false, error: `An account with email '${userEmail}' already exists` },
        { status: 409 }
      )
    }

    // Use createOrUpdateUserAccount to safely hash password and provision user + faculty records
    const result = await createOrUpdateUserAccount({
      name: userName,
      email: userEmail,
      password,
      role: isHOD ? 'HOD' : 'STAFF',
      departmentId,
      phone,
      employeeId: trimmedEmpId,
      designation: designation || (isHOD ? 'Head of Department' : 'Assistant Professor'),
      qualification,
      createLoginAccess: createLoginAccess !== false,
      createdBy: 'HOD'
    })

    console.log(`[HOD Add Staff SUCCESS] Created userId="${result.user?.id}", email="${result.user?.email}", role="${result.user?.role}", facultyId="${result.profile?.id}"`)

    // If extra faculty fields were provided, update them on the profile
    if (result.profile && (specialization || experience || dateOfJoining || researchArea)) {
      await db.faculty.update({
        where: { id: result.profile.id },
        data: {
          specialization: specialization || undefined,
          experience: experience ? parseFloat(experience) : undefined,
          dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
          researchArea: researchArea || undefined,
        }
      })
    }

    // Re-fetch created faculty profile with full user relation
    const faculty = await db.faculty.findUnique({
      where: { id: result.profile.id },
      include: {
        user: { select: { id: true, email: true, name: true, role: true, isActive: true } },
        department: true,
      }
    })

    return NextResponse.json({
      success: true,
      faculty,
      user: result.user,
      loginAccess: result.loginAccess
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating faculty:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create faculty' },
      { status: 500 }
    )
  }
}
