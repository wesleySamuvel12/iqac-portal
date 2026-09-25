import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single batch by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const batch = await db.batch.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true, code: true } },
        advisor: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            department: { select: { name: true } }
          }
        },
        students: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
          orderBy: { registerNumber: 'asc' }
        },
        _count: {
          select: { students: true }
        }
      },
    })

    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, batch })
  } catch (error) {
    console.error('Error fetching batch:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batch' },
      { status: 500 }
    )
  }
}

// PUT - Update batch
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // Check if batch exists
    const existingBatch = await db.batch.findUnique({ where: { id } })
    if (!existingBatch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      )
    }

    // If name is being changed, check for duplicates in same department
    if (data.name && data.name !== existingBatch.name) {
      const duplicateBatch = await db.batch.findFirst({
        where: {
          name: data.name,
          departmentId: data.departmentId || existingBatch.departmentId,
          id: { not: id },
        }
      })
      
      if (duplicateBatch) {
        return NextResponse.json(
          { success: false, error: 'A batch with this name already exists in this department' },
          { status: 409 }
        )
      }
    }

    // Validate advisor exists and belongs to same department if provided
    if (data.advisorId) {
      const advisor = await db.faculty.findUnique({
        where: { id: data.advisorId },
        include: { department: true }
      })
      
      if (!advisor) {
        return NextResponse.json(
          { success: false, error: 'Advisor not found' },
          { status: 404 }
        )
      }
      
      const deptId = data.departmentId || existingBatch.departmentId
      if (advisor.departmentId !== deptId) {
        return NextResponse.json(
          { success: false, error: 'Advisor must belong to the same department' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.year !== undefined) updateData.year = parseInt(data.year)
    if (data.departmentId !== undefined) updateData.departmentId = data.departmentId
    if (data.section !== undefined) updateData.section = data.section
    if (data.strength !== undefined) updateData.strength = data.strength ? parseInt(data.strength) : null
    if (data.advisorId !== undefined) updateData.advisorId = data.advisorId
    if (data.description !== undefined) updateData.description = data.description
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    // Update batch
    const batch = await db.batch.update({
      where: { id },
      data: updateData,
      include: {
        department: { select: { id: true, name: true, code: true } },
        advisor: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        _count: {
          select: { students: true }
        }
      },
    })

    return NextResponse.json({ success: true, batch })
  } catch (error) {
    console.error('Error updating batch:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update batch' },
      { status: 500 }
    )
  }
}

// DELETE - Remove batch
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if batch exists and get students count
    const batch = await db.batch.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true }
        }
      }
    })
    
    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      )
    }

    // Check if batch has students assigned
    if (batch._count.students > 0) {
      // Unlink students from this batch
      await db.student.updateMany({
        where: { batchId: id },
        data: { batchId: null },
      })
    }

    // Delete batch
    await db.batch.delete({ where: { id } })

    return NextResponse.json({ 
      success: true, 
      message: `Batch deleted successfully. ${batch._count.students > 0 ? `${batch._count.students} students were unlinked.` : ''}` 
    })
  } catch (error) {
    console.error('Error deleting batch:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete batch' },
      { status: 500 }
    )
  }
}
