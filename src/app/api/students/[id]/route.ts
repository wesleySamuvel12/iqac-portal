import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const student = await db.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true, role: true, phone: true, isActive: true } },
        department: { select: { id: true, name: true, code: true } },
        batchInfo: { 
          select: { id: true, name: true, year: true, section: true },
          include: { advisor: { include: { user: { select: { name: true } } } } }
        },
        achievements: true,
        certifications: true,
        placements: true,
      },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, student })
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student' },
      { status: 500 }
    )
  }
}

// PUT - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // Check if student exists
    const existingStudent = await db.student.findUnique({ where: { id } })
    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // If register number is being changed, check for duplicates
    if (data.registerNumber && data.registerNumber !== existingStudent.registerNumber) {
      const duplicateStudent = await db.student.findUnique({
        where: { registerNumber: data.registerNumber }
      })
      if (duplicateStudent) {
        return NextResponse.json(
          { success: false, error: 'Register number already in use' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (data.registerNumber !== undefined) updateData.registerNumber = data.registerNumber
    if (data.departmentId !== undefined) updateData.departmentId = data.departmentId
    if (data.batchId !== undefined) updateData.batchId = data.batchId
    if (data.semester !== undefined) updateData.semester = data.semester ? parseInt(data.semester) : null
    if (data.section !== undefined) updateData.section = data.section
    if (data.batch !== undefined) updateData.batch = data.batch
    if (data.cgpa !== undefined) updateData.cgpa = data.cgpa ? parseFloat(data.cgpa) : null
    if (data.admissionYear !== undefined) updateData.admissionYear = data.admissionYear ? parseInt(data.admissionYear) : null
    if (data.graduationYear !== undefined) updateData.graduationYear = data.graduationYear ? parseInt(data.graduationYear) : null
    if (data.approvalStatus !== undefined) updateData.approvalStatus = data.approvalStatus

    // Update student
    const student = await db.student.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        department: true,
        batchInfo: true,
      },
    })

    // Update user info if provided
    if (data.name || data.email || data.phone !== undefined) {
      const userData: any = {}
      if (data.name) userData.name = data.name
      if (data.email) userData.email = data.email
      if (data.phone !== undefined) userData.phone = data.phone
      
      await db.user.update({
        where: { id: student.userId },
        data: userData,
      })
      
      // Re-fetch to get updated user data
      const updatedStudent = await db.student.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, email: true, name: true, role: true, phone: true } },
          department: true,
          batchInfo: true,
        },
      })
      
      return NextResponse.json({ success: true, student: updatedStudent })
    }

    return NextResponse.json({ success: true, student })
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update student' },
      { status: 500 }
    )
  }
}

// DELETE - Remove student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if student exists
    const student = await db.student.findUnique({
      where: { id },
      include: { user: true }
    })
    
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Delete student and associated user
    await db.student.delete({ where: { id } })
    await db.user.delete({ where: { id: student.userId } })

    return NextResponse.json({ 
      success: true, 
      message: 'Student deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}
