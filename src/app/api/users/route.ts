import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { createOrUpdateUserAccount } from '@/lib/user-service'

// GET /api/users - List users with role & department filters & security checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roleParam = searchParams.get('role')
    const departmentIdParam = searchParams.get('departmentId')
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Context headers passed from frontend caller
    const callerRole = request.headers.get('x-user-role') || 'ADMIN'
    const callerDeptId = request.headers.get('x-user-department-id')

    const where: any = {}

    // Permission enforcement on listing
    if (callerRole === 'HOD' && callerDeptId) {
      where.departmentId = callerDeptId
      // HOD can only manage Staff & Students in their department
      if (roleParam && (roleParam === 'STAFF' || roleParam === 'STUDENT')) {
        where.role = roleParam
      } else {
        where.role = { in: ['STAFF', 'STUDENT'] }
      }
    } else if (callerRole === 'STAFF' && callerDeptId) {
      where.departmentId = callerDeptId
      where.role = 'STUDENT'
    } else {
      // Admin / Super Admin or unconstrained
      if (roleParam) {
        where.role = roleParam as UserRole
      }
      if (departmentIdParam) {
        where.departmentId = departmentIdParam
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          avatar: true,
          isActive: true,
          status: true,
          mustChangePassword: true,
          createdBy: true,
          createdByRole: true,
          createdById: true,
          departmentId: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          department: {
            select: { id: true, name: true, code: true }
          },
          faculty: {
            select: { id: true, employeeId: true, designation: true }
          },
          student: {
            select: { id: true, registerNumber: true, semester: true, section: true }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create or Allocate Login Credentials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      role = 'STAFF',
      departmentId,
      phone,
      registerNumber,
      employeeId,
      designation,
      qualification,
      semester,
      section,
      batch,
      mustChangePassword = false,
      callerId,
      callerName,
      callerRole = 'ADMIN',
      callerDeptId
    } = body

    // 1. Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 2. Permission Matrix Enforcement
    let targetRole: UserRole = (role as string).toUpperCase() as UserRole
    let targetDeptId: string | null = departmentId || null

    if (callerRole === 'HOD') {
      if (targetRole !== 'STAFF' && targetRole !== 'STUDENT') {
        return NextResponse.json(
          { success: false, error: 'HOD can only allocate Staff or Student credentials' },
          { status: 403 }
        )
      }
      targetDeptId = callerDeptId || targetDeptId
    } else if (callerRole === 'STAFF') {
      if (targetRole !== 'STUDENT') {
        return NextResponse.json(
          { success: false, error: 'Staff can only allocate Student credentials' },
          { status: 403 }
        )
      }
      targetDeptId = callerDeptId || targetDeptId
    }

    if (!targetDeptId && targetRole !== 'ADMIN' && targetRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Department is required for HOD, Staff, and Student roles' },
        { status: 400 }
      )
    }

    // 3. Duplicate Email Check
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { department: true }
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          error: 'Account already exists',
          existingUser: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            departmentName: existingUser.department?.name || 'N/A',
            status: existingUser.status || (existingUser.isActive ? 'ACTIVE' : 'INACTIVE')
          }
        },
        { status: 409 }
      )
    }

    const createdByLabel = callerName || (callerRole === 'ADMIN' ? 'Admin' : callerRole === 'HOD' ? 'HOD' : 'Staff')

    const result = await createOrUpdateUserAccount({
      name,
      email: normalizedEmail,
      password,
      role: targetRole,
      departmentId: targetDeptId,
      phone,
      registerNumber,
      employeeId,
      designation,
      qualification,
      semester,
      section,
      batch,
      createLoginAccess: true,
      mustChangePassword: !!mustChangePassword,
      createdBy: createdByLabel,
      createdByRole: callerRole,
      createdById: callerId,
    })

    return NextResponse.json({
      success: true,
      message: 'Login credentials allocated successfully',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        departmentId: result.user.departmentId,
        departmentName: result.user.department?.name,
        status: result.user.status,
        createdBy: result.user.createdBy,
        createdAt: result.user.createdAt
      },
      profile: result.profile
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user credentials:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user credentials' },
      { status: 500 }
    )
  }
}

