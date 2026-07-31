import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')

    // Get all departments with detailed counts
    const whereClause = departmentId ? { id: departmentId } : {}

    const departments = await db.department.findMany({
      where: { ...whereClause, isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            faculty: true,
            students: true,
            activities: true,
            research: true,
            batches: true,
          },
        },
        faculty: {
          select: {
            id: true,
            designation: true,
            isHOD: true,
            qualification: true,
            name: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        batches: {
          select: {
            id: true,
            name: true,
            year: true,
            strength: true,
            _count: {
              select: { students: true },
            },
          },
          orderBy: { year: 'desc' },
        },
      },
    })

    // Calculate detailed metrics for each department
    const departmentResults = await Promise.all(
      departments.map(async (dept) => {
        // Get HOD info
        const hod = dept.faculty.find((f) => f.isHOD)

        // Get faculty by designation
        const professors = dept.faculty.filter((f) => 
          f.designation?.includes('Professor') || f.designation?.includes('Dr.')
        ).length
        const associateProfessors = dept.faculty.filter((f) => 
          f.designation?.includes('Associate')
        ).length
        assistantProfessors = dept.faculty.filter((f) => 
          f.designation?.includes('Assistant')
        ).length

        // Get research count for this department
        const researchCount = await db.research.count({
          where: { departmentId: dept.id },
        })

        // Get placements (through students)
        const placementCount = await db.placement.count({
          where: {
            student: { departmentId: dept.id },
          },
        })

        // Get achievements count
        const achievementCount = await db.studentAchievement.count({
          where: {
            student: { departmentId: dept.id },
            approvalStatus: 'APPROVED',
          },
        })

        // Get certifications count
        const certificationCount = await db.studentCertification.count({
          where: {
            student: { departmentId: dept.id },
            approvalStatus: 'APPROVED',
          },
        })

        // Get activities by status
        const completedActivities = await db.activity.count({
          where: {
            departmentId: dept.id,
            status: 'COMPLETED',
          },
        })
        const ongoingActivities = await db.activity.count({
          where: {
            departmentId: dept.id,
            status: 'ONGOING',
          },
        })

        // Calculate total students per batch
        const batchDetails = dept.batches.map((batch) => ({
          id: batch.id,
          name: batch.name,
          year: batch.year,
          strength: batch.strength || 0,
          actualStudents: batch._count.students,
        }))

        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          description: dept.description,
          vision: dept.vision,
          mission: dept.mission,
          establishedYear: dept.establishedYear,
          hod: hod ? { 
            id: hod.id, 
            name: hod.user?.name, 
            email: hod.user?.email,
            isHOD: hod.isHOD 
          } : null,
          stats: {
            totalFaculty: dept._count.faculty,
            totalStudents: dept._count.students,
            totalActivities: dept._count.activities,
            totalBatches: dept._count.batches,
            totalResearch: researchCount,
            placements: placementCount,
            achievements: achievementCount,
            certifications: certificationCount,
            completedActivities,
            ongoingActivities,
          },
          facultyBreakdown: {
            professors,
            associateProfessors,
            assistantProfessors,
            others: Math.max(0, dept._count.faculty - professors - associateProfessors - assistantProfessors),
          },
          batches: batchDetails,
        }
      })
    )

    // Institution-wide aggregates
    const totals = {
      totalDepartments: departmentResults.length,
      totalFaculty: departmentResults.reduce((sum, d) => sum + d.stats.totalFaculty, 0),
      totalStudents: departmentResults.reduce((sum, d) => sum + d.stats.totalStudents, 0),
      totalActivities: departmentResults.reduce((sum, d) => sum + d.stats.totalActivities, 0),
      totalResearch: departmentResults.reduce((sum, d) => sum + d.stats.totalResearch, 0),
      totalPlacements: departmentResults.reduce((sum, d) => sum + d.stats.placements, 0),
      totalAchievements: departmentResults.reduce((sum, d) => sum + d.stats.achievements, 0),
      totalCertifications: departmentResults.reduce((sum, d) => sum + d.stats.certifications, 0),
    }

    return NextResponse.json({
      success: true,
      data: {
        departments: departmentResults,
        totals,
      },
    })
  } catch (error) {
    console.error('Error fetching department results:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch department results' },
      { status: 500 }
    )
  }
}
