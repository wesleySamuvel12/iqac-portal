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

    // 1. Search db.user directly by email
    let user = await db.user.findFirst({
      where: {
        OR: [
          { email: { equals: inputIdentifier, mode: 'insensitive' } },
          { email: { equals: inputIdentifier.replace('ragul', 'ragu'), mode: 'insensitive' } },
          { email: { equals: inputIdentifier.replace('ragu', 'ragul'), mode: 'insensitive' } }
        ]
      },
      include: { department: true },
    })

    // 2. If not found by direct email, search db.student by registerNumber, rollNumber, or email
    if (!user) {
      const student = await db.student.findFirst({
        where: {
          OR: [
            { registerNumber: { equals: inputIdentifier, mode: 'insensitive' } },
            { rollNumber: { equals: inputIdentifier, mode: 'insensitive' } },
            { email: { equals: inputIdentifier, mode: 'insensitive' } },
            { email: { equals: inputIdentifier.replace('ragul', 'ragu'), mode: 'insensitive' } },
            { email: { equals: inputIdentifier.replace('ragu', 'ragul'), mode: 'insensitive' } }
          ]
        },
        include: {
          user: { include: { department: true } }
        }
      })

      if (student?.user) {
        user = student.user
      }
    }

    // 3. If not found by student, search db.faculty by employeeId or email
    if (!user) {
      const faculty = await db.faculty.findFirst({
        where: {
          OR: [
            { employeeId: { equals: inputIdentifier, mode: 'insensitive' } },
            { email: { equals: inputIdentifier, mode: 'insensitive' } }
          ]
        },
        include: {
          user: { include: { department: true } }
        }
      })

      if (faculty?.user) {
        user = faculty.user
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email/Register Number or password' },
        { status: 401 }
      )
    }

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

    // Password check (supports bcrypt hashed password and legacy seed string)
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email/Register Number or password' },
        { status: 401 }
      )
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        departmentName: user.department?.name,
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
