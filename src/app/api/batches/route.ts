import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all batches or filter by department
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const includeStudents = searchParams.get('includeStudents') === 'true'

    const where: any = {}
    if (departmentId) where.departmentId = departmentId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { section: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    const [batches, total] = await Promise.all([
      db.batch.findMany({
        where,
        include: {
          department: { select: { id: true, name: true, code: true } },
          advisor: {
            include: {
              user: { select: { id: true, name: true, email: true } }
            }
          },
          ...(includeStudents ? {
            students: {
              include: {
                user: { select: { name: true, email: true } }
              },
              orderBy: { registerNumber: 'asc' }
            }
          } : {}),
          _count: {
            select: { students: true }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ year: 'desc' }, { name: 'asc' }],
      }),
      db.batch.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      batches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching batches:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batches' },
      { status: 500 }
    )
  }
}

// POST - Create new batch
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { 
      name, 
      year, 
      departmentId, 
      section, 
      strength, 
      advisorId, 
      description 
    } = data

    if (!name || !year || !departmentId) {
      return NextResponse.json(
        { success: false, error: 'Name, Year, and Department are required' },
        { status: 400 }
      )
    }

    // Check if batch with same name already exists in this department
    const existingBatch = await db.batch.findFirst({
      where: {
        name,
        departmentId,
      }
    })
    
    if (existingBatch) {
      return NextResponse.json(
        { success: false, error: 'A batch with this name already exists in this department' },
        { status: 409 }
      )
    }

    // Validate advisor exists and belongs to same department if provided
    if (advisorId) {
      const advisor = await db.faculty.findUnique({
        where: { id: advisorId },
        include: { department: true }
      })
      
      if (!advisor) {
        return NextResponse.json(
          { success: false, error: 'Advisor not found' },
          { status: 404 }
        )
      }
      
      if (advisor.departmentId !== departmentId) {
        return NextResponse.json(
          { success: false, error: 'Advisor must belong to the same department' },
          { status: 400 }
        )
      }
    }

    const batch = await db.batch.create({
      data: {
        name,
        year: parseInt(year),
        departmentId,
        section: section || null,
        strength: strength ? parseInt(strength) : null,
        advisorId: advisorId || null,
        description: description || null,
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
        advisor: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        _count: {
          select: { students: true }
        }
      },
    })

    return NextResponse.json({ success: true, batch })
  } catch (error) {
    console.error('Error creating batch:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create batch' },
      { status: 500 }
    )
  }
}
