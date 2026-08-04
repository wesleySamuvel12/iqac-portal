import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { writeFileSync, unlinkSync, readFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  let tempHtmlPath = ''
  let tempPdfPath = ''
  
  try {
    const body = await request.json()
    const reportData = body.reportData || {}
    const department = body.department || ''

    // Generate HTML content for the PDF
    const htmlContent = generateReportHTML(reportData, department)

    // Create temp directory if not exists
    const tempDir = join(process.cwd(), 'temp')
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true })
    }

    // Write HTML to temp file
    const timestamp = Date.now()
    tempHtmlPath = join(tempDir, `report_${timestamp}.html`)
    tempPdfPath = join(tempDir, `report_${timestamp}.pdf`)
    
    writeFileSync(tempHtmlPath, htmlContent)

    // Try to generate PDF using Playwright (most reliable method)
    try {
      await generateWithPlaywright(htmlContent, tempPdfPath)
    } catch (playwrightError) {
      console.error('Playwright failed:', playwrightError)
      throw new Error('PDF generation failed: ' + (playwrightError as Error).message)
    }

    // Check if PDF was created
    if (!existsSync(tempPdfPath)) {
      throw new Error('PDF file was not generated')
    }

    // Read the generated PDF
    const pdfBuffer = readFileSync(tempPdfPath)

    // Clean up temp files
    try {
      if (existsSync(tempHtmlPath)) unlinkSync(tempHtmlPath)
      if (existsSync(tempPdfPath)) unlinkSync(tempPdfPath)
    } catch (e) {
      console.error('Cleanup error:', e)
    }

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Monthly_Department_Report_${department || 'NIET'}_${reportData?.reportingMonth || 'Report'}_${reportData?.reportingYear || new Date().getFullYear()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    
    // Cleanup on error
    try {
      if (tempHtmlPath && existsSync(tempHtmlPath)) unlinkSync(tempHtmlPath)
      if (tempPdfPath && existsSync(tempPdfPath)) unlinkSync(tempPdfPath)
    } catch (e) {}
    
    return NextResponse.json({ error: 'Failed to generate PDF: ' + (error as Error).message }, { status: 500 })
  }
}

async function generateWithPlaywright(htmlContent: string, outputPath: string): Promise<void> {
  // Dynamic import for playwright
  const { chromium } = await import('playwright')
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle' })
    
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        bottom: '12mm',
        left: '12mm',
        right: '12mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: '<div style="font-size: 8px; text-align: center; width: 100%; color: #9ca3af;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
    })
  } finally {
    await browser.close()
  }
}

