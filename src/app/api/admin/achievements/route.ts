import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { studentSelectWithUser, facultySelectWithUser } from '@/lib/db-selects'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'all', 'student', 'staff', 'hod'
    const departmentId = searchParams.get('departmentId')
    const status = searchParams.get('status') // 'pending', 'approved', 'rejected', 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Fetch Student Achievements
    let studentAchievements: any[] = []
    if (!type || type === 'all' || type === 'student') {
      const studentWhere: any = {}
      if (departmentId) {
        studentWhere.student = { departmentId }
      }
      if (status && status !== 'all') {
        studentWhere.approvalStatus = status.toUpperCase()
      }

      studentAchievements = await db.studentAchievement.findMany({
        where: studentWhere,
        select: {
          id: true,
          title: true,
          type: true,
          description: true,
          achievedDate: true,
          level: true,
          position: true,
          organizedBy: true,
          studentId: true,
          attachments: true,
          approvalStatus: true,
          createdAt: true,
          updatedAt: true,
          student: studentSelectWithUser,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      })
    }

    // Fetch Staff/Faculty Achievements (Awards, Certifications, Publications, etc.)
    let staffAchievements: any[] = []
    let hodAchievements: any[] = []

    if (!type || type === 'all' || type === 'staff' || type === 'hod') {
      // Get Awards
      const awardWhere: any = {}
      if (departmentId) {
        awardWhere.faculty = { departmentId }
      }
      
      const awards = await db.award.findMany({
        where: awardWhere,
        select: {
          id: true,
          title: true,
          category: true,
          awardedBy: true,
          level: true,
          awardDate: true,
          attachments: true,
          facultyId: true,
          createdAt: true,
          faculty: facultySelectWithUser,
        },
        orderBy: { createdAt: 'desc' }
      })

      // Get Certifications
      const certifications = await db.certification.findMany({
        where: awardWhere,
        select: {
          id: true,
          title: true,
          issuingOrganization: true,
          issueDate: true,
          credentialId: true,
          attachments: true,
          facultyId: true,
          createdAt: true,
          faculty: facultySelectWithUser,
        },
        orderBy: { createdAt: 'desc' }
      })

      // Get Research Publications via Research model
      const researchWhere: any = {}
      if (departmentId) {
        researchWhere.departmentId = departmentId
      }
      
      const researchPapers = await db.research.findMany({
        where: researchWhere,
        select: {
          id: true,
          title: true,
          type: true,
          authors: true,
          publication: true,
          publisher: true,
          publishDate: true,
          doi: true,
          url: true,
          status: true,
          createdAt: true,
          department: true,
          publications: {
            select: {
              faculty: facultySelectWithUser,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Get Patents
      const patents = await db.patent.findMany({
        where: awardWhere,
        select: {
          id: true,
          title: true,
          patentNumber: true,
          inventors: true,
          status: true,
          filingDate: true,
          publishDate: true,
          attachments: true,
          createdAt: true,
          faculty: facultySelectWithUser,
        },
        orderBy: { createdAt: 'desc' }
      })

      // Get Projects
      const projects = await db.project.findMany({
        where: awardWhere,
        select: {
          id: true,
          title: true,
          fundingAgency: true,
          amount: true,
          status: true,
          startDate: true,
          attachments: true,
          createdAt: true,
          faculty: facultySelectWithUser,
        },
        orderBy: { createdAt: 'desc' }
      })

      // Get Books
      const books = await db.book.findMany({
        where: awardWhere,
        select: {
          id: true,
          title: true,
          publisher: true,
          isbn: true,
          publishYear: true,
          attachments: true,
          createdAt: true,
          faculty: facultySelectWithUser,
        },
        orderBy: { createdAt: 'desc' }
      })

      // Get FDP Programs
      const fdps = await db.fDPProgram.findMany({
        where: awardWhere,
        select: {
          id: true,
          title: true,
          organizer: true,
          startDate: true,
          endDate: true,
          durationDays: true,
          attachments: true,
          createdAt: true,
          faculty: facultySelectWithUser,
        },
        orderBy: { createdAt: 'desc' }
      })

      // Get Consultancies
      const consultancies = await db.consultancy.findMany({
        where: awardWhere,
        select: {
          id: true,
          title: true,
          client: true,
          amount: true,
          startDate: true,
          attachments: true,
          createdAt: true,
          faculty: facultySelectWithUser,
        },
        orderBy: { createdAt: 'desc' }
      })

      // Combine all staff achievements
      const allStaffAchievements = [
        ...awards.map(a => ({ ...a, achievementType: 'award', category: 'staff' })),
        ...certifications.map(c => ({ ...c, achievementType: 'certification', category: 'staff' })),
        ...patents.map(p => ({ ...p, achievementType: 'patent', category: 'staff' })),
        ...projects.map(p => ({ ...p, achievementType: 'project', category: 'staff' })),
        ...books.map(b => ({ ...b, achievementType: 'book', category: 'staff' })),
        ...fdps.map(f => ({ ...f, achievementType: 'fdp', category: 'staff' })),
        ...consultancies.map(c => ({ ...c, achievementType: 'consultancy', category: 'staff' })),
        ...researchPapers.flatMap(r => 
          r.publications.map((p: any) => ({
            id: r.id,
            title: r.title,
            type: r.type,
            achievedDate: r.publishDate,
            achievementType: 'research',
            category: 'staff',
            faculty: p.faculty,
            department: r.department,
            createdAt: r.createdAt
          }))
        )
      ]

      // Separate HOD achievements (faculty where isHOD is true)
      if (type === 'hod') {
        hodAchievements = allStaffAchievements.filter(
          (a: any) => a.faculty?.isHOD === true
        )
      } else {
        hodAchievements = allStaffAchievements.filter(
          (a: any) => a.faculty?.isHOD === true
        )
        staffAchievements = allStaffAchievements.filter(
          (a: any) => a.faculty?.isHOD !== true
        )
      }
    }

    // Get summary statistics by department
    const departments = await db.department.findMany({
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

    return NextResponse.json({
      success: true,
      data: {
        studentAchievements,
        staffAchievements,
        hodAchievements,
        summary: {
          totalStudentAchievements: studentAchievements.length,
          totalStaffAchievements: staffAchievements.length,
          totalHODAchievements: hodAchievements.length,
          departments: departments.length
        },
        departments: departments.map(d => ({
          id: d.id,
          name: d.name,
          code: d.code,
          studentCount: d._count.students,
          facultyCount: d._count.faculty,
          activityCount: d._count.activities,
          researchCount: d._count.research
        })),
        pagination: {
          page,
          limit,
          hasMore: (studentAchievements.length + staffAchievements.length + hodAchievements.length) >= limit
        }
      }
    })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
