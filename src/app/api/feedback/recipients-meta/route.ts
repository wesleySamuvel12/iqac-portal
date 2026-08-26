import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const departments = await db.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    })

    const batches = await db.batch.findMany({
      where: { isActive: true },
      select: { id: true, name: true, year: true, departmentId: true },
      orderBy: { year: 'desc' },
    })

    const users = await db.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        department: { select: { name: true, code: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: {
        departments,
        batches,
        roles: ['STUDENT', 'STAFF', 'HOD', 'ADMIN'],
        users,
      },
    })
  } catch (error) {
    console.error('Error fetching feedback recipients metadata:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recipients metadata' },
      { status: 500 }
    )
  }
}
