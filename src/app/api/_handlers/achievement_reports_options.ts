import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const userType = searchParams.get('userType') || 'BOTH'

    // Fetch all active departments
    const departments = await db.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    })

    let users: Array<{ id: string; name: string; type: 'STUDENT' | 'STAFF' }> = []

    if (departmentId && departmentId !== 'ALL') {
      const fetchStudents = (userType === 'STUDENT' || userType === 'BOTH')
        ? db.student.findMany({
            where: { departmentId },
            include: { user: { select: { name: true, email: true } } },
            orderBy: { registerNumber: 'asc' },
            take: 200,
          })
        : Promise.resolve([])

      const fetchFaculty = (userType === 'STAFF' || userType === 'BOTH')
        ? db.faculty.findMany({
            where: { departmentId },
            include: { user: { select: { name: true, email: true } } },
            orderBy: { employeeId: 'asc' },
            take: 100,
          })
        : Promise.resolve([])

      const [students, faculty] = await Promise.all([fetchStudents, fetchFaculty])

      ;(students || []).forEach(s => {
        users.push({
          id: s.userId || s.id,
          name: `${s.user?.name || 'Student'} (${s.registerNumber || 'Student'})`,
          type: 'STUDENT',
        })
      })

      ;(faculty || []).forEach(f => {
        users.push({
          id: f.userId || f.id,
          name: `${f.user?.name || 'Faculty'} (${f.designation || 'Faculty'})`,
          type: 'STAFF',
        })
      })
    }

    return NextResponse.json({
      success: true,
      departments,
      users,
    })
  } catch (error) {
    console.error('Error fetching achievement report options:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch filter options' },
      { status: 500 }
    )
  }
}
