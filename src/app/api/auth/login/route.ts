import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/Register Number and password are required' },
        { status: 400 }
      )
    }

    const inputIdentifier = email.trim().toLowerCase()

    // 1. First, search db.user directly by email or matching employeeId/registerNumber via relations
    let user = await db.user.findFirst({
      where: {
        OR: [
          { email: { equals: inputIdentifier, mode: 'insensitive' } },
          { faculty: { employeeId: { equals: inputIdentifier, mode: 'insensitive' } } },
          { faculty: { email: { equals: inputIdentifier, mode: 'insensitive' } } },
          { student: { some: { registerNumber: { equals: inputIdentifier, mode: 'insensitive' } } } },
          { student: { some: { rollNumber: { equals: inputIdentifier, mode: 'insensitive' } } } },
          { student: { some: { email: { equals: inputIdentifier, mode: 'insensitive' } } } },
        ]
      },
      include: { department: true, faculty: true, student: true },
    })

    // 2. If not found by direct user query, search db.faculty by employeeId or email
    if (!user) {
      const faculty = await db.faculty.findFirst({
        where: {
          OR: [
            { employeeId: { equals: inputIdentifier, mode: 'insensitive' } },
            { email: { equals: inputIdentifier, mode: 'insensitive' } }
          ]
        },
        include: {
          user: { include: { department: true, faculty: true, student: true } }
        }
      })

      if (faculty?.user) {
        user = faculty.user
      } else if (faculty) {
        // Faculty exists but userId link was missing. Find matching User or repair link!
        const matchingUser = await db.user.findFirst({
          where: { email: { equals: faculty.email || inputIdentifier, mode: 'insensitive' } },
          include: { department: true, faculty: true, student: true }
        })
        if (matchingUser) {
          await db.faculty.update({
            where: { id: faculty.id },
            data: { userId: matchingUser.id }
          })
          user = matchingUser
        }
      }
    }

    // 3. If still not found, search db.student by registerNumber, rollNumber, or email
    if (!user) {
      const student = await db.student.findFirst({
        where: {
          OR: [
            { registerNumber: { equals: inputIdentifier, mode: 'insensitive' } },
            { rollNumber: { equals: inputIdentifier, mode: 'insensitive' } },
            { email: { equals: inputIdentifier, mode: 'insensitive' } }
          ]
        },
        include: {
          user: { include: { department: true, faculty: true, student: true } }
        }
      })

      if (student?.user) {
        user = student.user
      } else if (student) {
        // Student exists but userId link was missing. Find matching User or repair link!
        const matchingUser = await db.user.findFirst({
          where: { email: { equals: student.email || inputIdentifier, mode: 'insensitive' } },
          include: { department: true, faculty: true, student: true }
        })
        if (matchingUser) {
          await db.student.update({
            where: { id: student.id },
            data: { userId: matchingUser.id }
          })
          user = matchingUser
        }
      }
    }

    console.log(`[Auth Login Attempt] identifier="${inputIdentifier}"`)

    if (!user) {
      console.warn(`[Auth Login Failed] Account not found for identifier="${inputIdentifier}"`)
      return NextResponse.json(
        { success: false, error: 'Invalid email/Register Number/Employee ID or password' },
        { status: 401 }
      )
    }

    // Password check (supports bcrypt hashed password and legacy seed string)
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      console.warn(`[Auth Login Failed] Password mismatch for user email="${user.email}"`)
      return NextResponse.json(
        { success: false, error: 'Invalid email/Register Number/Employee ID or password' },
        { status: 401 }
      )
    }

    // Role Verification and Auto-Correction:
    // If the account has a linked Faculty profile, it must be STAFF or HOD (never STUDENT).
    let correctRole = (user.role as string || '').toUpperCase()

    if (user.faculty && correctRole !== 'HOD' && correctRole !== 'ADMIN' && correctRole !== 'SUPER_ADMIN') {
      correctRole = 'STAFF'
    } else if (user.student && user.student.length > 0 && correctRole !== 'STAFF' && correctRole !== 'HOD' && correctRole !== 'ADMIN' && correctRole !== 'SUPER_ADMIN') {
      correctRole = 'STUDENT'
    }

    // Persist role correction in DB if misaligned
    if (correctRole !== user.role) {
      try {
        await db.user.update({
          where: { id: user.id },
          data: { role: correctRole as any }
        })
        console.log(`[Auth Role Auto-Repaired] userId="${user.id}", oldRole="${user.role}", newRole="${correctRole}"`)
        user.role = correctRole as any
      } catch (e) {
        console.error('Failed to update corrected role in DB:', e)
      }
    }

    console.log(`[Auth Login SUCCESS] userId="${user.id}", email="${user.email}", resolvedRole="${correctRole}", facultyId="${user.faculty?.id || 'none'}"`)

    // Check account status - auto-activate if valid login credentials
    if (!user.isActive || user.status !== 'ACTIVE') {
      try {
        await db.user.update({
          where: { id: user.id },
          data: { isActive: true, status: 'ACTIVE' }
        })
        user.isActive = true
        user.status = 'ACTIVE'
      } catch (e) {
        // Ignore activation update error
      }
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    // Resolve fallback department ID & Name from linked Faculty or Student record if missing on User
    let resolvedDepartmentId = user.departmentId || user.faculty?.departmentId || (user.student && user.student[0]?.departmentId)
    let resolvedDepartmentName = user.department?.name || user.faculty?.department?.name || (user.student && user.student[0]?.department?.name)

    if (!resolvedDepartmentName && resolvedDepartmentId) {
      try {
        const deptObj = await db.department.findUnique({
          where: { id: resolvedDepartmentId },
          select: { name: true }
        })
        if (deptObj) resolvedDepartmentName = deptObj.name
      } catch (e) {
        // Ignore fallback fetch error
      }
    }

    // Auto-repair User.departmentId in database if misaligned
    if (resolvedDepartmentId && user.departmentId !== resolvedDepartmentId) {
      try {
        await db.user.update({
          where: { id: user.id },
          data: { departmentId: resolvedDepartmentId }
        })
      } catch (e) {
        // Ignore update error
      }
    }

    // Return user without password
    const { password: _, faculty: __, student: ___, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        role: correctRole,
        departmentId: resolvedDepartmentId || undefined,
        departmentName: resolvedDepartmentName || 'Department',
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
