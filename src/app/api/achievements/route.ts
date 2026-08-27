import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AchievementType, ApprovalStatus, EntityType } from '@prisma/client'

// GET /api/achievements - Fetch student achievements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const userId = searchParams.get('userId')
    const departmentId = searchParams.get('departmentId')
    const approvalStatus = searchParams.get('approvalStatus')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const search = searchParams.get('search') || ''

    const where: any = {}

    if (studentId) {
      where.studentId = studentId
    } else if (userId) {
      const student = await db.student.findUnique({ where: { userId } })
      if (student) {
        where.studentId = student.id
      } else {
        return NextResponse.json({ success: true, achievements: [], pagination: { page, limit, total: 0, pages: 0 } })
      }
    } else if (departmentId) {
      where.student = { departmentId }
    }

    if (approvalStatus) {
      const statusUpper = approvalStatus.toUpperCase()
      if (statusUpper === 'PENDING' || statusUpper === 'APPROVED' || statusUpper === 'REJECTED') {
        where.approvalStatus = statusUpper as ApprovalStatus
      } else if (statusUpper.includes('PENDING')) {
        where.approvalStatus = 'PENDING'
      } else if (statusUpper.includes('APPROVED')) {
        where.approvalStatus = 'APPROVED'
      } else if (statusUpper.includes('REJECTED')) {
        where.approvalStatus = 'REJECTED'
      }
    }

    if (type) {
      // Map string type to AchievementType enum if possible
      const upperType = type.toUpperCase()
      if (Object.values(AchievementType).includes(upperType as AchievementType)) {
        where.type = upperType as AchievementType
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { student: { name: { contains: search, mode: 'insensitive' as const } } },
        { student: { registerNumber: { contains: search, mode: 'insensitive' as const } } },
      ]
    }

    const [achievements, total] = await Promise.all([
      db.studentAchievement.findMany({
        where,
        include: {
          student: {
            include: {
              user: { select: { id: true, email: true, name: true, phone: true } },
              department: { select: { id: true, name: true, code: true } }
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.studentAchievement.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      achievements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}

// POST /api/achievements - Submit new achievement for approval
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      type = 'TECHNICAL',
      description,
      achievedDate,
      level,
      position,
      organizedBy,
      studentId: inputStudentId,
      userId: inputUserId,
      attachments,
    } = body

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Achievement title is required' },
        { status: 400 }
      )
    }

    // Resolve Student ID
    let targetStudentId = inputStudentId
    let targetUserId = inputUserId

    if (!targetStudentId && targetUserId) {
      const s = await db.student.findUnique({ where: { userId: targetUserId } })
      if (s) {
        targetStudentId = s.id
      }
    } else if (targetStudentId && !targetUserId) {
      const s = await db.student.findUnique({ where: { id: targetStudentId } })
      if (s?.userId) {
        targetUserId = s.userId
      }
    }

    if (!targetStudentId) {
      // Fallback: search student by email or register number if provided in body
      if (body.studentEmail || body.reg) {
        const s = await db.student.findFirst({
          where: {
            OR: [
              { email: body.studentEmail },
              { registerNumber: body.reg }
            ]
          }
        })
        if (s) {
          targetStudentId = s.id
          targetUserId = s.userId || targetUserId
        }
      }
    }

    if (!targetStudentId) {
      return NextResponse.json(
        { success: false, error: 'Student profile not found. Please contact support.' },
        { status: 404 }
      )
    }

    // Map achievement type enum
    let achType: AchievementType = 'TECHNICAL'
    const typeUpper = (type || 'TECHNICAL').toString().toUpperCase().replace(/[\s-]/g, '_')
    if (Object.values(AchievementType).includes(typeUpper as AchievementType)) {
      achType = typeUpper as AchievementType
    } else if (typeUpper.includes('PAPER') || typeUpper.includes('CONFERENCE') || typeUpper.includes('JOURNAL')) {
      achType = 'ACADEMIC'
    } else if (typeUpper.includes('HACKATHON') || typeUpper.includes('COMPETITION') || typeUpper.includes('WORKSHOP')) {
      achType = 'TECHNICAL'
    } else if (typeUpper.includes('SPORT')) {
      achType = 'SPORTS'
    } else if (typeUpper.includes('CULTUR')) {
      achType = 'CULTURAL'
    }

    // Create achievement and approval record inside transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Create StudentAchievement
      const achievement = await tx.studentAchievement.create({
        data: {
          title: title.trim(),
          type: achType,
          description: description || null,
          achievedDate: achievedDate ? new Date(achievedDate) : new Date(),
          level: level || 'Department',
          position: position || null,
          organizedBy: organizedBy || null,
          studentId: targetStudentId,
          attachments: attachments || null,
          approvalStatus: 'PENDING',
        },
        include: {
          student: {
            include: {
              user: { select: { id: true, email: true, name: true } },
              department: { select: { id: true, name: true, code: true } }
            }
          }
        }
      })

      // 2. Create Approval record
      const approval = await tx.approval.create({
        data: {
          entityType: 'ACHIEVEMENT',
          entityId: achievement.id,
          requestedBy: targetUserId || targetStudentId,
          currentStage: 'STAFF_REVIEW',
          status: 'PENDING',
          comments: `Submission created by ${achievement.student.name || 'Student'}`,
        }
      })

      // 3. Create Notification for HOD/Staff if user exists
      if (achievement.student.departmentId) {
        const deptStaff = await tx.user.findMany({
          where: {
            departmentId: achievement.student.departmentId,
            role: { in: ['STAFF', 'HOD'] }
          },
          select: { id: true }
        })

        for (const staffUser of deptStaff) {
          await tx.notification.create({
            data: {
              title: 'New Achievement Submission',
              message: `${achievement.student.name || 'A student'} submitted '${achievement.title}' for approval`,
              type: 'APPROVAL_REQUIRED',
              userId: staffUser.id,
              relatedId: approval.id,
              entityType: 'ACHIEVEMENT'
            }
          })
        }
      }

      return { achievement, approval }
    })

    return NextResponse.json({
      success: true,
      message: 'Achievement submitted for approval successfully',
      achievement: result.achievement,
      approval: result.approval,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error submitting achievement:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit achievement' },
      { status: 500 }
    )
  }
}
