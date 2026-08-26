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
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Feedback form not found' },
        { status: 404 }
      )
    }

    const formattedForm = {
      ...form,
      questions: form.questions.map((q) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : [],
      })),
    }

    return NextResponse.json({ success: true, data: formattedForm })
  } catch (error: any) {
    console.error('Error fetching feedback form details:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch form details' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.feedbackForm.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback form deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting feedback form:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete feedback form' },
      { status: 500 }
    )
  }
}
