import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const departmentId = searchParams.get('departmentId')

    // Get counts for different entities
    const [
      totalDepartments,
      totalFaculty,
      totalStudents,
      totalActivities,
      totalResearch,
      pendingApprovals,
      departments,
    ] = await Promise.all([
      db.department.count({ where: { isActive: true } }),
      db.faculty.count(),
      db.student.count(),
      db.activity.count(),
      db.research.count(),
      db.approval.count({ where: { status: 'PENDING' } }),
      db.department.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { faculty: true, students: true, activities: true },
          },
        },
        take: 20,
      }),
    ])

    // Get recent activities
    const recentActivities = await db.activity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { department: { select: { name: true } } },
    })

    // Get research by type
    const researchByType = await db.research.groupBy({
      by: ['type'],
      _count: { id: true },
    })

    // Get activities by type
    const activitiesByType = await db.activity.groupBy({
      by: ['type'],
      _count: { id: true },
    })

    // Monthly statistics (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyActivities = await db.activity.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      _count: { id: true },
    })

    const dashboardData = {
      stats: {
        totalDepartments,
        totalFaculty,
        totalStudents,
        totalActivities,
        totalResearch,
        pendingApprovals,
      },
      departments,
      recentActivities,
      researchByType,
      activitiesByType,
      monthlyActivities,
    }

    return NextResponse.json({ success: true, data: dashboardData })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
