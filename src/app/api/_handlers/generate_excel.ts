import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const { reportData, department } = await request.json()

    // Safely access nested properties with fallbacks
    const data = reportData || {}
    const studentDev = data.studentDev || {}
    const internship = data.internship || {}
    const documents = data.documents || {}
    const qaActivities = data.qaActivities || []
    const researchFaculty = data.researchFaculty || []
    const facultyDev = data.facultyDev || []

    // Create workbook
    const wb = XLSX.utils.book_new()

    // Sheet 1: Header Info
    const headerData = [
      ['NEHRU INSTITUTE OF ENGINEERING AND TECHNOLOGY (AUTONOMOUS)'],
      ['ISO 9001:2015 & ISO 14001:2015 Certified | NAAC "A+" | NBA Accredited'],
      [''],
      ['MONTHLY DEPARTMENT REPORT'],
      [`Academic Year: ${data.academicYear || ''}`],
      [''],
      ['SCHOOL/DEPARTMENT INFORMATION'],
      ['Name of the School', data.schoolName || ''],
      ['Department', data.department || ''],
      ['Reporting Month', data.reportingMonth || ''],
      ['Reporting Year', data.reportingYear || ''],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(headerData)
    XLSX.utils.book_append_sheet(wb, ws1, 'Header')

    // Sheet 2: Department Basic Info
    const deptData = [
      ['DEPT. BASIC INFORMATION'],
      [''],
      ['Number of Faculty', data.facultyCount || '', 'No. of Prof', data.profCount || '', 'No. of AsP', data.aspCount || '', 'No. of AP', data.apCount || ''],
      ['PhD Holders', data.phdHolders || '', 'No. of PhD', data.phdCount || '', 'Pursuing PhD', data.pursuingPhd || '', 'Not Registered', data.notRegistered || ''],
      [''],
      ['Number of Students', data.totalStudents || ''],
      ['I Year', data.year1Students || '', 'II Year', data.year2Students || '', 'III Year', data.year3Students || '', 'IV Year', data.year4Students || ''],
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(deptData)
    XLSX.utils.book_append_sheet(wb, ws2, 'Dept Info')

    // Sheet 3: Academic Activities
    const acadData = [
      ['A. ACADEMIC ACTIVITIES'],
      [''],
      ['Particulars', 'Theory', 'Lab / Practical'],
      ['Syllabus Coverage', data.syllabusCoverageTheory || '', data.syllabusCoverageLab || ''],
      ['Lesson Plan Update', data.lessonPlanTheory || '', data.lessonPlanLab || ''],
      ['CIA Conducted & Report Submitted', data.ciaConducted || '', 'NA'],
      ['Student Attendance Report Prepared', data.attendanceReport || '', ''],
      ['Remedial Classes Conducted', data.remedialClasses || '', 'NA'],
      ['Mentoring Sessions Conducted', data.mentoringSessions || '', 'NA'],
    ]
    const ws3 = XLSX.utils.aoa_to_sheet(acadData)
    XLSX.utils.book_append_sheet(wb, ws3, 'Academic Activities')

    // Sheet 4: Student Development
    const guestLectures = studentDev.guestLectures || {}
    const workshops = studentDev.workshops || {}
    const industrialVisits = studentDev.industrialVisits || {}
    const valueAddedCourses = studentDev.valueAddedCourses || {}
    const skillEnhancement = studentDev.skillEnhancement || {}
    const handsOnTraining = studentDev.handsOnTraining || {}
    const hackathon = studentDev.hackathon || {}

    const studentDevHeaders = ['B. STUDENT DEVELOPMENT ACTIVITIES', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
    const studentDevSubheaders = ['Particulars', 'Guest Lectures (P)', '(C)', 'Workshops (P)', '(C)', 'Ind. Visits (P)', '(C)', 'Value Added (P)', '(C)', 'Skill Enhance (P)', '(C)', 'Hands-on (P)', '(C)', 'Hackathon (P)', '(C)', 'Prof Society']
    const studentDevRow1 = ['Prev Months*', 
      guestLectures.prev || '', '',
      workshops.prev || '',
      industrialVisits.prev || '',
      valueAddedCourses.prev || '',
      skillEnhancement.prev || '',
      handsOnTraining.prev || '',
      hackathon.prev || '', ''
    ]
    const studentDevRow2 = ['Current Month',
      '', guestLectures.curr || '',
      '', workshops.curr || '',
      '', industrialVisits.curr || '',
      '', valueAddedCourses.curr || '',
      '', skillEnhancement.curr || '',
      '', handsOnTraining.curr || '',
      '', hackathon.curr || ''
    ]
    
    const ws4 = XLSX.utils.aoa_to_sheet([studentDevHeaders, studentDevSubheaders, studentDevRow1, studentDevRow2])
    XLSX.utils.book_append_sheet(wb, ws4, 'Student Dev')

    // Sheet 5: Research & Innovation
    const researchHeaders = ['C. RESEARCH & INNOVATION - Faculty Wise', '', '', '', '', '', '', '', '', '', '', '', '', '']
    const researchSubheaders = ['Faculty Name', 'Journal Pub (P)', '(C)', 'Conf Papers (P)', '(C)', 'Book (P)', '(C)', 'Book Ch (P)', '(C)', 'Patents (P)', '(C)', 'Funded Proj (P)', '(C)']
    const researchRows: any[] = []
    const safeResearchFaculty = Array.isArray(researchFaculty) ? researchFaculty : []
    safeResearchFaculty.forEach((f: any, i: number) => {
      if (!f) return
      const journalPub = f.journalPub || {}
      const conferencePapers = f.conferencePapers || {}
      const book = f.book || {}
      const bookChapters = f.bookChapters || {}
      const patents = f.patents || {}
      const fundedProjects = f.fundedProjects || {}
      
      researchRows.push([
        f.name || `Faculty ${i + 1}`,
        journalPub.prev || '', journalPub.curr || '',
        conferencePapers.prev || '', conferencePapers.curr || '',
        book.prev || '', book.curr || '',
        bookChapters.prev || '', bookChapters.curr || '',
        patents.prev || '', patents.curr || '',
        fundedProjects.prev || '', fundedProjects.curr || ''
      ])
    })
    
    // Ensure at least one row exists
    if (researchRows.length === 0) {
      researchRows.push(['(No faculty data)', '', '', '', '', '', '', '', '', '', '', '', ''])
    }
    
    const ws5 = XLSX.utils.aoa_to_sheet([researchHeaders, researchSubheaders, ...researchRows])
    XLSX.utils.book_append_sheet(wb, ws5, 'Research')

    // Sheet 6: Faculty Development
    const facultyDevHeaders = ['D. FACULTY DEVELOPMENT', '', '', '', '', '', '', '', '', '', '', '']
    const facultyDevSubheaders = ['Faculty Name', 'FDPs Attended (P)', '(C)', 'FDPs Organized (P)', '(C)', 'NPTEL (P)', '(C)', 'MOOCs (P)', '(C)', 'Resource Person (P)', '(C)']
    const facultyDevRows: any[] = []
    const safeFacultyDev = Array.isArray(facultyDev) ? facultyDev : []
    safeFacultyDev.forEach((f: any, i: number) => {
      if (!f) return
      const fdpsAttended = f.fdpsAttended || {}
      const fdpsOrganized = f.fdpsOrganized || {}
      const nptelCompleted = f.nptelCompleted || {}
      const moocsCompleted = f.moocsCompleted || {}
      const resourcePerson = f.resourcePerson || {}
      
      facultyDevRows.push([
        f.name || `Faculty ${i + 1}`,
        fdpsAttended.prev || '', fdpsAttended.curr || '',
        fdpsOrganized.prev || '', fdpsOrganized.curr || '',
        nptelCompleted.prev || '', nptelCompleted.curr || '',
        moocsCompleted.prev || '', moocsCompleted.curr || '',
        resourcePerson.prev || '', resourcePerson.curr || ''
      ])
    })
    
    // Ensure at least one row exists
    if (facultyDevRows.length === 0) {
      facultyDevRows.push(['(No faculty data)', '', '', '', '', '', '', '', '', '', ''])
    }
    
    const ws6 = XLSX.utils.aoa_to_sheet([facultyDevHeaders, facultyDevSubheaders, ...facultyDevRows])
    XLSX.utils.book_append_sheet(wb, ws6, 'Faculty Dev')

    // Sheet 7: Internship
    const prevIntern = internship.previous || {}
    const currIntern = internship.current || ''
    const totalIntern = internship.total || ''

    const internData = [
      ['E. STUDENTS INTERNSHIP'],
      [''],
      ['Internship Details', 'Paid', 'Non-Paid', 'Virtual', 'Not Availed'],
      ['Previous Months', prevIntern.paid || '', prevIntern.nonPaid || '', prevIntern.virtual || '', prevIntern.notAvailed || ''],
      ['Current Month', currIntern.paid || '', currIntern.nonPaid || '', currIntern.virtual || '', currIntern.notAvailed || ''],
      ['Total (Cumulative)', totalIntern.paid || '', totalIntern.nonPaid || '', totalIntern.virtual || '', totalIntern.notAvailed || ''],
    ]
    const ws7 = XLSX.utils.aoa_to_sheet(internData)
    XLSX.utils.book_append_sheet(wb, ws7, 'Internship')

    // Sheet 8: Quality Assurance
    const qaData = [
      ['G. QUALITY ASSURANCE ACTIVITIES'],
      [''],
      ['Particulars', 'Status', 'Remarks'],
    ]
    const safeQaActivities = Array.isArray(qaActivities) ? qaActivities : []
    safeQaActivities.forEach((item: any) => {
      if (item) {
        qaData.push([item.particular || '', item.status || '', item.remarks || ''])
      }
    })
    const ws8 = XLSX.utils.aoa_to_sheet(qaData)
    XLSX.utils.book_append_sheet(wb, ws8, 'QA Activities')

    // Sheet 9: Documents Checklist
    const docData = [
      ['H. DOCUMENTS TO BE ATTACHED'],
      [''],
      ['Document', 'Attached'],
      ['Event Reports', documents.eventReports ? '✓' : '☐'],
      ['Workshop/FDP Certificates', documents.workshopCertificates ? '✓' : '☐'],
      ['Publication Proofs', documents.publicationProofs ? '✓' : '☐'],
      ['Placement Details', documents.placementDetails ? '✓' : '☐'],
      ['Internship Details', documents.internshipDetails ? '✓' : '☐'],
      ['Student Achievement Proofs', documents.studentAchievementProofs ? '✓' : '☐'],
      ['SDG Extension Reports', documents.sdgExtensionReports ? '✓' : '☐'],
      ['MoU/Industry Documents', documents.mouIndustryDocuments ? '✓' : '☐'],
    ]
    const ws9 = XLSX.utils.aoa_to_sheet(docData)
    XLSX.utils.book_append_sheet(wb, ws9, 'Documents')

    // Set Landscape print orientation for all worksheets
    const sheets = [ws1, ws2, ws3, ws4, ws5, ws6, ws7, ws8, ws9]
    sheets.forEach((ws) => {
      ws['!pageSetup'] = { orientation: 'landscape', paperSize: 9 }
    })

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
    return NextResponse.json({ error: 'Failed to generate Excel: ' + (error as Error).message }, { status: 500 })
  }
}
