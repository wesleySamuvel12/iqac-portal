import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/achievements/[id] - Get achievement details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const achievement = await db.studentAchievement.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: { select: { id: true, name: true, code: true } }
          }
        }
      }
    })

    if (!achievement) {
      return NextResponse.json({ success: false, error: 'Achievement not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, achievement })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch achievement' }, { status: 500 })
  }
}

// PUT /api/achievements/[id] - Reject update on submitted locked achievements
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const achievement = await db.studentAchievement.findUnique({
      where: { id }
    })

    if (!achievement) {
      return NextResponse.json({ success: false, error: 'Achievement not found' }, { status: 404 })
    }

    // MANDATORY BACKEND LOCK ENFORCEMENT:
    // If the achievement has already been submitted (approvalStatus is PENDING, APPROVED, REJECTED, etc. and not DRAFT),
    // reject update request with a controlled 403 error.
    if (achievement.approvalStatus !== 'DRAFT') {
      return NextResponse.json(
        {
          success: false,
          error: 'This achievement has already been submitted and cannot be edited.'
        },
        { status: 403 }
      )
    }

    // If DRAFT, allow update...
    const body = await request.json()
    const updated = await db.studentAchievement.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        achievedDate: body.achievedDate ? new Date(body.achievedDate) : undefined,
        level: body.level,
        position: body.position,
        organizedBy: body.organizedBy,
        attachments: body.attachments,
      }
    })

    return NextResponse.json({ success: true, achievement: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update achievement' }, { status: 500 })
  }
}

// PATCH /api/achievements/[id] - Reject update on submitted locked achievements
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context)
}

// DELETE /api/achievements/[id] - Reject deletion on submitted locked achievements
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const achievement = await db.studentAchievement.findUnique({
      where: { id }
    })

    if (!achievement) {
      return NextResponse.json({ success: false, error: 'Achievement not found' }, { status: 404 })
    }

    if (achievement.approvalStatus !== 'DRAFT') {
      return NextResponse.json(
        {
          success: false,
          error: 'This achievement has already been submitted and cannot be edited or deleted.'
        },
        { status: 403 }
      )
    }

    await db.studentAchievement.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Achievement deleted' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete achievement' }, { status: 500 })
  }
}
