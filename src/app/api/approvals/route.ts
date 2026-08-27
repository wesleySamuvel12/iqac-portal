import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApprovalStatus } from '@prisma/client'

// GET /api/approvals - Fetch pending approval queue
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status') || 'PENDING'
    const departmentId = searchParams.get('departmentId')
    const entityType = searchParams.get('entityType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const statusUpper = statusParam.toUpperCase() as ApprovalStatus
    const where: any = {}

    if (statusUpper === 'PENDING' || statusUpper === 'APPROVED' || statusUpper === 'REJECTED') {
      where.status = statusUpper
    }

    if (entityType) {
      where.entityType = entityType
    }

    const [approvals, total] = await Promise.all([
      db.approval.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.approval.count({ where }),
    ])

    // Enrich approval items with associated details (e.g. StudentAchievement + Student + User + Department)
    const enrichedApprovals = await Promise.all(
      approvals.map(async (app) => {
        let requesterUser: any = null
        let entityData: any = null

        if (app.requestedBy) {
          requesterUser = await db.user.findUnique({
            where: { id: app.requestedBy },
            select: { id: true, name: true, email: true, role: true, departmentId: true }
          })
        }

        if (app.entityType === 'ACHIEVEMENT') {
          entityData = await db.studentAchievement.findUnique({
            where: { id: app.entityId },
            include: {
              student: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                  department: { select: { id: true, name: true, code: true } }
                }
              }
            }
          })
        }

        const deptId = entityData?.student?.departmentId || requesterUser?.departmentId
        const deptName = entityData?.student?.department?.name || 'Department'
        const studentName = entityData?.student?.name || entityData?.student?.user?.name || requesterUser?.name || 'Student'
        const registerNumber = entityData?.student?.registerNumber || 'N/A'

        return {
          ...app,
          departmentId: deptId,
          departmentName: deptName,
          studentName,
          registerNumber,
          requester: requesterUser || { name: studentName },
          achievement: entityData,
        }
      })
    )

    // Filter by departmentId if specified
    let filteredItems = enrichedApprovals
    if (departmentId) {
      filteredItems = enrichedApprovals.filter(item => item.departmentId === departmentId)
    }

    return NextResponse.json({
      success: true,
      approvals: filteredItems,
      pagination: { page, limit, total: filteredItems.length, pages: Math.ceil(filteredItems.length / limit) },
    })
  } catch (error: any) {
    console.error('Error fetching approvals:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch approvals' },
      { status: 500 }
    )
  }
}

// POST /api/approvals - Approve or Reject an item
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { approvalId, achievementId, action, comments, reviewedBy } = data

    if ((!approvalId && !achievementId) || !action) {
      return NextResponse.json(
        { success: false, error: 'Approval ID or Achievement ID, and Action are required' },
        { status: 400 }
      )
    }

    let approval: any = null

    if (approvalId) {
      approval = await db.approval.findUnique({ where: { id: approvalId } })
    }

    if (!approval && achievementId) {
      approval = await db.approval.findFirst({
        where: { entityType: 'ACHIEVEMENT', entityId: achievementId },
        orderBy: { createdAt: 'desc' }
      })
    }

    const actionUpper = action.toLowerCase()
    let newStatus: ApprovalStatus = actionUpper === 'approve' ? 'APPROVED' : 'REJECTED'

    const updatedResult = await db.$transaction(async (tx) => {
      let updatedApproval = null

      if (approval) {
        updatedApproval = await tx.approval.update({
          where: { id: approval.id },
          data: {
            status: newStatus,
            currentStage: newStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED',
            reviewedBy: reviewedBy || 'Staff',
            reviewedAt: new Date(),
            comments: comments || (newStatus === 'APPROVED' ? 'Approved' : 'Rejected'),
          }
        })
      }

      // If achievementId or approval.entityType === 'ACHIEVEMENT', update StudentAchievement table
      const targetAchievementId = achievementId || approval?.entityId
      let updatedAchievement = null

      if (targetAchievementId) {
        updatedAchievement = await tx.studentAchievement.update({
          where: { id: targetAchievementId },
          data: {
            approvalStatus: newStatus
          },
          include: {
            student: {
              include: { user: true }
            }
          }
        })

        // Create notification for student
        if (updatedAchievement?.student?.userId) {
          await tx.notification.create({
            data: {
              title: `Achievement Submission ${newStatus === 'APPROVED' ? 'Approved ✓' : 'Rejected ✕'}`,
              message: `Your achievement '${updatedAchievement.title}' has been ${newStatus === 'APPROVED' ? 'approved' : 'rejected'}${comments ? ': ' + comments : ''}`,
              type: newStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED',
              userId: updatedAchievement.student.userId,
              relatedId: updatedAchievement.id,
              entityType: 'ACHIEVEMENT'
            }
          })
        }
      }

      return { approval: updatedApproval, achievement: updatedAchievement }
    })

    return NextResponse.json({
      success: true,
      message: `Achievement ${newStatus === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
      approval: updatedResult.approval,
      achievement: updatedResult.achievement,
    })
  } catch (error: any) {
    console.error('Error updating approval:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update approval' },
      { status: 500 }
    )
  }
}
