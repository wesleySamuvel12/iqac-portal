import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single faculty by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const faculty = await db.faculty.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true, role: true, phone: true, isActive: true } },
        department: { select: { id: true, name: true, code: true } },
        advisedBatches: {
          include: {
            department: { select: { name: true } },
          }
        },
        certifications: true,
        awards: true,
        projects: { where: { status: 'ONGOING' } },
      },
    })

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, faculty })
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch faculty' },
      { status: 500 }
    )
  }
}

// PUT - Update faculty
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // Check if faculty exists
    const existingFaculty = await db.faculty.findUnique({ where: { id } })
    if (!existingFaculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      )
    }

    // If employee ID is being changed, check for duplicates
    if (data.employeeId && data.employeeId !== existingFaculty.employeeId) {
      const duplicateFaculty = await db.faculty.findUnique({
        where: { employeeId: data.employeeId }
      })
      if (duplicateFaculty) {
        return NextResponse.json(
          { success: false, error: 'Employee ID already in use' },
          { status: 409 }
        )
      }
    }

    // Prepare update data for faculty
    const updateData: any = {}
    if (data.employeeId !== undefined) updateData.employeeId = data.employeeId
    if (data.departmentId !== undefined) updateData.departmentId = data.departmentId
    if (data.designation !== undefined) updateData.designation = data.designation
    if (data.qualification !== undefined) updateData.qualification = data.qualification
    if (data.specialization !== undefined) updateData.specialization = data.specialization
    if (data.experience !== undefined) updateData.experience = data.experience ? parseFloat(data.experience) : null
    if (data.dateOfJoining !== undefined) updateData.dateOfJoining = data.dateOfJoining ? new Date(data.dateOfJoining) : null
    if (data.researchArea !== undefined) updateData.researchArea = data.researchArea
    if (data.isHOD !== undefined) updateData.isHOD = data.isHOD
    if (data.approvalStatus !== undefined) updateData.approvalStatus = data.approvalStatus

    // Update faculty
    const faculty = await db.faculty.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        department: true,
      },
    })

    // Update user info if provided
    if (data.name || data.email || data.phone !== undefined || data.role) {
      const userData: any = {}
      if (data.name) userData.name = data.name
      if (data.email) userData.email = data.email
      if (data.phone !== undefined) userData.phone = data.phone
      if (data.role) userData.role = data.role
      
      if (faculty.userId) {
        await db.user.update({
          where: { id: faculty.userId },
          data: userData,
        })
      }
      
      // Re-fetch to get updated user data
      const updatedFaculty = await db.faculty.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, email: true, name: true, role: true, phone: true } },
          department: true,
        },
      })
      
      return NextResponse.json({ success: true, faculty: updatedFaculty })
    }

    return NextResponse.json({ success: true, faculty })
  } catch (error) {
    console.error('Error updating faculty:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update faculty' },
      { status: 500 }
    )
  }
}

// DELETE - Remove faculty
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if faculty exists
    const faculty = await db.faculty.findUnique({
      where: { id },
      include: { 
        user: true,
        advisedBatches: true,
      }
    })
    
    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty not found' },
        { status: 404 }
      )
    }

    // Check if faculty is advising any batches
    if (faculty.advisedBatches.length > 0) {
      // Remove advisor reference from batches
      await db.batch.updateMany({
        where: { advisorId: id },
        data: { advisorId: null },
      })
    }

    // Delete faculty and associated user
    await db.faculty.delete({ where: { id } })
    if (faculty.userId) {
      await db.user.delete({ where: { id: faculty.userId } })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Faculty deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting faculty:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete faculty' },
      { status: 500 }
    )
  }
}
