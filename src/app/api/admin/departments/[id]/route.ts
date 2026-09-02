import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/departments/[id] - Get comprehensive department details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const filter = (searchParams.get('filter') as 'all' | 'students' | 'staff' | 'hod') || 'all'
    const achievementType = searchParams.get('achievementType') || null

    // Fetch department basic info
    const department = await db.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            faculty: true,
            students: true,
            activities: true,
            research: true,
            batches: true
          }
        }
      }
    })

    if (!department) {
      return NextResponse.json(
        { success: false, error: 'Department not found' },
        { status: 404 }
      )
    }

    // Initialize result structure
    const result: any = {
      department: {
        id: department.id,
        name: department.name,
        code: department.code,
        description: department.description,
        vision: department.vision,
        mission: department.mission,
        peo: department.peo,
        po: department.po,
        pso: department.pso,
        logo: department.logo,
        establishedYear: department.establishedYear,
        isActive: department.isActive,
        createdAt: department.createdAt,
        updatedAt: department.updatedAt
      },
      faculty: [],
      students: [],
      activities: [],
      researchPapers: [],
      summary: {}
    }

    // Fetch faculty with all achievements if filter is 'all' or 'staff' or 'hod'
    if (filter === 'all' || filter === 'staff' || filter === 'hod') {
      const facultyList = await db.faculty.findMany({
        where: { departmentId: id },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true }
          },
          awards: achievementType && achievementType !== 'award' ? false : true,
          certifications: achievementType && achievementType !== 'certification' ? false : true,
          patents: achievementType && achievementType !== 'patent' ? false : true,
          books: achievementType && achievementType !== 'book' ? false : true,
          projects: achievementType && achievementType !== 'project' ? false : true,
          fdpPrograms: achievementType && achievementType !== 'fdp' ? false : true,
          consultations: achievementType && achievementType !== 'consultancy' ? false : true,
          researchPublications: achievementType && achievementType !== 'research' 
            ? false 
            : { include: { research: true } },
          activities: achievementType && achievementType !== 'activity'
            ? false
            : { include: { activity: true } }
        },
        orderBy: { isHOD: 'desc' }
      })

      // Apply HOD filter if needed
      let filteredFaculty = facultyList
      if (filter === 'hod') {
        filteredFaculty = facultyList.filter(f => f.isHOD === true)
      }

      // Transform faculty data with achievement counts
      result.faculty = filteredFaculty.map(faculty => ({
        id: faculty.id,
        employeeId: faculty.employeeId,
        name: faculty.user?.name,
        email: faculty.user?.email,
        phone: faculty.user?.phone,
        avatar: faculty.user?.avatar,
        designation: faculty.designation,
        qualification: faculty.qualification,
        specialization: faculty.specialization,
        experience: faculty.experience,
        isHOD: faculty.isHOD,
        dateOfJoining: faculty.dateOfJoining,
        researchArea: faculty.researchArea,
        photo: faculty.photo,
        achievements: {
          awards: faculty.awards,
          certifications: faculty.certifications,
          patents: faculty.patents,
          books: faculty.books,
          projects: faculty.projects,
          fdpPrograms: faculty.fdpPrograms,
          consultations: faculty.consultations,
          researchPublications: Array.isArray(faculty.researchPublications) ? faculty.researchPublications.map((rp: any) => ({
            ...rp,
            research: rp.research
          })) : [],
          activities: Array.isArray(faculty.activities) ? faculty.activities.map((fa: any) => fa.activity) : []
        },
        achievementCounts: {
          awards: faculty.awards?.length || 0,
          certifications: faculty.certifications?.length || 0,
          patents: faculty.patents?.length || 0,
          books: faculty.books?.length || 0,
          projects: faculty.projects?.length || 0,
          fdpPrograms: faculty.fdpPrograms?.length || 0,
          consultations: faculty.consultations?.length || 0,
          researchPublications: faculty.researchPublications?.length || 0,
          activities: faculty.activities?.length || 0,
          total: (
            (faculty.awards?.length || 0) +
            (faculty.certifications?.length || 0) +
            (faculty.patents?.length || 0) +
            (faculty.books?.length || 0) +
            (faculty.projects?.length || 0) +
            (faculty.fdpPrograms?.length || 0) +
            (faculty.consultations?.length || 0) +
            (faculty.researchPublications?.length || 0) +
            (faculty.activities?.length || 0)
          )
        }
      }))
    }

    // Fetch students with all achievements if filter is 'all' or 'students'
    if (filter === 'all' || filter === 'students') {
      const studentList = await db.student.findMany({
        where: { departmentId: id },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true }
          },
          achievements: achievementType && !['studentAchievement', 'achievement'].includes(achievementType) 
            ? false 
            : true,
          certifications: achievementType && achievementType !== 'studentCertification' 
            ? false 
            : true,
          placements: achievementType && achievementType !== 'placement' ? false : true,
          internships: achievementType && achievementType !== 'internship' ? false : true,
          npCourses: achievementType && achievementType !== 'npCourse' ? false : true,
          activities: achievementType && achievementType !== 'activity'
            ? false
            : { include: { activity: true } }
        },
        orderBy: { registerNumber: 'asc' }
      })

      // Transform student data with achievement counts
      result.students = studentList.map(student => ({
        id: student.id,
        registerNumber: student.registerNumber,
        rollNumber: student.rollNumber,
        name: student.user?.name,
        email: student.user?.email,
        phone: student.user?.phone,
        avatar: student.user?.avatar,
        semester: student.semester,
        section: student.section,
        batch: student.batch,
        cgpa: student.cgpa,
        admissionYear: student.admissionYear,
        graduationYear: student.graduationYear,
        photo: student.photo,
        achievements: {
          studentAchievements: student.achievements,
          certifications: student.certifications,
          placements: student.placements,
          internships: student.internships,
          npCourses: student.npCourses,
          activities: Array.isArray(student.activities) ? student.activities.map((sa: any) => sa.activity) : []
        },
        achievementCounts: {
          studentAchievements: student.achievements?.length || 0,
          certifications: student.certifications?.length || 0,
          placements: student.placements?.length || 0,
          internships: student.internships?.length || 0,
          npCourses: student.npCourses?.length || 0,
          activities: student.activities?.length || 0,
          total: (
            (student.achievements?.length || 0) +
            (student.certifications?.length || 0) +
            (student.placements?.length || 0) +
            (student.internships?.length || 0) +
            (student.npCourses?.length || 0) +
            (student.activities?.length || 0)
          )
        }
      }))
    }

    // Fetch department activities
    if (!achievementType || achievementType === 'activity') {
      const activities = await db.activity.findMany({
        where: { departmentId: id },
        include: {
          _count: {
            select: {
              facultyActivities: true,
              studentActivities: true
            }
          }
        },
        orderBy: { startDate: 'desc' }
      })

      result.activities = activities
    }

    // Fetch research papers from the department
    if (!achievementType || achievementType === 'research') {
      const researchPapers = await db.research.findMany({
        where: { departmentId: id },
        include: {
          publications: {
            include: {
              faculty: {
                include: {
                  user: { select: { name: true, email: true } }
                }
              }
            }
          },
          _count: {
            select: {
              publications: true
            }
          }
        },
        orderBy: { publishDate: 'desc' }
      })

      result.researchPapers = researchPapers
    }

    // Calculate summary statistics
    const summary = {
      department: {
        totalFaculty: department._count.faculty,
        totalStudents: department._count.students,
        totalActivities: department._count.activities,
        totalResearchPapers: department._count.research,
        totalBatches: department._count.batches
      },
      achievements: {
        // Faculty achievements
        totalAwards: result.faculty.reduce((sum: number, f: any) => sum + (f.achievementCounts?.awards || 0), 0),
        totalFacultyCertifications: result.faculty.reduce((sum: number, f: any) => sum + (f.achievementCounts?.certifications || 0), 0),
        totalPatents: result.faculty.reduce((sum: number, f: any) => sum + (f.achievementCounts?.patents || 0), 0),
        totalBooks: result.faculty.reduce((sum: number, f: any) => sum + (f.achievementCounts?.books || 0), 0),
        totalProjects: result.faculty.reduce((sum: number, f: any) => sum + (f.achievementCounts?.projects || 0), 0),
        totalFdpPrograms: result.faculty.reduce((sum: number, f: any) => sum + (f.achievementCounts?.fdpPrograms || 0), 0),
        totalConsultancies: result.faculty.reduce((sum: number, f: any) => sum + (f.achievementCounts?.consultancies || 0), 0),
        totalResearchPublications: result.faculty.reduce((sum: number, f: any) => sum + (f.achievementCounts?.researchPublications || 0), 0),
        
        // Student achievements
        totalStudentAchievements: result.students.reduce((sum: number, s: any) => sum + (s.achievementCounts?.studentAchievements || 0), 0),
        totalStudentCertifications: result.students.reduce((sum: number, s: any) => sum + (s.achievementCounts?.certifications || 0), 0),
        totalPlacements: result.students.reduce((sum: number, s: any) => sum + (s.achievementCounts?.placements || 0), 0),
        totalInternships: result.students.reduce((sum: number, s: any) => sum + (s.achievementCounts?.internships || 0), 0),
        totalNpCourses: result.students.reduce((sum: number, s: any) => sum + (s.achievementCounts?.npCourses || 0), 0),
        
        // Grand totals
        grandTotalFacultyAchievements: result.faculty.reduce((sum: number, f: any) => sum + (f.achievementCounts?.total || 0), 0),
        grandTotalStudentAchievements: result.students.reduce((sum: number, s: any) => sum + (s.achievementCounts?.total || 0), 0)
      },
      // Top performers by achievement count
      topFacultyPerformers: [...result.faculty]
        .sort((a: any, b: any) => (b.achievementCounts?.total || 0) - (a.achievementCounts?.total || 0))
        .slice(0, 5)
        .map((f: any) => ({
          id: f.id,
          name: f.name,
          isHOD: f.isHOD,
          totalAchievements: f.achievementCounts?.total || 0,
          breakdown: f.achievementCounts
        })),
      topStudentPerformers: [...result.students]
        .sort((a: any, b: any) => (b.achievementCounts?.total || 0) - (a.achievementCounts?.total || 0))
        .slice(0, 5)
        .map((s: any) => ({
          id: s.id,
          registerNumber: s.registerNumber,
          name: s.name,
          cgpa: s.cgpa,
          totalAchievements: s.achievementCounts?.total || 0,
          breakdown: s.achievementCounts
        }))
    }

    result.summary = summary

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        filter,
        achievementType,
        requestedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching department details:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch department details',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
