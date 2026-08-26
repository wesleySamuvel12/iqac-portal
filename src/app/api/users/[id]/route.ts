import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth-helpers'

// PUT /api/users/[id] - Update User Status, Reset Password, or Edit Details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      email,
      password,
      status,
      role,
      departmentId,
      phone,
      mustChangePassword,
      callerRole = 'ADMIN',
      callerDeptId
    } = body

    const existingUser = await db.user.findUnique({
      where: { id },
      include: { department: true }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Permission Enforcement
    if (callerRole === 'HOD') {
      if (existingUser.departmentId !== callerDeptId) {
        return NextResponse.json(
          { success: false, error: 'HOD can only manage users in their own department' },
          { status: 403 }
        )
      }
      if (existingUser.role !== 'STAFF' && existingUser.role !== 'STUDENT') {
        return NextResponse.json(
          { success: false, error: 'HOD cannot manage Admin or other HOD accounts' },
          { status: 403 }
        )
      }
      if (role && role !== existingUser.role) {
        return NextResponse.json(
          { success: false, error: 'HOD cannot change user roles' },
          { status: 403 }
        )
      }
    } else if (callerRole === 'STAFF') {
      if (existingUser.departmentId !== callerDeptId || existingUser.role !== 'STUDENT') {
        return NextResponse.json(
          { success: false, error: 'Staff can only manage Student accounts in their department' },
          { status: 403 }
        )
      }
      if (role && role !== 'STUDENT') {
        return NextResponse.json(
          { success: false, error: 'Staff cannot change user roles' },
          { status: 403 }
        )
      }
    }

    const updateData: any = {}

    if (name) updateData.name = name.trim()
    if (phone !== undefined) updateData.phone = phone
    if (departmentId && callerRole === 'ADMIN') updateData.departmentId = departmentId
    if (role && callerRole === 'ADMIN') updateData.role = role

    if (status) {
      if (['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
        updateData.status = status
        updateData.isActive = status === 'ACTIVE'
      }
    }

    if (mustChangePassword !== undefined) {
      updateData.mustChangePassword = !!mustChangePassword
    }

    if (email && email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const emailNorm = email.trim().toLowerCase()
      const checkEmail = await db.user.findUnique({ where: { email: emailNorm } })
      if (checkEmail && checkEmail.id !== id) {
        return NextResponse.json(
          { success: false, error: `Email '${emailNorm}' is already in use` },
          { status: 409 }
        )
      }
      updateData.email = emailNorm
    }

    if (password && password.trim().length > 0) {
      updateData.password = await hashPassword(password.trim())
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        mustChangePassword: true,
        departmentId: true,
        createdBy: true,
        createdByRole: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: { id: true, name: true, code: true }
        }
      }
    })

    // Create Audit Log
    await db.auditLog.create({
      data: {
        userId: id,
        action: 'UPDATE_USER_ACCOUNT',
        entityType: 'USER',
        entityId: id,
        newValue: JSON.stringify({ updatedFields: Object.keys(updateData) })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User account updated successfully',
      user: updatedUser
    })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Deactivate or Delete User Account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const callerRole = request.headers.get('x-user-role') || 'ADMIN'
    const callerDeptId = request.headers.get('x-user-department-id')

    const existingUser = await db.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    if (callerRole === 'HOD' && existingUser.departmentId !== callerDeptId) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 })
    }

    // Soft delete by setting status to INACTIVE
    await db.user.update({
      where: { id },
      data: { status: 'INACTIVE', isActive: false }
    })

    return NextResponse.json({ success: true, message: 'User account deactivated' })
  } catch (error: any) {
    console.error('Error deactivating user:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
