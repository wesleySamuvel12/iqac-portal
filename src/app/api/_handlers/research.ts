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

    const [research, total] = await Promise.all([
      db.research.findMany({
        where,
        include: {
          department: { select: { id: true, name: true, code: true } },
          publications: {
            include: { faculty: { include: { user: true } } },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.research.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      research,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching research:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch research' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { title, type, description, authors, publication, publisher, doi, isbn, issn, volume, issue, pages, publishDate, indexedIn, impactFactor, citations, url, departmentId, facultyId, attachments } = data

    if (!title || !type || !departmentId) {
      return NextResponse.json(
        { success: false, error: 'Title, Type, and Department are required' },
        { status: 400 }
      )
    }

    const research = await db.research.create({
      data: {
        title,
        type,
        description,
        authors: authors ? JSON.stringify(authors) : null,
        publication,
        publisher,
        doi,
        isbn,
        issn,
        volume,
        issue,
        pages,
        publishDate: publishDate ? new Date(publishDate) : null,
        indexedIn,
        impactFactor: impactFactor ? parseFloat(impactFactor) : null,
        citations: citations ? parseInt(citations) : 0,
        url,
        departmentId,
        facultyId,
        attachments: attachments ? JSON.stringify(attachments) : null,
      },
      include: { department: true },
    })

    return NextResponse.json({ success: true, research })
  } catch (error) {
    console.error('Error creating research:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create research' },
      { status: 500 }
    )
  }
}
