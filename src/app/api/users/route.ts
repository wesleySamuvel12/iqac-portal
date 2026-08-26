import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth-helpers'
import { UserRole, UserStatus } from '@prisma/client'

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
      // HOD can only create STAFF or STUDENT for their own department
      if (targetRole !== 'STAFF' && targetRole !== 'STUDENT') {
        return NextResponse.json(
          { success: false, error: 'HOD can only allocate Staff or Student credentials' },
          { status: 403 }
        )
      }
      // Force department to HOD's department
      targetDeptId = callerDeptId || targetDeptId
    } else if (callerRole === 'STAFF') {
      // Staff can only create STUDENT for their own department
      if (targetRole !== 'STUDENT') {
        return NextResponse.json(
          { success: false, error: 'Staff can only allocate Student credentials' },
          { status: 403 }
        )
      }
      // Force department to Staff's department
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

    // 4. Hash Password
    const hashedPassword = await hashPassword(password)

    // Creator Metadata
    const createdByLabel = callerName || (callerRole === 'ADMIN' ? 'Admin' : callerRole === 'HOD' ? 'HOD' : 'Staff')

    // 5. Create Central User & Link Existing / New Profiles inside transaction
    const result = await db.$transaction(async (tx) => {
      // Create user in central authentication table
      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: targetRole,
          departmentId: targetDeptId,
          phone: phone || null,
          isActive: true,
          status: 'ACTIVE',
          mustChangePassword: !!mustChangePassword,
          createdBy: createdByLabel,
          createdByRole: callerRole,
          createdById: callerId || null,
        },
        include: {
          department: true
        }
      })

      // Link or Create Profile (Faculty / Student)
      if (targetRole === 'HOD' || targetRole === 'STAFF') {
        const empId = employeeId ? employeeId.trim() : `EMP${Date.now().toString().slice(-6)}`
        // Check if Faculty profile already exists with this employeeId or email
        const existingFaculty = await tx.faculty.findUnique({
          where: { employeeId: empId }
        })

        if (existingFaculty) {
          // Allocate credentials to existing profile
          await tx.faculty.update({
            where: { id: existingFaculty.id },
            data: { userId: newUser.id, isHOD: targetRole === 'HOD' }
          })
        } else {
          // Create new Faculty profile
          await tx.faculty.create({
            data: {
              employeeId: empId,
              userId: newUser.id,
              departmentId: targetDeptId!,
              designation: designation || (targetRole === 'HOD' ? 'Head of Department' : 'Assistant Professor'),
              qualification: qualification || null,
              isHOD: targetRole === 'HOD'
            }
          })
        }
      } else if (targetRole === 'STUDENT') {
        const regNo = registerNumber ? registerNumber.trim() : `REG${Date.now().toString().slice(-6)}`
        // Check if Student profile already exists
        const existingStudent = await tx.student.findUnique({
          where: { registerNumber: regNo }
        })

        if (existingStudent) {
          // Allocate credentials to existing student profile
          await tx.student.update({
            where: { id: existingStudent.id },
            data: { userId: newUser.id }
          })
        } else {
          // Create new Student profile
          await tx.student.create({
            data: {
              registerNumber: regNo,
              userId: newUser.id,
              departmentId: targetDeptId!,
              semester: semester ? parseInt(semester) : 1,
              section: section || 'A',
              batch: batch || null
            }
          })
        }
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'CREATE_USER_CREDENTIALS',
          entityType: 'USER',
          entityId: newUser.id,
          newValue: JSON.stringify({
            role: newUser.role,
            email: newUser.email,
            createdBy: createdByLabel,
            createdById: callerId
          })
        }
      })

      return newUser
    })

    return NextResponse.json({
      success: true,
      message: 'Login credentials allocated successfully',
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        departmentId: result.departmentId,
        departmentName: result.department?.name,
        status: result.status,
        createdBy: result.createdBy,
        createdAt: result.createdAt
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user credentials:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user credentials' },
      { status: 500 }
    )
  }
}
