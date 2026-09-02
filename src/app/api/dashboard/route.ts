import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const departmentId = searchParams.get('departmentId')

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Execute all dashboard database queries concurrently for maximum performance
    const [
      totalDepartments,
      totalFaculty,
      totalStudents,
      totalActivities,
      totalResearch,
      pendingApprovals,
      departments,
      recentActivities,
      researchByType,
      activitiesByType,
      monthlyActivities,
    ] = await Promise.all([
      db.department.count({ where: { isActive: true } }),
      db.faculty.count(),
      db.student.count(),
      db.activity.count(),
      db.research.count(),
      db.approval.count({ where: { status: 'PENDING' } }),
      db.department.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          code: true,
          _count: {
            select: { faculty: true, students: true, activities: true },
          },
        },
        take: 20,
      }),
      db.activity.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, type: true, createdAt: true, department: { select: { name: true } } },
      }),
      db.research.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
      db.activity.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
      db.activity.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: sixMonthsAgo },
        },
        _count: { id: true },
      }),
    ])

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
