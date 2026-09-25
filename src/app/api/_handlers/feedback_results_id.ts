import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const form = await db.feedbackForm.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, email: true, role: true } },
        department: { select: { name: true, code: true } },
        batch: { select: { name: true, year: true } },
        questions: { orderBy: { order: 'asc' } },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: { select: { name: true } },
              },
            },
          },
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: { select: { name: true } },
                student: { select: { registerNumber: true, section: true } },
              },
            },
            answers: true,
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    })

    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Feedback form not found' },
        { status: 404 }
      )
    }

    const totalRecipients = form.assignments.length
    const totalResponses = form.responses.length
    const responsePercentage =
      totalRecipients > 0 ? Math.round((totalResponses / totalRecipients) * 100) : 0
    const pendingResponses = Math.max(0, totalRecipients - totalResponses)

    // Calculate overall ratings
    let totalNumberRatingSum = 0
    let totalNumberRatingCount = 0
    let totalStarRatingSum = 0
    let totalStarRatingCount = 0

    // Question-wise processing
    const questionResults = form.questions.map((question) => {
      const parsedOptions: string[] = question.options ? JSON.parse(question.options) : []
      const answersForQ = form.responses.flatMap((r) =>
        r.answers.filter((a) => a.questionId === question.id)
      )

      let qStats: any = {
        id: question.id,
        prompt: question.prompt,
        type: question.type,
        isRequired: question.isRequired,
        options: parsedOptions,
        minScale: question.minScale,
        maxScale: question.maxScale,
        totalAnswers: answersForQ.length,
      }

      if (['NUMBER_RATING', 'STAR_RATING', 'NUMBER_SCALE'].includes(question.type)) {
        const numericValues = answersForQ
          .map((a) => a.ratingValue)
          .filter((v): v is number => v !== null && !isNaN(v))

        const sum = numericValues.reduce((acc, val) => acc + val, 0)
        const avg = numericValues.length > 0 ? Number((sum / numericValues.length).toFixed(2)) : 0

        // Frequency distribution for ratings (1 to maxScale or min to max)
        const minVal = question.minScale || 1
        const maxVal = question.maxScale || 5
        const distribution: Record<string, number> = {}

        for (let i = minVal; i <= maxVal; i++) {
          distribution[i.toString()] = 0
        }

        numericValues.forEach((v) => {
          const key = Math.round(v).toString()
          distribution[key] = (distribution[key] || 0) + 1
        })

        if (question.type === 'STAR_RATING') {
          totalStarRatingSum += sum
          totalStarRatingCount += numericValues.length
        } else {
          totalNumberRatingSum += sum
          totalNumberRatingCount += numericValues.length
        }

        qStats = {
          ...qStats,
          average: avg,
          min: numericValues.length > 0 ? Math.min(...numericValues) : 0,
          max: numericValues.length > 0 ? Math.max(...numericValues) : 0,
          distribution,
        }
      } else if (['YES_NO', 'SINGLE_CHOICE', 'DROPDOWN'].includes(question.type)) {
        const optionCounts: Record<string, number> = {}

        const defaultOpts =
          question.type === 'YES_NO' ? ['Yes', 'No'] : parsedOptions

        defaultOpts.forEach((opt) => {
          optionCounts[opt] = 0
        })

        answersForQ.forEach((a) => {
          if (a.textValue) {
            optionCounts[a.textValue] = (optionCounts[a.textValue] || 0) + 1
          }
        })

        qStats = {
          ...qStats,
          optionCounts,
        }
      } else if (['MULTIPLE_CHOICE', 'CHECKBOX'].includes(question.type)) {
        const optionCounts: Record<string, number> = {}

        parsedOptions.forEach((opt) => {
          optionCounts[opt] = 0
        })

        answersForQ.forEach((a) => {
          if (a.jsonValue) {
            try {
              const selected: string[] = JSON.parse(a.jsonValue)
              selected.forEach((opt) => {
                optionCounts[opt] = (optionCounts[opt] || 0) + 1
              })
            } catch (e) {
              // ignore json parse error
            }
          } else if (a.textValue) {
            optionCounts[a.textValue] = (optionCounts[a.textValue] || 0) + 1
          }
        })

        qStats = {
          ...qStats,
          optionCounts,
        }
      } else {
        // Text / Long text responses
        const textResponses = answersForQ
          .filter((a) => a.textValue && a.textValue.trim() !== '')
          .map((a) => {
            const parentResponse = form.responses.find((r) => r.id === a.responseId)
            const isAnon = form.isAnonymous || parentResponse?.isAnonymous
            return {
              answerId: a.id,
              text: a.textValue,
              submittedAt: parentResponse?.submittedAt,
              respondentName: isAnon ? 'Anonymous Participant' : parentResponse?.user?.name || 'Unknown',
              respondentRole: isAnon ? 'ANONYMOUS' : parentResponse?.user?.role || 'UNKNOWN',
              respondentDepartment: isAnon ? null : parentResponse?.user?.department?.name,
            }
          })

        qStats = {
          ...qStats,
          textResponses,
        }
      }

      return qStats
    })

    const overallAverageNumberRating =
      totalNumberRatingCount > 0
        ? Number((totalNumberRatingSum / totalNumberRatingCount).toFixed(2))
        : null

    const overallAverageStarRating =
      totalStarRatingCount > 0
        ? Number((totalStarRatingSum / totalStarRatingCount).toFixed(2))
        : null

    // Format individual responses
    const individualResponses = form.responses.map((resp) => {
      const isAnon = form.isAnonymous || resp.isAnonymous
      const answerMap: Record<string, any> = {}

      resp.answers.forEach((ans) => {
        if (ans.ratingValue !== null) {
          answerMap[ans.questionId] = ans.ratingValue
        } else if (ans.jsonValue) {
          try {
            answerMap[ans.questionId] = JSON.parse(ans.jsonValue)
          } catch (e) {
            answerMap[ans.questionId] = ans.jsonValue
          }
        } else {
          answerMap[ans.questionId] = ans.textValue || ''
        }
      })

      return {
        responseId: resp.id,
        submittedAt: resp.submittedAt,
        isAnonymous: isAnon,
        user: isAnon
          ? {
              name: 'Anonymous Participant',
              email: 'hidden@anonymous',
              role: 'ANONYMOUS',
              department: 'N/A',
            }
          : {
              id: resp.user.id,
              name: resp.user.name,
              email: resp.user.email,
              role: resp.user.role,
              department: resp.user.department?.name || 'N/A',
              registerNumber: resp.user.student[0]?.registerNumber,
            },
        answers: answerMap,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        form: {
          id: form.id,
          title: form.title,
          description: form.description,
          targetAudience: form.targetAudience,
          targetRole: form.targetRole,
          departmentName: form.department?.name,
          batchName: form.batch?.name,
          startDate: form.startDate,
          endDate: form.endDate,
          isAnonymous: form.isAnonymous,
          isMandatory: form.isMandatory,
          allowResubmission: form.allowResubmission,
          createdBy: form.createdBy.name,
          createdAt: form.createdAt,
        },
        summary: {
          totalRecipients,
          totalResponses,
          responsePercentage,
          pendingResponses,
          averageNumberRating: overallAverageNumberRating,
          averageStarRating: overallAverageStarRating,
        },
        questionResults,
        individualResponses,
      },
    })
  } catch (error: any) {
    console.error('Error fetching feedback results:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch feedback results' },
      { status: 500 }
    )
  }
}
