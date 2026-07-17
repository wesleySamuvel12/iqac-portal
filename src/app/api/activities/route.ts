import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (departmentId) where.departmentId = departmentId
    if (type) where.type = type
    if (status) where.status = status

    const [activities, total] = await Promise.all([
      db.activity.findMany({
        where,
        include: {
          department: { select: { id: true, name: true, code: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.activity.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      activities,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { title, type, description, startDate, endDate, venue, organizer, participants, outcome, departmentId, conductedBy, attachments } = data

    if (!title || !type || !departmentId) {
      return NextResponse.json(
        { success: false, error: 'Title, Type, and Department are required' },
        { status: 400 }
      )
    }

    const activity = await db.activity.create({
      data: {
        title,
        type,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        venue,
        organizer,
        participants: participants ? parseInt(participants) : null,
        outcome,
        departmentId,
        conductedBy,
        attachments: attachments ? JSON.stringify(attachments) : null,
      },
      include: { department: true },
    })

    return NextResponse.json({ success: true, activity })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}
