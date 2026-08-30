import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApprovalStatus } from '@prisma/client'

// GET /api/approvals - Fetch approval queue for Staff / HOD / Admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status') || 'PENDING'
    const stageParam = searchParams.get('stage')
    const departmentId = searchParams.get('departmentId')
    const entityType = searchParams.get('entityType')
    const callerRole = request.headers.get('x-user-role') || searchParams.get('role') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    const statusUpper = statusParam.toUpperCase() as ApprovalStatus
    const where: any = {}

    if (statusUpper === 'PENDING' || statusUpper === 'APPROVED' || statusUpper === 'REJECTED') {
      where.status = statusUpper
    }

    if (stageParam) {
      where.currentStage = stageParam
    } else if (callerRole === 'STAFF') {
      where.currentStage = 'STAFF_REVIEW'
    } else if (callerRole === 'HOD' && statusUpper === 'PENDING') {
      where.currentStage = 'HOD_REVIEW'
    }

    if (entityType) {
      where.entityType = entityType
    }

    // 1. Fetch existing Approval records
    const approvals = await db.approval.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // 2. Auto-fetch pending StudentAchievements that may lack an Approval entry
    const pendingAchievements = await db.studentAchievement.findMany({
      where: {
        approvalStatus: statusUpper === 'PENDING' ? 'PENDING' : statusUpper === 'APPROVED' ? 'APPROVED' : statusUpper === 'REJECTED' ? 'REJECTED' : undefined,
        ...(departmentId && departmentId !== 'ALL' && departmentId !== 'all' ? { student: { departmentId } } : {})
      },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: { select: { id: true, name: true, code: true } }
          }
        }
      }
    })

    const approvalEntityIds = new Set(approvals.map(a => a.entityId))

    // Auto-create missing Approval records for pending student achievements
    for (const ach of pendingAchievements) {
      if (!approvalEntityIds.has(ach.id)) {
        try {
          const newApp = await db.approval.create({
            data: {
              entityType: 'ACHIEVEMENT',
              entityId: ach.id,
              requestedBy: ach.student?.userId || ach.studentId,
              currentStage: ach.approvalStatus === 'APPROVED' ? 'APPROVED' : 'STAFF_REVIEW',
              status: ach.approvalStatus,
              comments: `Auto-registered submission for ${ach.student?.name || 'Student'}`
            }
          })
          approvals.push(newApp)
        } catch (e) {
          // Ignore duplicate creation race
        }
      }
    }

    // 3. Enrich approval items with complete student, department, and achievement details
    const enrichedApprovals = await Promise.all(
      approvals.map(async (app) => {
        let requesterUser: any = null
        let studentObj: any = null
        let entityData: any = null

        if (app.requestedBy) {
          requesterUser = await db.user.findUnique({
            where: { id: app.requestedBy },
            select: { id: true, name: true, email: true, role: true, departmentId: true }
          })

          if (!requesterUser) {
            studentObj = await db.student.findFirst({
              where: {
                OR: [
                  { id: app.requestedBy },
                  { userId: app.requestedBy }
                ]
              },
              include: {
                user: { select: { id: true, name: true, email: true } },
                department: { select: { id: true, name: true, code: true } }
              }
            })
          }
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

        const studentMeta = entityData?.student || studentObj
        const resolvedDeptId = studentMeta?.departmentId || requesterUser?.departmentId
        const resolvedDeptName = studentMeta?.department?.name || 'Department'
        const studentName = studentMeta?.name || studentMeta?.user?.name || requesterUser?.name || 'Student'
        const registerNumber = studentMeta?.registerNumber || 'N/A'

        return {
          ...app,
          departmentId: resolvedDeptId,
          departmentName: resolvedDeptName,
          studentName,
          registerNumber,
          requester: requesterUser || { name: studentName, email: studentMeta?.email },
          achievement: entityData,
        }
      })
    )

    // Filter by departmentId if specified
    let filteredItems = enrichedApprovals
    if (departmentId && departmentId !== 'ALL' && departmentId !== 'all') {
      filteredItems = enrichedApprovals.filter(item => item.departmentId === departmentId || !item.departmentId)
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

// POST /api/approvals - Direct Authorization (Staff approves Students, HOD approves Staff)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { approvalId, achievementId, action, comments, reviewedBy, reviewerRole, reviewerName } = data

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

    const actionLower = action.toLowerCase()
    const roleUpper = (reviewerRole || 'STAFF').toUpperCase()

    const updatedResult = await db.$transaction(async (tx) => {
      let nextStage = 'APPROVED'
      let finalStatus: ApprovalStatus = 'APPROVED'

      if (actionLower === 'reject') {
        finalStatus = 'REJECTED'
        nextStage = 'REJECTED'
      } else {
        finalStatus = 'APPROVED'
        nextStage = 'APPROVED'
      }

      let updatedApproval = null
      if (approval) {
        updatedApproval = await tx.approval.update({
          where: { id: approval.id },
          data: {
            status: finalStatus,
            currentStage: nextStage,
            reviewedBy: reviewerName || reviewedBy || roleUpper,
            reviewedAt: new Date(),
            comments: comments || (finalStatus === 'APPROVED' ? `Approved by ${roleUpper}` : 'Rejected'),
          }
        })
      }

      const targetAchievementId = achievementId || approval?.entityId
      let updatedAchievement = null

      if (targetAchievementId) {
        updatedAchievement = await tx.studentAchievement.update({
          where: { id: targetAchievementId },
          data: {
            approvalStatus: finalStatus
          },
          include: {
            student: {
              include: { user: true, department: true }
            }
          }
        })

        // Notify Student when approved or rejected
        if (updatedAchievement?.student?.userId) {
          await tx.notification.create({
            data: {
              title: `Achievement Submission ${finalStatus === 'APPROVED' ? 'Approved ✓' : 'Rejected ✕'}`,
              message: `Your achievement '${updatedAchievement.title}' has been ${finalStatus === 'APPROVED' ? 'approved by ' + (reviewerName || roleUpper) : 'rejected'}${comments ? ': ' + comments : ''}`,
              type: finalStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED',
              userId: updatedAchievement.student.userId,
              relatedId: updatedAchievement.id,
              entityType: 'ACHIEVEMENT'
            }
          })
        }

        // Notify HOD when a student achievement is approved by staff so HOD is updated
        if (finalStatus === 'APPROVED' && roleUpper === 'STAFF' && updatedAchievement?.student?.departmentId) {
          const hodUsers = await tx.user.findMany({
            where: {
              departmentId: updatedAchievement.student.departmentId,
              role: 'HOD'
            },
            select: { id: true }
          })
          for (const hod of hodUsers) {
            await tx.notification.create({
              data: {
                title: 'Student Achievement Approved',
                message: `Staff ${reviewerName || 'Staff'} approved student achievement '${updatedAchievement.title}' by ${updatedAchievement.student.name || 'Student'}.`,
                type: 'SYSTEM',
                userId: hod.id,
                relatedId: updatedAchievement.id,
                entityType: 'ACHIEVEMENT'
              }
            })
          }
        }
      }

      return { approval: updatedApproval, achievement: updatedAchievement, nextStage, finalStatus }
    })

    return NextResponse.json({
      success: true,
      message: `Submission ${updatedResult.finalStatus === 'APPROVED' ? 'approved successfully' : 'rejected'}`,
      approval: updatedResult.approval,
      achievement: updatedResult.achievement,
      stage: updatedResult.nextStage,
      status: updatedResult.finalStatus
    })
  } catch (error: any) {
    console.error('Error updating approval:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update approval' },
      { status: 500 }
    )
  }
}
