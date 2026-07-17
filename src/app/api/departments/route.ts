import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where = includeInactive ? {} : { isActive: true }

    const departments = await db.department.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            faculty: true,
            students: true,
            activities: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, departments })
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { name, code, description, vision, mission, peo, po, pso, establishedYear } = data

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Name and code are required' },
        { status: 400 }
      )
    }

    // Check if department already exists
    const existing = await db.department.findFirst({
      where: {
        OR: [{ name }, { code }],
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Department with this name or code already exists' },
        { status: 409 }
      )
    }

    const department = await db.department.create({
      data: {
        name,
        code,
        description,
        vision,
        mission,
        peo,
        po,
        pso,
        establishedYear,
      },
    })

    return NextResponse.json({ success: true, department })
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create department' },
      { status: 500 }
    )
  }
}
