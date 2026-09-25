import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') // 'week', 'month', 'year', 'all'
    const departmentId = searchParams.get('departmentId')

    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date(0) // Default to all time

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1)
    }

    // Get all departments
    const departments = await db.department.findMany({
      where: departmentId ? { id: departmentId } : {},
      include: {
        _count: {
          select: {
            students: true,
            faculty: true,
            activities: true,
            research: true
          }
        }
      }
    })

    // Build analytics for each department
    const departmentAnalytics = await Promise.all(
      departments.map(async (dept) => {
        // Student Achievements
        const studentAchievements = await db.studentAchievement.count({
          where: {
            student: { departmentId: dept.id },
            createdAt: { gte: startDate }
          }
        })

        // Staff Awards
        const staffAwards = await db.award.count({
          where: {
            faculty: { departmentId: dept.id },
            createdAt: { gte: startDate }
          }
        })

        // Staff Certifications
        const staffCertifications = await db.certification.count({
          where: {
            faculty: { departmentId: dept.id },
            createdAt: { gte: startDate }
          }
        })

        // Research Papers
        const researchPapers = await db.research.count({
          where: {
            departmentId: dept.id,
            createdAt: { gte: startDate }
          }
        })

        // Patents
        const patents = await db.patent.count({
          where: {
            faculty: { departmentId: dept.id },
            createdAt: { gte: startDate }
          }
        })

        // Projects
        const projects = await db.project.count({
          where: {
            faculty: { departmentId: dept.id },
            createdAt: { gte: startDate }
          }
        })

        // Activities
        const activities = await db.activity.count({
          where: {
            departmentId: dept.id,
            createdAt: { gte: startDate }
          }
        })

        // Placements
        const placements = await db.placement.count({
          where: {
            student: { departmentId: dept.id },
            createdAt: { gte: startDate }
          }
        })

        // Internships
        const internships = await db.internship.count({
          where: {
            student: { departmentId: dept.id },
            createdAt: { gte: startDate }
          }
        })

        // NPTEL Courses
        const npCourses = await db.nPCourse.count({
          where: {
            student: { departmentId: dept.id },
            createdAt: { gte: startDate }
          }
        })

        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          stats: {
            students: dept._count.students,
            faculty: dept._count.faculty,
            activities: dept._count.activities,
            research: dept._count.research
          },
          achievements: {
            studentAchievements,
            staffAwards,
            staffCertifications,
            researchPapers,
            patents,
            projects,
            totalAchievements: studentAchievements + staffAwards + staffCertifications + researchPapers + patents + projects
          },
          engagement: {
            activities,
            placements,
            internships,
            npCourses
          }
        }
      })
    )

    // Get overall institution stats
    const totalStats = departmentAnalytics.reduce(
      (acc, dept) => ({
        students: acc.students + dept.stats.students,
        faculty: acc.faculty + dept.stats.faculty,
        activities: acc.activities + dept.engagement.activities,
        research: acc.research + dept.stats.research,
        studentAchievements: acc.studentAchievements + dept.achievements.studentAchievements,
        staffAwards: acc.staffAwards + dept.achievements.staffAwards,
        certifications: acc.certifications + dept.achievements.staffCertifications,
        papers: acc.papers + dept.achievements.researchPapers,
        patents: acc.patents + dept.achievements.patents,
        projects: acc.projects + dept.achievements.projects,
        placements: acc.placements + dept.engagement.placements,
        internships: acc.internships + dept.engagement.internships
      }),
      {
        students: 0,
        faculty: 0,
        activities: 0,
        research: 0,
        studentAchievements: 0,
        staffAwards: 0,
        certifications: 0,
        papers: 0,
        patents: 0,
        projects: 0,
        placements: 0,
        internships: 0
      }
    )

    // Achievement type breakdown by role
    const achievementByRole = {
      student: departmentAnalytics.reduce((sum, d) => sum + d.achievements.studentAchievements, 0),
      staff: departmentAnalytics.reduce((sum, d) => sum + d.achievements.staffAwards + d.achievements.staffCertifications, 0),
      hod: 0 // Will be calculated separately
    }

    // HOD specific achievements
    const hodFaculty = await db.faculty.findMany({ where: { isHOD: true } })
    for (const hod of hodFaculty) {
      const [awards, certs, patents] = await Promise.all([
        db.award.count({ where: { facultyId: hod.id, createdAt: { gte: startDate } } }),
        db.certification.count({ where: { facultyId: hod.id, createdAt: { gte: startDate } } }),
        db.patent.count({ where: { facultyId: hod.id, createdAt: { gte: startDate } } })
      ])
      achievementByRole.hod += awards + certs + patents
    }

    // Monthly trend data (for charts)
    const monthlyTrend: Array<{
      month: string;
      studentAchievements: number;
      staffAwards: number;
      researchPapers: number;
      total: number;
    }> = []
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const [studentAchievements, staffAwards, researchPapers] = await Promise.all([
        db.studentAchievement.count({ where: { createdAt: { gte: monthDate, lt: nextMonth } } }),
        db.award.count({ where: { createdAt: { gte: monthDate, lt: nextMonth } } }),
        db.research.count({ where: { createdAt: { gte: monthDate, lt: nextMonth } } })
      ])

      monthlyTrend.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        studentAchievements,
        staffAwards,
        researchPapers,
        total: studentAchievements + staffAwards + researchPapers
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        period,
        dateRange: {
          from: startDate.toISOString(),
          to: now.toISOString()
        },
        overall: totalStats,
        achievementByRole,
        departments: departmentAnalytics,
        monthlyTrend,
        topDepartments: [...departmentAnalytics]
          .sort((a, b) => b.achievements.totalAchievements - a.achievements.totalAchievements)
          .slice(0, 5)
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
