import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'weekly', 'monthly', 'yearly'
    const format = searchParams.get('format') // 'json', 'csv', 'xlsx', 'pdf', 'summary'
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
            consultations: {
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
            ...f.consultations.map(c => ({ ...c, achievementType: 'consultancy', staffName: f.user.name, designation: f.designation, department: dept.name }))
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
      return generateCSV(reportData, type, now, periodLabel)
    }

    if (format === 'xlsx') {
      return generateExcel(reportData, type, now, periodLabel)
    }

    if (format === 'pdf') {
      return generatePDF(reportData, type, now, periodLabel)
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

// CSV Generation
function generateCSV(reportData: any, type: string | null, now: Date, periodLabel: string) {
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

// Excel Generation using xlsx library
async function generateExcel(reportData: any, type: string | null, now: Date, periodLabel: string) {
  // Dynamic import for xlsx
  const XLSX = await import('xlsx')
  
  // Create workbook
  const wb = XLSX.utils.book_new()
  
  // Sheet 1: Executive Summary
  const summaryData = [
    ['NIET IQAC REPORT'],
    [periodLabel],
    [`Generated: ${now.toLocaleDateString()}`],
    [''],
    ['EXECUTIVE SUMMARY'],
    ['Metric', 'Value'],
    ['Total Students', reportData.executiveSummary.totalStudents],
    ['Total Faculty', reportData.executiveSummary.totalFaculty],
    ['Total HODs', reportData.executiveSummary.totalHODs],
    ['Total Activities', reportData.executiveSummary.totalActivities],
    ['Total Research Papers', reportData.executiveSummary.totalResearch],
    ['Total Achievements', reportData.executiveSummary.totalAchievements || 0],
    ['Total Placements', reportData.executiveSummary.totalPlacements || 0],
    ['Total Internships', reportData.executiveSummary.totalInternships || 0],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary')
  
  // Sheet 2: Department Breakdown
  const deptHeaders = ['Department', 'Code', 'Students', 'Faculty', 'HOD', 'Activities', 'Research', 'Student Ach.', 'Staff Ach.', 'HOD Ach.', 'Total']
  const deptRows = reportData.departmentReports.map((dept: any) => [
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
  ])
  const wsDept = XLSX.utils.aoa_to_sheet([deptHeaders, ...deptRows])
  XLSX.utils.book_append_sheet(wb, wsDept, 'Departments')
  
  // Sheet 3: Rankings
  const rankingData = [
    ['TOP DEPARTMENTS BY TOTAL ACHIEVEMENTS'],
    ['Rank', 'Department', 'Total Achievements'],
    ...reportData.rankings.byTotalAchievements.slice(0, 10).map((d: any, i: number) => [i + 1, d.name, d.total]),
    [''],
    ['TOP BY STUDENT ACHIEVEMENTS'],
    ['Rank', 'Department', 'Count'],
    ...reportData.rankings.byStudentAchievements.slice(0, 10).map((d: any, i: number) => [i + 1, d.name, d.count]),
    [''],
    ['PLACEMENT RATE RANKING'],
    ['Rank', 'Department', 'Placement Rate (%)'],
    ...reportData.rankings.byPlacementRate.slice(0, 10).map((d: any, i: number) => [i + 1, d.name, d.rate + '%']),
  ]
  const wsRanking = XLSX.utils.aoa_to_sheet(rankingData)
  XLSX.utils.book_append_sheet(wb, wsRanking, 'Rankings')
  
  // Sheet 4: Detailed Achievements (if any exist)
  const allAchievements: any[] = []
  reportData.departmentReports.forEach((dept: any) => {
    dept.achievements.student.items.forEach((item: any) => {
      allAchievements.push(['Student', dept.name, item.studentName || '', item.title || item.name || '', item.type || '', item.status || ''])
    })
    dept.achievements.staff.items.forEach((item: any) => {
      allAchievements.push(['Staff', dept.name, item.staffName || '', item.title || item.name || '', item.achievementType || '', item.status || ''])
    })
    dept.achievements.hod.items.forEach((item: any) => {
      allAchievements.push(['HOD', dept.name, item.staffName || '', item.title || item.name || '', item.achievementType || '', item.status || ''])
    })
  })
  
  if (allAchievements.length > 0) {
    const achHeaders = ['Role', 'Department', 'Person', 'Title', 'Type', 'Status']
    const wsAch = XLSX.utils.aoa_to_sheet([achHeaders, ...allAchievements])
    XLSX.utils.book_append_sheet(wb, wsAch, 'Achievements')
  }
  
  // Set landscape orientation for all worksheets
  wb.SheetNames.forEach((sheetName) => {
    if (wb.Sheets[sheetName]) {
      wb.Sheets[sheetName]['!pageSetup'] = { orientation: 'landscape', paperSize: 9 }
    }
  })

  // Generate buffer
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  
  return new NextResponse(excelBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="iqac-report-${type || 'all'}-${now.toISOString().split('T')[0]}.xlsx"`
    }
  })
}

// PDF Generation - HTML-based professional report
async function generatePDF(reportData: any, type: string | null, now: Date, periodLabel: string) {
  // Build HTML content for the PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>NIET IQAC Report</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #1e293b;
      background: #ffffff;
    }
    
    /* Header */
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 3px solid #059669;
      margin-bottom: 25px;
    }
    
    .header h1 {
      font-size: 24px;
      color: #059669;
      font-weight: 700;
      margin-bottom: 5px;
    }
    
    .header .subtitle {
      font-size: 14px;
      color: #64748b;
    }
    
    .header .date {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 5px;
    }
    
    /* Section */
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #059669;
      background: #ecfdf5;
      padding: 10px 15px;
      border-left: 4px solid #059669;
      margin-bottom: 15px;
    }
    
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #059669;
    }
    
    .stat-label {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    
    th {
      background: #059669;
      color: white;
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.5px;
    }
    
    td {
      padding: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    tr:nth-child(even) {
      background: #f8fafc;
    }
    
    tr:hover {
      background: #ecfdf5;
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-center {
      text-align: center;
    }
    
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 9px;
      font-weight: 600;
    }
    
    .badge-blue {
      background: #dbeafe;
      color: #1d4ed8;
    }
    
    .badge-green {
      background: #dcfce7;
      color: #15803d;
    }
    
    .badge-purple {
      background: #f3e8ff;
      color: #7c3aed;
    }
    
    .badge-gray {
      background: #f1f5f9;
      color: #475569;
    }
    
    /* Rankings */
    .ranking-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    
    .ranking-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: #f8fafc;
      border-radius: 6px;
    }
    
    .rank-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 12px;
      color: white;
      flex-shrink: 0;
    }
    
    .rank-1 { background: #f59e0b; }
    .rank-2 { background: #6b7280; }
    .rank-3 { background: #d97706; }
    .rank-other { background: #94a3b8; }
    
    .rank-name {
      flex: 1;
      font-weight: 500;
    }
    
    .rank-value {
      font-weight: 700;
      color: #059669;
    }
    
    /* Footer */
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 9px;
      color: #94a3b8;
    }
    
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>NIET IQAC Report</h1>
    <div class="subtitle">${periodLabel}</div>
    <div class="date">Generated on ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>

  <!-- Executive Summary -->
  <div class="section">
    <div class="section-title">Executive Summary</div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${reportData.executiveSummary.totalStudents}</div>
        <div class="stat-label">Total Students</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${reportData.executiveSummary.totalFaculty}</div>
        <div class="stat-label">Total Faculty</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${reportData.executiveSummary.totalHODs}</div>
        <div class="stat-label">Total HODs</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${reportData.executiveSummary.totalActivities || 0}</div>
        <div class="stat-label">Activities</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${reportData.executiveSummary.totalResearch || 0}</div>
        <div class="stat-label">Research Papers</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${reportData.executiveSummary.totalAchievements || 0}</div>
        <div class="stat-label">Total Achievements</div>
      </div>
    </div>
  </div>

  <!-- Department Reports Table -->
  <div class="section">
    <div class="section-title">Department-wise Performance</div>
    <table>
      <thead>
        <tr>
          <th>Department</th>
          <th class="text-center">Code</th>
          <th class="text-center">Students</th>
          <th class="text-center">Faculty</th>
          <th class="text-center">HOD</th>
          <th class="text-center">Activities</th>
          <th class="text-center">Research</th>
          <th class="text-center">Student Ach.</th>
          <th class="text-center">Staff Ach.</th>
          <th class="text-center">HOD Ach.</th>
          <th class="text-center">Total</th>
        </tr>
      </thead>
      <tbody>
        ${reportData.departmentReports.map((dept: any) => `
        <tr>
          <td><strong>${dept.name}</strong></td>
          <td class="text-center">${dept.code}</td>
          <td class="text-center">${dept.summary.students}</td>
          <td class="text-center">${dept.summary.faculty}</td>
          <td class="text-center">${dept.summary.hod}</td>
          <td class="text-center">${dept.summary.activities}</td>
          <td class="text-center">${dept.summary.research}</td>
          <td class="text-center"><span class="badge badge-blue">${dept.achievements.student.count}</span></td>
          <td class="text-center"><span class="badge badge-green">${dept.achievements.staff.count}</span></td>
          <td class="text-center"><span class="badge badge-purple">${dept.achievements.hod.count}</span></td>
          <td class="text-center"><span class="badge badge-gray">${dept.achievements.total}</span></td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- Rankings -->
  <div class="section">
    <div class="section-title">Top Performers</div>
    <div class="ranking-list">
      <div>
        <p style="font-weight: 600; margin-bottom: 10px; color: #374151;">By Total Achievements</p>
        ${(reportData.rankings.byTotalAchievements || []).slice(0, 5).map((dept: any, idx: number) => `
        <div class="ranking-item">
          <span class="rank-badge ${idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-other'}">${idx + 1}</span>
          <span class="rank-name">${dept.name}</span>
          <span class="rank-value">${dept.total}</span>
        </div>
        `).join('')}
      </div>
      <div>
        <p style="font-weight: 600; margin-bottom: 10px; color: #374151;">By Placement Rate</p>
        ${(reportData.rankings.byPlacementRate || []).slice(0, 5).map((dept: any, idx: number) => `
        <div class="ranking-item">
          <span class="rank-badge ${idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-other'}">${idx + 1}</span>
          <span class="rank-name">${dept.name}</span>
          <span class="rank-value">${dept.rate}%</span>
        </div>
        `).join('')}
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>This report was auto-generated by NIET IQAC Management System</p>
    <p>Confidential - For Internal Use Only</p>
  </div>
</body>
</html>
  `

  // Use Playwright or html-based conversion for PDF
  // For simplicity, we'll return HTML that can be converted to PDF client-side
  // Or use a server-side approach
  
  // Return as HTML with PDF content-type hint
  // In production, you'd use puppeteer/playwright to convert to actual PDF
  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="iqac-report-${type || 'all'}-${now.toISOString().split('T')[0]}.html"`,
      'X-PDF-Hint': 'true'
    }
  })
}
