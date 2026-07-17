import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const entityType = searchParams.get('entityType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = { status }
    if (entityType) where.entityType = entityType

    const [approvals, total] = await Promise.all([
      db.approval.findMany({
        where,
        include: {
          requester: { select: { id: true, name: true, email: true, role: true } },
          reviewer: { select: { id: true, name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.approval.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      approvals,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching approvals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch approvals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { approvalId, action, comments, reviewedBy } = data

    if (!approvalId || !action || !reviewedBy) {
      return NextResponse.json(
        { success: false, error: 'Approval ID, Action, and Reviewer are required' },
        { status: 400 }
      )
    }

    // Get current approval
    const existingApproval = await db.approval.findUnique({ where: { id: approvalId } })
    if (!existingApproval) {
      return NextResponse.json(
        { success: false, error: 'Approval not found' },
        { status: 404 }
      )
    }

    let newStatus
    let newStage = existingApproval.currentStage

    if (action === 'approve') {
      // Move to next stage or approve
      if (existingApproval.currentStage === 'STAFF_REVIEW') {
        newStage = 'HOD_REVIEW'
        newStatus = 'PENDING'
      } else if (existingApproval.currentStage === 'HOD_REVIEW') {
        newStage = 'ADMIN_REVIEW'
        newStatus = 'PENDING'
      } else if (existingApproval.currentStage === 'ADMIN_REVIEW') {
        newStage = 'APPROVED'
        newStatus = 'APPROVED'
      } else {
        newStatus = 'APPROVED'
        newStage = 'APPROVED'
      }
    } else if (action === 'reject') {
      newStatus = 'REJECTED'
      newStage = 'REJECTED'
    } else if (action === 'request_revision') {
      newStatus = 'NEEDS_REVISION'
      newStage = 'NEEDS_REVISION'
    }

    const approval = await db.approval.update({
      where: { id: approvalId },
      data: {
        status: newStatus,
        currentStage: newStage,
        reviewedBy,
        reviewedAt: new Date(),
        comments,
      },
    })

    // Create notification for the requester
    await db.notification.create({
      data: {
        title: `Submission ${action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Needs Revision'}`,
        message: `Your submission has been ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'sent back for revision'}${comments ? ': ' + comments : ''}`,
        type: action === 'approve' ? 'APPROVED' : 'REJECTED',
        userId: existingApproval.requestedBy,
        relatedId: approvalId,
        entityType: existingApproval.entityType,
      },
    })

    return NextResponse.json({ success: true, approval })
  } catch (error) {
    console.error('Error updating approval:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update approval' },
      { status: 500 }
    )
  }
}
