import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const { reportData, department } = await request.json()

    // Create workbook
    const wb = XLSX.utils.book_new()

    // Sheet 1: Header Info
    const headerData = [
      ['NEHRU INSTITUTE OF ENGINEERING AND TECHNOLOGY (AUTONOMOUS)'],
      ['ISO 9001:2015 & ISO 14001:2015 Certified | NAAC "A+" | NBA Accredited'],
      [''],
      ['MONTHLY DEPARTMENT REPORT'],
      [`Academic Year: ${reportData.academicYear}`],
      [''],
      ['SCHOOL/DEPARTMENT INFORMATION'],
      ['Name of the School', reportData.schoolName || ''],
      ['Department', reportData.department || ''],
      ['Reporting Month', reportData.reportingMonth || ''],
      ['Reporting Year', reportData.reportingYear || ''],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(headerData)
    XLSX.utils.book_append_sheet(wb, ws1, 'Header')

    // Sheet 2: Department Basic Info
    const deptData = [
      ['DEPT. BASIC INFORMATION'],
      [''],
      ['Number of Faculty', reportData.facultyCount || '', 'No. of Prof', reportData.profCount || '', 'No. of AsP', reportData.aspCount || '', 'No. of AP', reportData.apCount || ''],
      ['PhD Holders', reportData.phdHolders || '', 'No. of PhD', reportData.phdCount || '', 'Pursuing PhD', reportData.pursuingPhd || '', 'Not Registered', reportData.notRegistered || ''],
      [''],
      ['Number of Students', reportData.totalStudents || ''],
      ['I Year', reportData.year1Students || '', 'II Year', reportData.year2Students || '', 'III Year', reportData.year3Students || '', 'IV Year', reportData.year4Students || ''],
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(deptData)
    XLSX.utils.book_append_sheet(wb, ws2, 'Dept Info')

    // Sheet 3: Academic Activities
    const acadData = [
      ['A. ACADEMIC ACTIVITIES'],
      [''],
      ['Particulars', 'Theory', 'Lab / Practical'],
      ['Syllabus Coverage', reportData.syllabusCoverageTheory || '', reportData.syllabusCoverageLab || ''],
      ['Lesson Plan Update', reportData.lessonPlanTheory || '', reportData.lessonPlanLab || ''],
      ['CIA Conducted & Report Submitted', reportData.ciaConducted || '', 'NA'],
      ['Student Attendance Report Prepared', reportData.attendanceReport || '', ''],
      ['Remedial Classes Conducted', reportData.remedialClasses || '', 'NA'],
      ['Mentoring Sessions Conducted', reportData.mentoringSessions || '', 'NA'],
    ]
    const ws3 = XLSX.utils.aoa_to_sheet(acadData)
    XLSX.utils.book_append_sheet(wb, ws3, 'Academic Activities')

    // Sheet 4: Student Development
    const studentDevHeaders = ['B. STUDENT DEVELOPMENT ACTIVITIES', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
    const studentDevSubheaders = ['Particulars', 'Guest Lectures (P)', '(C)', 'Workshops (P)', '(C)', 'Ind. Visits (P)', '(C)', 'Value Added (P)', '(C)', 'Skill Enhance (P)', '(C)', 'Hands-on (P)', '(C)', 'Hackathon (P)', '(C)', 'Prof Society']
    const studentDevRow1 = ['Prev Months*', 
      reportData.studentDev.guestLectures.prev || '', '',
      reportData.studentDev.workshops.prev || '',
      reportData.studentDev.industrialVisits.prev || '',
      reportData.studentDev.valueAddedCourses.prev || '',
      reportData.studentDev.skillEnhancement.prev || '',
      reportData.studentDev.handsOnTraining.prev || '',
      reportData.studentDev.hackathon.prev || '', ''
    ]
    const studentDevRow2 = ['Current Month',
      '', reportData.studentDev.guestLectures.curr || '',
      '', reportData.studentDev.workshops.curr || '',
      '', reportData.studentDev.industryVisits.curr || '',
      '', reportData.studentDev.valueAddedCourses.curr || '',
      '', reportData.studentDev.skillEnhancement.curr || '',
      '', reportData.studentDev.handsOnTraining.curr || '',
      '', reportData.studentDev.hackathon.curr || ''
    ]
    
    const ws4 = XLSX.utils.aoa_to_sheet([studentDevHeaders, studentDevSubheaders, studentDevRow1, studentDevRow2])
    XLSX.utils.book_append_sheet(wb, ws4, 'Student Dev')

    // Sheet 5: Research & Innovation
    const researchHeaders = ['C. RESEARCH & INNOVATION - Faculty Wise', '', '', '', '', '', '', '', '', '', '', '', '', '']
    const researchSubheaders = ['Faculty Name', 'Journal Pub (P)', '(C)', 'Conf Papers (P)', '(C)', 'Book (P)', '(C)', 'Book Ch (P)', '(C)', 'Patents (P)', '(C)', 'Funded Proj (P)', '(C)']
    const researchRows: any[] = []
    reportData.researchFaculty.forEach((f: any, i: number) => {
      researchRows.push([
        f.name || `Faculty ${i + 1}`,
        f.journalPub.prev || '', f.journalPub.curr || '',
        f.conferencePapers.prev || '', f.conferencePapers.curr || '',
        f.book.prev || '', f.book.curr || '',
        f.bookChapters.prev || '', f.bookChapters.curr || '',
        f.patents.prev || '', f.patents.curr || '',
        f.fundedProjects.prev || '', f.fundedProjects.curr || ''
      ])
    })
    const ws5 = XLSX.utils.aoa_to_sheet([researchHeaders, researchSubheaders, ...researchRows])
    XLSX.utils.book_append_sheet(wb, ws5, 'Research')

    // Sheet 6: Faculty Development
    const facultyDevHeaders = ['D. FACULTY DEVELOPMENT', '', '', '', '', '', '', '', '', '', '', '']
    const facultyDevSubheaders = ['Faculty Name', 'FDPs Attended (P)', '(C)', 'FDPs Organized (P)', '(C)', 'NPTEL (P)', '(C)', 'MOOCs (P)', '(C)', 'Resource Person (P)', '(C)']
    const facultyDevRows: any[] = []
    reportData.facultyDev.forEach((f: any, i: number) => {
      facultyDevRows.push([
        f.name || `Faculty ${i + 1}`,
        f.fdpsAttended.prev || '', f.fdpsAttended.curr || '',
        f.fdpsOrganized.prev || '', f.fdpsOrganized.curr || '',
        f.nptelCompleted.prev || '', f.nptelCompleted.curr || '',
        f.moocsCompleted.prev || '', f.moocsCompleted.curr || '',
        f.resourcePerson.prev || '', f.resourcePerson.curr || ''
      ])
    })
    const ws6 = XLSX.utils.aoa_to_sheet([facultyDevHeaders, facultyDevSubheaders, ...facultyDevRows])
    XLSX.utils.book_append_sheet(wb, ws6, 'Faculty Dev')

    // Sheet 7: Internship
    const internData = [
      ['E. STUDENTS INTERNSHIP'],
      [''],
      ['Internship Details', 'Paid', 'Non-Paid', 'Virtual', 'Not Availed'],
      ['Previous Months', reportData.internship.previous.paid || '', reportData.internship.previous.nonPaid || '', reportData.internship.previous.virtual || '', reportData.internship.previous.notAvailed || ''],
      ['Current Month', reportData.internship.current.paid || '', reportData.internship.current.nonPaid || '', reportData.internship.current.virtual || '', reportData.internship.current.notAvailed || ''],
      ['Total (Cumulative)', reportData.internship.total.paid || '', reportData.internship.total.nonPaid || '', reportData.internship.total.virtual || '', reportData.internship.total.notAvailed || ''],
    ]
    const ws7 = XLSX.utils.aoa_to_sheet(internData)
    XLSX.utils.book_append_sheet(wb, ws7, 'Internship')

    // Sheet 8: Quality Assurance
    const qaData = [
      ['G. QUALITY ASSURANCE ACTIVITIES'],
      [''],
      ['Particulars', 'Status', 'Remarks'],
    ]
    reportData.qaActivities.forEach((item: any) => {
      qaData.push([item.particular, item.status, item.remarks])
    })
    const ws8 = XLSX.utils.aoa_to_sheet(qaData)
    XLSX.utils.book_append_sheet(wb, ws8, 'QA Activities')

    // Sheet 9: Documents Checklist
    const docData = [
      ['H. DOCUMENTS TO BE ATTACHED'],
      [''],
      ['Document', 'Attached'],
      ['Event Reports', reportData.documents.eventReports ? '✓' : '☐'],
      ['Workshop/FDP Certificates', reportData.documents.workshopCertificates ? '✓' : '☐'],
      ['Publication Proofs', reportData.documents.publicationProofs ? '✓' : '☐'],
      ['Placement Details', reportData.documents.placementDetails ? '✓' : '☐'],
      ['Internship Details', reportData.documents.internshipDetails ? '✓' : '☐'],
      ['Student Achievement Proofs', reportData.documents.studentAchievementProofs ? '✓' : '☐'],
      ['SDG Extension Reports', reportData.documents.sdgExtensionReports ? '✓' : '☐'],
      ['MoU/Industry Documents', reportData.documents.mouIndustryDocuments ? '✓' : '☐'],
    ]
    const ws9 = XLSX.utils.aoa_to_sheet(docData)
    XLSX.utils.book_append_sheet(wb, ws9, 'Documents')

    // Generate buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

    // Return as response
    return new NextResponse(new Uint8Array(excelBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Monthly_Report_${department}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Excel generation error:', error)
    return NextResponse.json({ error: 'Failed to generate Excel' }, { status: 500 })
  }
}