function generateReportHTML(data: any, dept: string): string {
  // Safely access all nested properties with fallbacks
  const safeData = data || {}
  const studentDev = safeData.studentDev || {}
  const internship = safeData.internship || {}
  const documents = safeData.documents || {}
  const qaActivities = safeData.qaActivities || []
  const researchFaculty = safeData.researchFaculty || []
  const facultyDev = safeData.facultyDev || []
  
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  // Helper to build research faculty rows
  const researchRows = researchFaculty.map((f: any, i: number) => {
    if (!f) return ''
    const journalPub = f.journalPub || {}
    const conferencePapers = f.conferencePapers || {}
    const book = f.book || {}
    const bookChapters = f.bookChapters || {}
    const patents = f.patents || {}
    const fundedProjects = f.fundedProjects || {}
    
    return `
        <tr>
          <td class="text-left row-label">${f.name || `Faculty ${i + 1}`}</td>
          <td>${journalPub.prev || ''}</td><td>${journalPub.curr || ''}</td>
          <td>${conferencePapers.prev || ''}</td><td>${conferencePapers.curr || ''}</td>
          <td>${book.prev || ''}</td><td>${book.curr || ''}</td>
          <td>${bookChapters.prev || ''}</td><td>${bookChapters.curr || ''}</td>
          <td>${patents.prev || ''}</td><td>${patents.curr || ''}</td>
          <td>${fundedProjects.prev || ''}</td><td>${fundedProjects.curr || ''}</td>
        </tr>`
  }).join('') || '<tr><td colspan="13" style="text-align:center;color:#999;">No faculty data entered</td></tr>'

  // Helper to build faculty dev rows
  const facultyDevRows = facultyDev.map((f: any, i: number) => {
    if (!f) return ''
    const fdpsAttended = f.fdpsAttended || {}
    const fdpsOrganized = f.fdpsOrganized || {}
    const nptelCompleted = f.nptelCompleted || {}
    const moocsCompleted = f.moocsCompleted || {}
    const resourcePerson = f.resourcePerson || {}
    
    return `
        <tr>
          <td class="text-left row-label">${f.name || `Faculty ${i + 1}`}</td>
          <td>${fdpsAttended.prev || ''}</td><td>${fdpsAttended.curr || ''}</td>
          <td>${fdpsOrganized.prev || ''}</td><td>${fdpsOrganized.curr || ''}</td>
          <td>${nptelCompleted.prev || ''}</td><td>${nptelCompleted.curr || ''}</td>
          <td>${moocsCompleted.prev || ''}</td><td>${moocsCompleted.curr || ''}</td>
          <td>${resourcePerson.prev || ''}</td><td>${resourcePerson.curr || ''}</td>
        </tr>`
  }).join('') || '<tr><td colspan="11" style="text-align:center;color:#999;">No faculty data entered</td></tr>'

  // Helper for QA activities rows
  const qaRows = qaActivities.map((item: any) => {
    if (!item) return ''
    return `
        <tr>
          <td class="text-left row-label">${item.particular || ''}</td>
          <td>${item.status || '-'}</td>
          <td class="text-left">${item.remarks || '-'}</td>
        </tr>`
  }).join('') || '<tr><td colspan="3" style="text-align:center;color:#999;">No QA data entered</td></tr>'

  // Helper for documents checklist
  const docItems = [
    { key: 'eventReports', label: 'Event Reports' },
    { key: 'workshopCertificates', label: 'Workshop/FDP Certificates' },
    { key: 'publicationProofs', label: 'Publication Proofs' },
    { key: 'placementDetails', label: 'Placement Details' },
    { key: 'internshipDetails', label: 'Internship Details' },
    { key: 'studentAchievementProofs', label: 'Student Achievement Proofs' },
    { key: 'sdgExtensionReports', label: 'SDG Extension Reports' },
    { key: 'mouIndustryDocuments', label: 'MoU/Industry Documents' }
  ].map(doc => `
        <div class="checklist-item">
          <span class="checkbox">${documents[doc.key] ? '&#10003;' : ''}</span>
          <span>${doc.label}</span>
        </div>`).join('')

  // Safely get student dev properties
  const guestLectures = studentDev.guestLectures || {}
  const workshops = studentDev.workshops || {}
  const industrialVisits = studentDev.industrialVisits || {}
  const valueAddedCourses = studentDev.valueAddedCourses || {}
  const skillEnhancement = studentDev.skillEnhancement || {}
  const handsOnTraining = studentDev.handsOnTraining || {}
  const hackathon = studentDev.hackathon || {}

  // Safely get internship properties
  const prevIntern = internship.previous || {}
  const currIntern = internship.current || {}
  const totalIntern = internship.total || {}

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Department Report - ${dept}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 10pt;
      line-height: 1.3;
      color: #1a1a1a;
      background: #fff;
    }
    
    .report-header {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 3px double #1e40af;
    }
    
    .institute-name {
      font-size: 14pt;
      font-weight: bold;
      color: #1e40af;
      letter-spacing: 0.5px;
    }
    
    .institute-subtitle {
      font-size: 9pt;
      color: #4b5563;
      margin-top: 2px;
    }
    
    .report-title {
      font-size: 12pt;
      font-weight: bold;
      color: #fff;
      background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
      padding: 8px 15px;
      margin: 10px 0;
      border-radius: 4px;
    }
    
    .academic-year {
      font-size: 9pt;
      color: #6b7280;
      margin-top: 5px;
    }
    
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      background: #f8fafc;
    }
    
    .info-table td {
      padding: 5px 8px;
      border: 1px solid #e2e8f0;
      font-size: 9pt;
    }
    
    .info-table td.label {
      font-weight: 600;
      background: #e0e7ff;
      color: #3730a3;
      width: 30%;
    }
    
    .section {
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    
    .section-header {
      font-size: 11pt;
      font-weight: bold;
      color: #fff;
      padding: 6px 10px;
      margin-bottom: 8px;
      border-radius: 4px 4px 0 0;
    }
    
    .section-header.green { background: linear-gradient(135deg, #059669 0%, #10b981 100%); }
    .section-header.purple { background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); }
    .section-header.orange { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); }
    .section-header.blue { background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%); }
    .section-header.teal { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); }
    .section-header.lime { background: linear-gradient(135deg, #65a30d 0%, #84cc16 100%); }
    .section-header.indigo { background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%); }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      border: 1px solid #cbd5e1;
    }
    
    .data-table th {
      background: #f1f5f9;
      font-weight: 600;
      padding: 5px 6px;
      border: 1px solid #cbd5e1;
      text-align: center;
      font-size: 8pt;
    }
    
    .data-table td {
      padding: 4px 6px;
      border: 1px solid #cbd5e1;
      text-align: center;
    }
    
    .data-table td.text-left {
      text-align: left;
    }
    
    .data-table tr:nth-child(even) {
      background: #f8fafc;
    }
    
    .data-table .row-label {
      background: #fef3c7;
      font-weight: 500;
      text-align: left;
    }
    
    .checklist {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 5px;
      font-size: 9pt;
    }
    
    .checklist-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      background: #f8fafc;
      border-radius: 3px;
    }
    
    .checkbox {
      width: 14px;
      height: 14px;
      border: 1.5px solid #6366f1;
      border-radius: 2px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 9pt;
      color: #22c55e;
      font-weight: bold;
    }
    
    .signature-section {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid #e5e7eb;
    }
    
    .signature-row {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
    }
    
    .signature-box {
      text-align: center;
      width: 120px;
    }
    
    .signature-line {
      border-bottom: 1.5px dashed #9ca3af;
      height: 30px;
      margin-bottom: 5px;
    }
    
    .signature-label {
      font-size: 8pt;
      font-weight: 600;
      color: #374151;
    }
    
    .signature-date {
      font-size: 7.5pt;
      color: #6b7280;
    }
    
    .footer {
      margin-top: 25px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
      font-size: 7.5pt;
      color: #9ca3af;
      text-align: center;
    }
    
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <div class="institute-name">NEHRU INSTITUTE OF ENGINEERING AND TECHNOLOGY</div>
    <div class="institute-subtitle">(AUTONOMOUS) | ISO Certified | NAAC "A+" | NBA Accredited</div>
    <div class="report-title">MONTHLY DEPARTMENT REPORT</div>
    <div class="academic-year">Academic Year: ${safeData.academicYear || 'N/A'}</div>
  </div>

  <table class="info-table">
    <tr><td class="label">School</td><td>${safeData.schoolName || '-'}</td><td class="label">Department</td><td>${safeData.department || dept || '-'}</td></tr>
    <tr><td class="label">Reporting Month/Year</td><td>${safeData.reportingMonth || '-'} / ${safeData.reportingYear || '-'}</td><td class="label">Date of Report</td><td>${currentDate}</td></tr>
  </table>

  <div class="section">
    <div class="section-header teal">DEPARTMENT BASIC INFORMATION</div>
    <table class="data-table">
      <thead>
        <tr>
          <th rowspan="2">Faculty Details</th>
          <th>Total Faculty</th>
          <th>Professors</th>
          <th>Asst. Prof</th>
          <th>Assoc. Prof</th>
        </tr>
        <tr>
          <td>${safeData.facultyCount || '-'}</td>
          <td>${safeData.profCount || '-'}</td>
          <td>${safeData.aspCount || '-'}</td>
          <td>${safeData.apCount || '-'}</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="row-label">PhD Holders</td>
          <td colspan="2">${safeData.phdHolders || '-'}</td>
          <td class="row-label">PhD Pursuing</td>
          <td>${safeData.pursuingPhd || '-'}</td>
        </tr>
        <tr>
          <td class="row-label">Total Students</td>
          <td>${safeData.totalStudents || '-'}</td>
          <td class="row-label">I Year</td>
          <td>${safeData.year1Students || '-'}</td>
          <td class="row-label">II Year</td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td>${safeData.year2Students || '-'}</td>
          <td class="row-label">III Year</td>
          <td>${safeData.year3Students || '-'}</td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td class="row-label">IV Year</td>
          <td>${safeData.year4Students || '-'}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-header green">A. ACADEMIC ACTIVITIES</div>
    <table class="data-table">
      <thead>
        <tr><th>Particulars</th><th>Theory</th><th>Lab</th></tr>
      </thead>
      <tbody>
        <tr><td class="row-label">Syllabus Coverage</td><td>${safeData.syllabusCoverageTheory || '-'}</td><td>${safeData.syllabusCoverageLab || '-'}</td></tr>
        <tr><td class="row-label">Lesson Plan Update</td><td>${safeData.lessonPlanTheory || '-'}</td><td>${safeData.lessonPlanLab || '-'}</td></tr>
        <tr><td class="row-label">CIA Conducted & Submitted</td><td>${safeData.ciaConducted || '-'}</td><td>NA</td></tr>
        <tr><td class="row-label">Attendance Report Prepared</td><td colspan="2">${safeData.attendanceReport || '-'}</td></tr>
        <tr><td class="row-label">Remedial Classes Conducted</td><td>${safeData.remedialClasses || '-'}</td><td>NA</td></tr>
        <tr><td class="row-label">Mentoring Sessions Conducted</td><td>${safeData.mentoringSessions || '-'}</td><td>NA</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-header purple">B. STUDENT DEVELOPMENT ACTIVITIES</div>
    <p style="font-size: 7.5pt; color: #6b7280; margin-bottom: 5px;">(*Prev Months: Cumulative counting starts from 1st July)</p>
    <table class="data-table">
      <thead>
        <tr>
          <th rowspan="2" style="width: 80px;">Particulars</th>
          <th colspan="2">Guest Lectures</th>
          <th colspan="2">Workshops</th>
          <th colspan="2">Ind. Visits</th>
          <th colspan="2">Value Added</th>
          <th colspan="2">Skill Enh.</th>
          <th colspan="2">Hands-on</th>
          <th colspan="2">Hackathon</th>
          <th rowspan="2">Prof. Society</th>
        </tr>
        <tr>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="row-label">Prev Months*</td>
          <td>${guestLectures.prev || ''}</td>
          <td>${guestLectures.curr || ''}</td>
          <td>${workshops.prev || ''}</td>
          <td>${workshops.curr || ''}</td>
          <td>${industrialVisits.prev || ''}</td>
          <td>${industrialVisits.curr || ''}</td>
          <td>${valueAddedCourses.prev || ''}</td>
          <td>${valueAddedCourses.curr || ''}</td>
          <td>${skillEnhancement.prev || ''}</td>
          <td>${skillEnhancement.curr || ''}</td>
          <td>${handsOnTraining.prev || ''}</td>
          <td>${handsOnTraining.curr || ''}</td>
          <td>${hackathon.prev || ''}</td>
          <td>${hackathon.curr || ''}</td>
          <td>${studentDev.profSocietyActivities?.prev || ''}</td>
        </tr>
        <tr>
          <td class="row-label">Current Month</td>
          <td>-</td>
          <td>${guestLectures.curr || ''}</td>
          <td>-</td>
          <td>${workshops.curr || ''}</td>
          <td>-</td>
          <td>${industrialVisits.curr || ''}</td>
          <td>-</td>
          <td>${valueAddedCourses.curr || ''}</td>
          <td>-</td>
          <td>${skillEnhancement.curr || ''}</td>
          <td>-</td>
          <td>${handsOnTraining.curr || ''}</td>
          <td>-</td>
          <td>${hackathon.curr || ''}</td>
          <td>${studentDev.profSocietyActivities?.curr || ''}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-header orange">C. RESEARCH & INNOVATION (FACULTY WISE)</div>
    <table class="data-table">
      <thead>
        <tr>
          <th rowspan="2">Faculty Name</th>
          <th colspan="2">Journal Pub.</th>
          <th colspan="2">Conf. Papers</th>
          <th colspan="2">Books</th>
          <th colspan="2">Book Ch.</th>
          <th colspan="2">Patents</th>
          <th colspan="2">Funded Proj.</th>
        </tr>
        <tr>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
        </tr>
      </thead>
      <tbody>
        ${researchRows}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-header blue">D. FACULTY DEVELOPMENT PROGRAMS</div>
    <table class="data-table">
      <thead>
        <tr>
          <th rowspan="2">Faculty Name</th>
          <th colspan="2">FDPs Attended</th>
          <th colspan="2">FDPs Organized</th>
          <th colspan="2">NPTEL Completed</th>
          <th colspan="2">MOOCs Completed</th>
          <th colspan="2">Resource Person</th>
        </tr>
        <tr>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
          <th>P</th><th>C</th>
        </tr>
      </thead>
      <tbody>
        ${facultyDevRows}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-header teal">E. STUDENTS INTERNSHIP DETAILS</div>
    <table class="data-table">
      <thead>
        <tr><th>Period</th><th>Paid</th><th>Non-Paid</th><th>Virtual</th><th>Not Availed</th></tr>
      </thead>
      <tbody>
        <tr><td class="row-label">Previous Months</td><td>${prevIntern.paid || ''}</td><td>${prevIntern.nonPaid || ''}</td><td>${prevIntern.virtual || ''}</td><td>${prevIntern.notAvailed || ''}</td></tr>
        <tr><td class="row-label">Current Month</td><td>${currIntern.paid || ''}</td><td>${currIntern.nonPaid || ''}</td><td>${currIntern.virtual || ''}</td><td>${currIntern.notAvailed || ''}</td></tr>
        <tr><td class="row-label" style="background: #dbeafe;">Total (Cumulative)</td><td style="background: #dbeafe;">${totalIntern.paid || ''}</td><td style="background: #dbeafe;">${totalIntern.nonPaid || ''}</td><td style="background: #dbeafe;">${totalIntern.virtual || ''}</td><td style="background: #dbeafe;">${totalIntern.notAvailed || ''}</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-header lime">G. QUALITY ASSURANCE ACTIVITIES</div>
    <table class="data-table">
      <thead>
        <tr><th style="width: 35%;">Particulars</th><th style="width: 25%;">Status</th><th>Remarks</th></tr>
      </thead>
      <tbody>
        ${qaRows}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-header indigo">H. DOCUMENTS TO BE ATTACHED</div>
    <div class="checklist">
      ${docItems}
    </div>
  </div>

  <div class="signature-section">
    <div class="signature-row">
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">HoD</div>
        <div class="signature-date">Date: _______</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">School Dean</div>
        <div class="signature-date">Date: _______</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Head-IQAC</div>
        <div class="signature-date">Date: _______</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Vice Principal</div>
        <div class="signature-date">Date: _______</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Principal</div>
        <div class="signature-date">Date: _______</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>This is a computer-generated report from NIET IQAC ERP System | Generated on ${currentDate}</p>
  </div>
</body>
</html>`
}
