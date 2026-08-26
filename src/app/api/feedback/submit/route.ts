import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formId, userId, answers } = body

    if (!formId || !userId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, error: 'Form ID, User ID, and answers array are required' },
        { status: 400 }
      )
    }

    // 1. Fetch form
    const form = await db.feedbackForm.findUnique({
      where: { id: formId },
      include: { questions: true },
    })

    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Feedback form not found' },
        { status: 404 }
      )
    }

    if (new Date(form.endDate) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'This feedback form has expired' },
        { status: 400 }
      )
    }

    // 2. Check existing submission / assignment
    const existingAssignment = await db.feedbackAssignment.findUnique({
      where: {
        formId_userId: { formId, userId },
      },
    })

    if (existingAssignment && existingAssignment.status === 'COMPLETED' && !form.allowResubmission) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted this feedback. Duplicate submissions are not allowed.' },
        { status: 400 }
      )
    }

    // 3. Create FeedbackResponse
    const response = await db.feedbackResponse.create({
      data: {
        formId,
        userId,
        isAnonymous: form.isAnonymous,
        submittedAt: new Date(),
      },
    })

    // 4. Create FeedbackAnswers
    const answerRecords = answers.map((ans: any) => {
      let ratingValue: number | null = null
      let textValue: string | null = null
      let jsonValue: string | null = null

      if (typeof ans.value === 'number') {
        ratingValue = ans.value
      } else if (Array.isArray(ans.value)) {
        jsonValue = JSON.stringify(ans.value)
      } else if (typeof ans.value === 'string') {
        textValue = ans.value
      }

      return {
        responseId: response.id,
        questionId: ans.questionId,
        ratingValue,
        textValue,
        jsonValue,
      }
    })

    await db.feedbackAnswer.createMany({
      data: answerRecords,
    })

    // 5. Update assignment status if exists, or upsert assignment
    if (existingAssignment) {
      await db.feedbackAssignment.update({
        where: { id: existingAssignment.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })
    } else {
      await db.feedbackAssignment.create({
        data: {
          formId,
          userId,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully! Thank you for your response.',
      data: {
        responseId: response.id,
        submittedAt: response.submittedAt,
      },
    })
  } catch (error: any) {
    console.error('Error submitting feedback response:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit feedback response' },
      { status: 500 }
    )
  }
}
