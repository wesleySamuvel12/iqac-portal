import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApprovalStatus } from '@prisma/client'

// GET /api/approvals - Role-Based Approval Queue & Monitoring
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status') || 'PENDING'
    const stageParam = searchParams.get('stage')
    const departmentId = searchParams.get('departmentId')
    const entityType = searchParams.get('entityType')
    const mode = searchParams.get('mode') || 'actionable' // 'actionable' | 'monitoring'
    const callerRole = (request.headers.get('x-user-role') || searchParams.get('role') || '').toUpperCase()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {}

    // Stage & Role Filter
    if (stageParam) {
      where.currentStage = stageParam
    } else if (callerRole === 'STAFF' && mode === 'actionable') {
      where.currentStage = 'STAFF_REVIEW'
    } else if (callerRole === 'HOD' && mode === 'actionable') {
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
    if (mode !== 'monitoring') {
      const pendingAchievements = await db.studentAchievement.findMany({
        where: {
          approvalStatus: 'PENDING',
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

      for (const ach of pendingAchievements) {
        if (!approvalEntityIds.has(ach.id)) {
          try {
            const newApp = await db.approval.create({
              data: {
                entityType: 'ACHIEVEMENT',
                entityId: ach.id,
                requestedBy: ach.student?.userId || ach.studentId,
                currentStage: 'STAFF_REVIEW',
                status: 'PENDING',
                comments: `Auto-registered submission for student ${ach.student?.name || 'Student'}`
              }
            })
            approvals.push(newApp)
          } catch (e) {
            // Ignore duplicate creation race
          }
        }
      }
    }

    // 3. Enrich approval items with complete submitter, department, and achievement details
    const enrichedApprovals = await Promise.all(
      approvals.map(async (app) => {
        let requesterUser: any = null
        let studentObj: any = null
        let facultyObj: any = null
        let entityData: any = null

        if (app.requestedBy) {
          requesterUser = await db.user.findUnique({
            where: { id: app.requestedBy },
            select: { id: true, name: true, email: true, role: true, departmentId: true }
          })

          if (!requesterUser) {
            studentObj = await db.student.findFirst({
              where: { OR: [{ id: app.requestedBy }, { userId: app.requestedBy }] },
              include: {
                user: { select: { id: true, name: true, email: true, role: true } },
                department: { select: { id: true, name: true, code: true } }
              }
            })

            if (!studentObj) {
              facultyObj = await db.faculty.findFirst({
                where: { OR: [{ id: app.requestedBy }, { userId: app.requestedBy }] },
                include: {
                  user: { select: { id: true, name: true, email: true, role: true } },
                  department: { select: { id: true, name: true, code: true } }
                }
              })
            }
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
        const submitterRole = requesterUser?.role || (studentMeta ? 'STUDENT' : facultyObj ? 'STAFF' : 'STUDENT')
        const resolvedDeptId = studentMeta?.departmentId || facultyObj?.departmentId || requesterUser?.departmentId
        const resolvedDeptName = studentMeta?.department?.name || facultyObj?.department?.name || 'Department'
        const submitterName = studentMeta?.name || studentMeta?.user?.name || facultyObj?.name || facultyObj?.user?.name || requesterUser?.name || 'Student'
        const registerNumber = studentMeta?.registerNumber || facultyObj?.employeeId || 'N/A'

        let displayStatus = app.status === 'APPROVED' 
          ? (submitterRole === 'STUDENT' ? 'Approved by Staff' : 'Approved by HOD')
          : app.status === 'REJECTED'
          ? (submitterRole === 'STUDENT' ? 'Rejected by Staff' : 'Rejected by HOD')
          : (submitterRole === 'STUDENT' ? 'Pending Staff Approval' : 'Pending HOD Approval')

        return {
          ...app,
          submitterRole,
          departmentId: resolvedDeptId,
          departmentName: resolvedDeptName,
          studentName: submitterName,
          registerNumber,
          displayStatus,
          requiredApproverRole: submitterRole === 'STUDENT' ? 'STAFF' : 'HOD',
          requester: requesterUser || { name: submitterName, email: studentMeta?.email || facultyObj?.email, role: submitterRole },
          achievement: entityData,
        }
      })
    )

    // Filter by role & department
    let filteredItems = enrichedApprovals

    if (callerRole === 'STAFF' && mode === 'actionable') {
      filteredItems = enrichedApprovals.filter(item => item.submitterRole === 'STUDENT')
    } else if (callerRole === 'HOD' && mode === 'actionable') {
      filteredItems = enrichedApprovals.filter(item => item.submitterRole === 'STAFF' || item.currentStage === 'HOD_REVIEW')
    }

    if (departmentId && departmentId !== 'ALL' && departmentId !== 'all') {
      filteredItems = filteredItems.filter(item => item.departmentId === departmentId || !item.departmentId)
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

// POST /api/approvals - Strict Role-Based Approval Authorization
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { approvalId, achievementId, action, comments, reviewedBy, reviewerRole, reviewerName, reviewerDeptId } = data

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
    const callerRoleUpper = (reviewerRole || request.headers.get('x-user-role') || 'STAFF').toUpperCase()

    // 1. Identify Submitter Role & Target Metadata
    let submitterRole = 'STUDENT'
    let targetDeptId = ''
    let achievementData: any = null

    const targetAchievementId = achievementId || approval?.entityId

    if (targetAchievementId) {
      achievementData = await db.studentAchievement.findUnique({
        where: { id: targetAchievementId },
        include: {
          student: {
            include: { user: true, department: true }
          }
        }
      })
      if (achievementData?.student) {
        submitterRole = 'STUDENT'
        targetDeptId = achievementData.student.departmentId
      }
    }

    if (!achievementData && approval?.requestedBy) {
      const requesterUser = await db.user.findUnique({ where: { id: approval.requestedBy } })
      if (requesterUser) {
        submitterRole = requesterUser.role
        targetDeptId = requesterUser.departmentId || ''
      }
    }

    // 2. BACKEND PERMISSION ENFORCEMENT (REQUIREMENT #5 & #6)
    if (submitterRole === 'STUDENT') {
      // ONLY STAFF can approve or reject Student achievements!
      if (callerRoleUpper === 'HOD') {
        return NextResponse.json(
          {
            success: false,
            error: '403 Forbidden: You are not authorized to approve student achievements. Only department staff can approve student achievements.'
          },
          { status: 403 }
        )
      }
      if (callerRoleUpper === 'STUDENT') {
        return NextResponse.json(
          { success: false, error: '403 Forbidden: Students cannot approve achievements.' },
          { status: 403 }
        )
      }
    } else if (submitterRole === 'STAFF' || submitterRole === 'FACULTY') {
      // ONLY HOD can approve or reject Staff achievements!
      if (callerRoleUpper === 'STAFF') {
        return NextResponse.json(
          {
            success: false,
            error: '403 Forbidden: Only HOD can approve staff achievements.'
          },
          { status: 403 }
        )
      }
      if (callerRoleUpper === 'STUDENT') {
        return NextResponse.json(
          { success: false, error: '403 Forbidden: Students cannot approve achievements.' },
          { status: 403 }
        )
      }
    }

    // Department Isolation Check
    if (reviewerDeptId && targetDeptId && reviewerDeptId !== targetDeptId && callerRoleUpper !== 'SUPER_ADMIN' && callerRoleUpper !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: `403 Forbidden: You can only process approval records within your own department.` },
        { status: 403 }
      )
    }

    // 3. Process Approval/Rejection in Transaction with Audit Trail
    const updatedResult = await db.$transaction(async (tx) => {
      let nextStage = 'APPROVED'
      let finalStatus: ApprovalStatus = 'APPROVED'
      let statusText = ''

      if (actionLower === 'reject') {
        finalStatus = 'REJECTED'
        nextStage = 'REJECTED'
        statusText = submitterRole === 'STUDENT' ? 'REJECTED_BY_STAFF' : 'REJECTED_BY_HOD'
      } else {
        finalStatus = 'APPROVED'
        nextStage = 'APPROVED'
        statusText = submitterRole === 'STUDENT' ? 'APPROVED_BY_STAFF' : 'APPROVED_BY_HOD'
      }

      let updatedApproval: any = null
      if (approval) {
        updatedApproval = await tx.approval.update({
          where: { id: approval.id },
          data: {
            status: finalStatus,
            currentStage: nextStage as any,
            reviewedBy: reviewerName || reviewedBy || callerRoleUpper,
            reviewedAt: new Date(),
            comments: comments || (finalStatus === 'APPROVED' ? `Approved by ${callerRoleUpper}` : `Rejected by ${callerRoleUpper}`),
          }
        })
      }

      let updatedAchievement: any = null
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

        // Notify Submitter when approved or rejected
        if (updatedAchievement?.student?.userId) {
          await tx.notification.create({
            data: {
              title: `Achievement Submission ${finalStatus === 'APPROVED' ? 'Approved ✓' : 'Rejected ✕'}`,
              message: `Your achievement '${updatedAchievement.title}' has been ${finalStatus === 'APPROVED' ? 'approved by Staff' : 'rejected'}${comments ? ': ' + comments : ''}`,
              type: finalStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED',
              userId: updatedAchievement.student.userId,
              relatedId: updatedAchievement.id,
              entityType: 'ACHIEVEMENT'
            }
          })
        }
      }

      // 4. Create Audit Log (REQUIREMENT #14)
      await tx.auditLog.create({
        data: {
          userId: reviewedBy || 'SYSTEM',
          action: finalStatus === 'APPROVED' ? 'APPROVE_ACHIEVEMENT' : 'REJECT_ACHIEVEMENT',
          entityType: 'ACHIEVEMENT',
          entityId: targetAchievementId || approval?.id || 'UNKNOWN',
          newValue: JSON.stringify({
            action: finalStatus,
            statusText,
            reviewerRole: callerRoleUpper,
            reviewerName: reviewerName || 'Reviewer',
            submitterRole,
            departmentId: targetDeptId,
            reason: comments || 'N/A',
            timestamp: new Date().toISOString()
          })
        }
      })

      return { approval: updatedApproval, achievement: updatedAchievement, nextStage, finalStatus, statusText }
    })

    return NextResponse.json({
      success: true,
      message: `Submission ${updatedResult.finalStatus === 'APPROVED' ? 'approved successfully' : 'rejected'}`,
      approval: updatedResult.approval,
      achievement: updatedResult.achievement,
      stage: updatedResult.nextStage,
      status: updatedResult.finalStatus,
      statusText: updatedResult.statusText
    })
  } catch (error: any) {
    console.error('Error processing role-based approval:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process approval request' },
      { status: 500 }
    )
  }
}
