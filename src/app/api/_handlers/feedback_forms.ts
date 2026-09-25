import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      targetAudience, // 'ALL' | 'ROLE' | 'DEPARTMENT' | 'BATCH' | 'INDIVIDUAL' | 'MULTIPLE_USERS'
      targetRole,
      departmentId,
      batchId,
      targetUserIds, // string[] or JSON string
      startDate,
      endDate,
      isAnonymous,
      isMandatory,
      allowResubmission,
      createdById,
      questions,
    } = body

    if (!title || !endDate || !createdById || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title, End Date, Creator ID, and at least 1 question are required' },
        { status: 400 }
      )
    }

    const formattedTargetUserIds = Array.isArray(targetUserIds)
      ? JSON.stringify(targetUserIds)
      : targetUserIds

    // 1. Create FeedbackForm
    const form = await db.feedbackForm.create({
      data: {
        title,
        description: description || null,
        targetAudience: targetAudience || 'ALL',
        targetRole: (targetRole as UserRole) || null,
        departmentId: departmentId || null,
        batchId: batchId || null,
        targetUserIds: formattedTargetUserIds || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        isAnonymous: Boolean(isAnonymous),
        isMandatory: Boolean(isMandatory),
        allowResubmission: Boolean(allowResubmission),
        createdById,
        status: 'PUBLISHED',
      },
    })

    // 2. Create FeedbackQuestions
    const questionData = questions.map((q: any, idx: number) => ({
      formId: form.id,
      prompt: q.prompt,
      type: q.type,
      isRequired: q.isRequired !== undefined ? Boolean(q.isRequired) : true,
      order: q.order !== undefined ? q.order : idx,
      options: q.options ? (Array.isArray(q.options) ? JSON.stringify(q.options) : q.options) : null,
      minScale: q.minScale !== undefined ? Number(q.minScale) : 1,
      maxScale: q.maxScale !== undefined ? Number(q.maxScale) : 5,
    }))

    await db.feedbackQuestion.createMany({
      data: questionData,
    })

    // 3. Resolve Target Users for Assignment
    let targetUsers: { id: string }[] = []

    if (targetAudience === 'ALL') {
      targetUsers = await db.user.findMany({
        where: { isActive: true },
        select: { id: true },
      })
    } else if (targetAudience === 'ROLE' && targetRole) {
      targetUsers = await db.user.findMany({
        where: { isActive: true, role: targetRole as UserRole },
        select: { id: true },
      })
    } else if (targetAudience === 'DEPARTMENT' && departmentId) {
      const whereClause: any = { isActive: true, departmentId }
      if (targetRole) whereClause.role = targetRole as UserRole
      targetUsers = await db.user.findMany({
        where: whereClause,
        select: { id: true },
      })
    } else if (targetAudience === 'BATCH' && batchId) {
      const students = await db.student.findMany({
        where: { batchId },
        select: { userId: true },
      })
      targetUsers = students.filter((s) => s.userId).map((s) => ({ id: s.userId! }))
    } else if (targetAudience === 'INDIVIDUAL' || targetAudience === 'MULTIPLE_USERS') {
      const parsedIds: string[] = Array.isArray(targetUserIds)
        ? targetUserIds
        : targetUserIds
        ? JSON.parse(targetUserIds)
        : []
      targetUsers = parsedIds.map((id) => ({ id }))
    } else {
      // Default fallback
      targetUsers = await db.user.findMany({
        where: { isActive: true },
        select: { id: true },
      })
    }

    // Filter unique user IDs
    const uniqueUserIds = Array.from(new Set(targetUsers.map((u) => u.id)))

    // 4. Create FeedbackAssignment records
    if (uniqueUserIds.length > 0) {
      const assignmentsData = uniqueUserIds.map((userId) => ({
        formId: form.id,
        userId,
        status: 'PENDING',
      }))

      await db.feedbackAssignment.createMany({
        data: assignmentsData,
      })

      // 5. Dispatch Notification to recipients
      const notificationsData = uniqueUserIds.map((userId) => ({
        title: `New Feedback Requested: ${title}`,
        message: `Please complete the feedback form "${title}" before ${new Date(endDate).toLocaleDateString()}.`,
        type: 'REMINDER' as const,
        userId,
        actionUrl: `/feedback?formId=${form.id}`,
      }))

      await db.notification.createMany({
        data: notificationsData,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Feedback created successfully and delivered to ${uniqueUserIds.length} recipients`,
      data: {
        formId: form.id,
        recipientCount: uniqueUserIds.length,
      },
    })
  } catch (error: any) {
    console.error('Error creating feedback form:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create feedback form' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')
    const view = searchParams.get('view') // 'admin' | 'recipient'

    const now = new Date()

    if (view === 'admin' || role === 'ADMIN' || role === 'SUPER_ADMIN') {
      // Return created forms for Admin with response counts & recipient counts
      const forms = await db.feedbackForm.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, role: true } },
          department: { select: { name: true, code: true } },
          batch: { select: { name: true, year: true } },
          questions: { select: { id: true } },
          _count: {
            select: {
              assignments: true,
              responses: true,
            },
          },
        },
      })

      const formattedForms = forms.map((f) => {
        let isExpired = f.endDate < now
        return {
          id: f.id,
          title: f.title,
          description: f.description,
          targetAudience: f.targetAudience,
          targetRole: f.targetRole,
          departmentName: f.department?.name,
          batchName: f.batch?.name,
          startDate: f.startDate,
          endDate: f.endDate,
          isAnonymous: f.isAnonymous,
          isMandatory: f.isMandatory,
          allowResubmission: f.allowResubmission,
          status: isExpired ? 'EXPIRED' : f.status,
          questionCount: f.questions.length,
          totalRecipients: f._count.assignments,
          totalResponses: f._count.responses,
          responsePercentage:
            f._count.assignments > 0
              ? Math.round((f._count.responses / f._count.assignments) * 100)
              : 0,
          createdBy: f.createdBy.name,
          createdAt: f.createdAt,
        }
      })

      return NextResponse.json({ success: true, data: formattedForms })
    }

    // Recipient View: fetch assigned feedback forms for the user
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required for recipient feedback view' },
        { status: 400 }
      )
    }

    const assignments = await db.feedbackAssignment.findMany({
      where: { userId },
      include: {
        form: {
          include: {
            createdBy: { select: { name: true, role: true } },
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const newPending: any[] = []
    const completed: any[] = []
    const expired: any[] = []

    for (const a of assignments) {
      const f = a.form
      const isPastDue = new Date(f.endDate) < now
      const parsedQuestions = f.questions.map((q) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : [],
      }))

      const item = {
        assignmentId: a.id,
        formId: f.id,
        title: f.title,
        description: f.description,
        createdBy: f.createdBy.name,
        createdRole: f.createdBy.role,
        startDate: f.startDate,
        endDate: f.endDate,
        isAnonymous: f.isAnonymous,
        isMandatory: f.isMandatory,
        allowResubmission: f.allowResubmission,
        status: a.status,
        completedAt: a.completedAt,
        questionCount: f.questions.length,
        questions: parsedQuestions,
      }

      if (a.status === 'COMPLETED') {
        completed.push(item)
      } else if (isPastDue) {
        expired.push({ ...item, status: 'EXPIRED' })
      } else {
        newPending.push(item)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        newPending,
        completed,
        expired,
        totalAssigned: assignments.length,
      },
    })
  } catch (error: any) {
    console.error('Error fetching feedback forms:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch feedback forms' },
      { status: 500 }
    )
  }
}
