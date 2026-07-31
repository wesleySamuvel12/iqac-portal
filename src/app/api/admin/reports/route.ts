import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'weekly', 'monthly', 'yearly'
    const format = searchParams.get('format') // 'json', 'csv', 'summary'
    const departmentId = searchParams.get('departmentId')
    const category = searchParams.get('category') // 'all', 'student', 'staff', 'hod', 'achievement', 'activity'

    // Calculate date range based on report type
    const now = new Date()
    let startDate: Date
    let periodLabel: string

    if (type === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      periodLabel = `Weekly Report: ${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}`
    } else if (type === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      periodLabel = `Monthly Report: ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    } else if (type === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1)
      periodLabel = `Yearly Report: ${now.getFullYear()}`
    } else {
      startDate = new Date(0)
      periodLabel = 'Complete Report: All Time'
    }

    // Get departments to report on
    const departments = await db.department.findMany({
      where: departmentId ? { id: departmentId } : {},
      include: {
        students: {
          include: {
            user: { select: { name: true, email: true, role: true } },
            achievements: {
              where: { createdAt: { gte: startDate } },
              orderBy: { createdAt: 'desc' }
            },
            certifications: {
              where: { createdAt: { gte: startDate } },
              orderBy: { createdAt: 'desc' }
            },
            placements: {
              where: { createdAt: { gte: startDate } },
              orderBy: { createdAt: 'desc' }
            },
            internships: {
              where: { createdAt: { gte: startDate } },
              orderBy: { createdAt: 'desc' }
            },
            npCourses: {
              where: { createdAt: { gte: startDate } },
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        faculty: {
          include: {
            user: { select: { name: true, email: true, role: true } },
            awards: {
              where: { createdAt: { gte: startDate } },
              orderBy: { createdAt: 'desc' }
            },
            certifications: {
              where: { createdAt: { gte: startDate } },
              orderBy: { createdAt: 'desc' }
            },
            patents: {
              where: { createdAt: { gte: startDate } },
              orderBy: { createdAt: 'desc' }
            },
            projects: {
              where: { createdAt: { gte: startDate } },
              orderBy: { createdAt: 'desc' }
            },
            books: {
              where: { createdAt: { gte: startDate } },
              orderBy: { createdAt: 'desc' }
            },
            fdpPrograms: {
              where: { createdAt: { gte: startDate } },
              orderBy: { createdAt: 'desc' }
            },
            consultancies: {
              where: { createdAt: { gte: startDate } },
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        activities: {
          where: { createdAt: { gte: startDate } },
          orderBy: { createdAt: 'desc' }
        },
        research: {
          where: { createdAt: { gte: startDate } },
          include: {
            publications: {
              include: {
                faculty: {
                  include: { user: { select: { name: true } } }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Build comprehensive report data
    const reportData = {
      metadata: {
        generatedAt: now.toISOString(),
        period: type || 'all',
        periodLabel,
        dateRange: {
          from: startDate.toISOString(),
          to: now.toISOString()
        },
        totalDepartments: departments.length,
        category: category || 'all'
      },
      executiveSummary: {
        totalStudents: departments.reduce((sum, d) => sum + d.students.length, 0),
        totalFaculty: departments.reduce((sum, d) => sum + d.faculty.length, 0),
        totalHODs: departments.reduce((sum, d) => sum + d.faculty.filter(f => f.isHOD).length, 0),
        totalActivities: departments.reduce((sum, d) => sum + d.activities.length, 0),
        totalResearch: departments.reduce((sum, d) => sum + d.research.length, 0)
      },
      departmentReports: departments.map(dept => {
        // Student achievements for this department
        const studentAchievements = dept.students.flatMap(s => 
          s.achievements.map(a => ({
            ...a,
            studentName: s.user.name,
            studentRegNumber: s.registerNumber,
            department: dept.name
          }))
        )

        // Staff achievements for this department
        const staffAchievements = dept.faculty
          .filter(f => !f.isHOD)
          .flatMap(f => [
            ...f.awards.map(a => ({ ...a, achievementType: 'award', staffName: f.user.name, designation: f.designation, department: dept.name })),
            ...f.certifications.map(c => ({ ...c, achievementType: 'certification', staffName: f.user.name, designation: f.designation, department: dept.name })),
            ...f.patents.map(p => ({ ...p, achievementType: 'patent', staffName: f.user.name, designation: f.designation, department: dept.name })),
            ...f.projects.map(p => ({ ...p, achievementType: 'project', staffName: f.user.name, designation: f.designation, department: dept.name })),
            ...f.books.map(b => ({ ...b, achievementType: 'book', staffName: f.user.name, designation: f.designation, department: dept.name })),
            ...f.fdpPrograms.map(fdp => ({ ...fdp, achievementType: 'fdp', staffName: f.user.name, designation: f.designation, department: dept.name })),
            ...f.consultancies.map(c => ({ ...c, achievementType: 'consultancy', staffName: f.user.name, designation: f.designation, department: dept.name }))
          ])

        // HOD achievements for this department
        const hodAchievements = dept.faculty
          .filter(f => f.isHOD)
          .flatMap(f => [
            ...f.awards.map(a => ({ ...a, achievementType: 'award', staffName: f.user.name, role: 'HOD', department: dept.name })),
            ...f.certifications.map(c => ({ ...c, achievementType: 'certification', staffName: f.user.name, role: 'HOD', department: dept.name })),
            ...f.patents.map(p => ({ ...p, achievementType: 'patent', staffName: f.user.name, role: 'HOD', department: dept.name }))
          ])

        // Placements and Internships
        const placements = dept.students.flatMap(s =>
          s.placements.map(p => ({ ...p, studentName: s.user.name, registerNumber: s.registerNumber, department: dept.name }))
        )
        const internshipsData = dept.students.flatMap(s =>
          s.internships.map(i => ({ ...i, studentName: s.user.name, registerNumber: s.registerNumber, department: dept.name }))
        )

        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          summary: {
            students: dept.students.length,
            faculty: dept.faculty.length,
            hod: dept.faculty.filter(f => f.isHOD).length,
            activities: dept.activities.length,
            research: dept.research.length
          },
          achievements: {
            student: {
              count: studentAchievements.length,
              items: studentAchievements
            },
            staff: {
              count: staffAchievements.length,
              items: staffAchievements
            },
            hod: {
              count: hodAchievements.length,
              items: hodAchievements
            },
            total: studentAchievements.length + staffAchievements.length + hodAchievements.length
          },
          placements: {
            count: placements.length,
            items: placements
          },
          internships: {
            count: internshipsData.length,
            items: internshipsData
          },
          activities: dept.activities.map(a => ({
            id: a.id,
            title: a.title,
            type: a.type,
            status: a.status,
            startDate: a.startDate,
            endDate: a.endDate,
            participants: a.participants
          })),
          research: dept.research.map(r => ({
            id: r.id,
            title: r.title,
            type: r.type,
            status: r.status,
            publishDate: r.publishDate,
            authors: r.publications?.map(p => p.faculty?.user?.name).join(', ')
          }))
        }
      }),
      rankings: {
        byTotalAchievements: [...departments]
          .map(d => ({
            name: d.name,
            total: d.students.reduce((sum, s) => sum + s.achievements.length, 0) +
                   d.faculty.reduce((sum, f) => sum + f.awards.length + f.certifications.length + f.patents.length + f.projects.length, 0)
          }))
          .sort((a, b) => b.total - a.total),
        byStudentAchievements: [...departments]
          .map(d => ({
            name: d.name,
            count: d.students.reduce((sum, s) => sum + s.achievements.length, 0)
          }))
          .sort((a, b) => b.count - a.count),
        byResearchOutput: [...departments]
          .map(d => ({ name: d.name, count: d.research.length }))
          .sort((a, b) => b.count - a.count),
        byPlacementRate: departments
          .filter(d => d.students.length > 0)
          .map(d => ({
            name: d.name,
            rate: Math.round((d.students.reduce((sum, s) => sum + s.placements.length, 0) / d.students.length) * 100)
          }))
          .sort((a, b) => b.rate - a.rate)
      }
    }

    // Calculate executive summary totals
    reportData.executiveSummary.totalAchievements = reportData.departmentReports.reduce(
      (sum, d) => sum + d.achievements.total, 0
    )
    reportData.executiveSummary.totalPlacements = reportData.departmentReports.reduce(
      (sum, d) => sum + d.placements.count, 0
    )
    reportData.executiveSummary.totalInternships = reportData.departmentReports.reduce(
      (sum, d) => sum + d.internships.count, 0
    )

    // Return in requested format
    if (format === 'csv') {
      // Generate CSV content
      const csvRows: string[] = []
      
      // Header
      csvRows.push(`NIET IQAC ${periodLabel}`)
      csvRows.push(`Generated: ${now.toLocaleDateString()}`)
      csvRows.push('')
      
      // Executive Summary
      csvRows.push('EXECUTIVE SUMMARY')
      csvRows.push(`Total Students,${reportData.executiveSummary.totalStudents}`)
      csvRows.push(`Total Faculty,${reportData.executiveSummary.totalFaculty}`)
      csvRows.push(`Total HODs,${reportData.executiveSummary.totalHODs}`)
      csvRows.push(`Total Activities,${reportData.executiveSummary.totalActivities}`)
      csvRows.push(`Total Research Papers,${reportData.executiveSummary.totalResearch}`)
      csvRows.push(`Total Achievements,${reportData.executiveSummary.totalAchievements || 0}`)
      csvRows.push('')
      
      // Department-wise breakdown
      csvRows.push('DEPARTMENT-WISE BREAKDOWN')
      csvRows.push('Department,Code,Students,Faculty,HOD,Activities,Research,Student Achievements,Staff Achievements,HOD Achievements,Total')
      
      for (const dept of reportData.departmentReports) {
        csvRows.push([
          dept.name,
          dept.code,
          dept.summary.students,
          dept.summary.faculty,
          dept.summary.hod,
          dept.summary.activities,
          dept.summary.research,
          dept.achievements.student.count,
          dept.achievements.staff.count,
          dept.achievements.hod.count,
          dept.achievements.total
        ].join(','))
      }

      const csvContent = csvRows.join('\n')
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="iqac-report-${type || 'all'}-${now.toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Default JSON response
    return NextResponse.json({
      success: true,
      data: reportData
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
