import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// CMS Portal - Separate authentication for Super Admin/Manager
// Credentials: Manager / Manager@1234

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Support both "Manager" username and "manager@niet.ac.in" email
    let lookupEmail = email.toLowerCase().trim()
    if (lookupEmail === 'manager') {
      lookupEmail = 'manager@niet.ac.in'
    }

    // Find user - only SUPER_ADMIN can access CMS portal
    const user = await db.user.findUnique({
      where: { email: lookupEmail },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Invalid CMS credentials or account inactive' },
        { status: 401 }
      )
    }

    // CMS Portal is only for SUPER_ADMIN users
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Access denied. CMS portal is restricted to Super Administrators.' },
        { status: 403 }
      )
    }

    // Password check
    const isPasswordValid = user.password === password

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid CMS credentials' },
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
        departmentName: null, // Super Admin doesn't belong to a department
      },
    })
  } catch (error) {
    console.error('CMS Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
