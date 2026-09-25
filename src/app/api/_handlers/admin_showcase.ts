import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get institution info
    const institution = await db.institution.findFirst()

    // Get all departments with basic info
    const departments = await db.department.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        vision: true,
        mission: true,
        establishedYear: true,
        logo: true,
        _count: {
          select: {
            faculty: true,
            students: true,
            activities: true,
            research: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Key statistics
    const [
      totalFaculty,
      totalStudents,
      totalActivities,
      totalResearch,
      totalPlacements,
      totalAchievements,
      totalCertifications,
      totalPatents,
      totalProjects,
    ] = await Promise.all([
      db.faculty.count(),
      db.student.count(),
      db.activity.count({ where: { status: 'COMPLETED' } }),
      db.research.count(),
      db.placement.count(),
      db.studentAchievement.count({ where: { approvalStatus: 'APPROVED' } }),
      db.studentCertification.count({ where: { approvalStatus: 'APPROVED' } }),
      db.patent.count(),
      db.project.count(),
    ])

    // Research by type
    const researchByType = await db.research.groupBy({
      by: ['type'],
      _count: { id: true },
    })

    // Activities by type (current year)
    const currentYear = new Date().getFullYear()
    const activitiesByType = await db.activity.groupBy({
      by: ['type'],
      where: {
        startDate: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        },
      },
      _count: { id: true },
    })

    // Recent achievements (last 10)
    const recentAchievements = await db.studentAchievement.findMany({
      where: { approvalStatus: 'APPROVED' },
      take: 10,
      orderBy: { achievedDate: 'desc' },
      include: {
        student: {
          select: {
            registerNumber: true,
            user: { select: { name: true } },
            department: { select: { name: true, code: true } },
          },
        },
      },
    })

    // Recent placements (last 10)
    const recentPlacements = await db.placement.findMany({
      take: 10,
      orderBy: { offerDate: 'desc' },
      include: {
        student: {
          select: {
            registerNumber: true,
            user: { select: { name: true } },
            department: { select: { name: true, code: true } },
          },
        },
      },
    })

    // Top performing departments (by research + achievements)
    const departmentPerformance = await Promise.all(
      departments.map(async (dept) => {
        const [research, achievements, placements] = await Promise.all([
          db.research.count({ where: { departmentId: dept.id } }),
          db.studentAchievement.count({
            where: {
              student: { departmentId: dept.id },
              approvalStatus: 'APPROVED',
            },
          }),
          db.placement.count({
            where: {
              student: { departmentId: dept.id },
            },
          }),
        ])
        return {
          ...dept,
          performance: {
            research,
            achievements,
            placements,
            score: research * 3 + achievements * 2 + placements * 4,
          },
        }
      })
    )

    // Faculty with PhD / highest qualifications
    const facultyWithPhd = await db.faculty.count({
      where: {
        OR: [
          { qualification: { contains: 'Ph.D' } },
          { qualification: { contains: 'PhD' } },
          { qualification: { contains: 'Doctor' } },
        ],
      },
    })

    // Upcoming activities
    const upcomingActivities = await db.activity.findMany({
      where: {
        startDate: { gte: new Date() },
        status: { in: ['PLANNED', 'ONGOING'] },
      },
      take: 5,
      orderBy: { startDate: 'asc' },
      include: {
        department: { select: { name: true } },
      },
    })

    // Accreditation & Affiliation details
    const showcaseData = {
      institution: institution || {
        name: 'Nehru Institute of Engineering and Technology',
        shortName: 'NIET',
        type: 'Autonomous Institution',
      },
      highlights: {
        totalDepartments: departments.length,
        totalFaculty,
        totalStudents,
        facultyWithPhd,
        phdPercentage: totalFaculty > 0 ? Math.round((facultyWithPhd / totalFaculty) * 100) : 0,
        totalActivities,
        totalResearch,
        totalPlacements,
        totalAchievements,
        totalCertifications,
        totalPatents,
        totalProjects,
        placementRate: totalStudents > 0 ? Math.round((totalPlacements / totalStudents) * 100) : 0,
      },
      departments: departmentPerformance.sort((a, b) => b.performance.score - a.performance.score),
      researchBreakdown: researchByType.map((r) => ({
        type: r.type.replace(/_/g, ' '),
        count: r._count.id,
      })),
      activityBreakdown: activitiesByType.map((a) => ({
        type: a.type.replace(/_/g, ' '),
        count: a._count.id,
      })),
      recentAchievements: recentAchievements.map((a) => ({
        id: a.id,
        title: a.title,
        type: a.type,
        level: a.level,
        position: a.position,
        achievedDate: a.achievedDate,
        studentName: a.student.user?.name,
        registerNumber: a.student.registerNumber,
        department: a.student.department?.name,
      })),
      recentPlacements: recentPlacements.map((p) => ({
        id: p.id,
        company: p.company,
        designation: p.designation,
        packageLPA: p.packageLPA,
        offerDate: p.offerDate,
        studentName: p.student.user?.name,
        registerNumber: p.student.registerNumber,
        department: p.student.department?.name,
      })),
      upcomingActivities: upcomingActivities.map((a) => ({
        id: a.id,
        title: a.title,
        type: a.type,
        startDate: a.startDate,
        venue: a.venue,
        department: a.department?.name,
      })),
    }

    return NextResponse.json({
      success: true,
      data: showcaseData,
    })
  } catch (error) {
    console.error('Error fetching showcase data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch showcase data' },
      { status: 500 }
    )
  }
}
