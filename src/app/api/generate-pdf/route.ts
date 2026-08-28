import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { writeFileSync, unlinkSync, readFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import PDFDocument from 'pdfkit'

// Helper function to convert image file to base64 data URL
function imageToBase64DataUrl(filename: string): string {
  const imagePath = join(process.cwd(), 'public/images', filename)
  try {
    if (existsSync(imagePath)) {
      const imageBuffer = readFileSync(imagePath)
      const base64 = imageBuffer.toString('base64')
      const ext = filename.split('.').pop()?.toLowerCase()
      const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png'
      return `data:${mimeType};base64,${base64}`
    }
  } catch (error) {
    console.error(`Error loading logo ${filename}:`, error)
  }
  return ''
}

import { generateAchievementPdf, FilterOptions } from '@/lib/reports/achievement-report-service'

export async function POST(request: NextRequest) {
  let tempHtmlPath = ''
  let tempPdfPath = ''
  
  try {
    const body = await request.json()
    const reportData = body.reportData || body.data || body || {}
    const department = body.department || body.departmentName || reportData.department || 'NIET'

    console.log('[PDF DEBUG] POST /api/generate-pdf payload keys:', Object.keys(body))
    console.log('[PDF DEBUG] reportData keys:', Object.keys(reportData))

    // If request contains achievement report filters, delegate directly to unified achievement report PDF engine
    if (body.filters || body.departmentId || body.achievementType) {
      const filters: FilterOptions = body.filters || {
        departmentId: body.departmentId || 'ALL',
        fromMonth: Number(body.fromMonth || 1),
        toMonth: Number(body.toMonth || 12),
        year: Number(body.year || 2026),
        userType: body.userType || 'BOTH',
        targetUserId: body.targetUserId || 'ALL',
        achievementType: body.achievementType || 'ALL',
        userRole: body.userRole || 'STAFF',
        currentUserId: body.currentUserId || '',
      }

      console.log('[PDF DEBUG] Routing to generateAchievementPdf with filters:', filters)
      const { buffer, filename } = await generateAchievementPdf(filters)
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': buffer.length.toString(),
        },
      })
    }

    let pdfBuffer: Buffer | null = null

    // Serverless-first approach: PDFKit is guaranteed to work on Vercel Node runtime with zero binary dependencies
    try {
      console.log('[PDF DEBUG] Generating PDF with PDFKit engine for department:', department)
      pdfBuffer = await generatePdfWithPdfKit(reportData, department)
    } catch (pdfkitError: any) {
      console.warn('[PDF DEBUG] PDFKit engine warning, attempting Playwright fallback:', pdfkitError)
    }

    // Secondary fallback: Try Playwright if PDFKit fails
    if (!pdfBuffer) {
      try {
        const nietLogoDataUrl = imageToBase64DataUrl('niet-logo.png')
        const nehrugroupLogoDataUrl = imageToBase64DataUrl('nehrugroup-logo.png')
        const htmlContent = generateReportHTML(reportData, department, nietLogoDataUrl, nehrugroupLogoDataUrl)

        const tempDir = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '/tmp' : tmpdir()
        if (!existsSync(tempDir)) {
          try { mkdirSync(tempDir, { recursive: true }) } catch (e) {}
        }

        const timestamp = Date.now()
        tempHtmlPath = join(tempDir, `report_${timestamp}.html`)
        tempPdfPath = join(tempDir, `report_${timestamp}.pdf`)
        
        try { writeFileSync(tempHtmlPath, htmlContent) } catch (e) {}

        await generateWithPlaywright(htmlContent, tempPdfPath)
        if (existsSync(tempPdfPath)) {
          pdfBuffer = readFileSync(tempPdfPath)
        }
      } catch (playwrightError: any) {
        console.error('[PDF DEBUG] Playwright fallback also failed:', playwrightError)
      }
    }

    // Clean up temp files
    try {
      if (tempHtmlPath && existsSync(tempHtmlPath)) unlinkSync(tempHtmlPath)
      if (tempPdfPath && existsSync(tempPdfPath)) unlinkSync(tempPdfPath)
    } catch (e) {}

    if (!pdfBuffer) {
      throw new Error('PDF generation produced an empty binary buffer')
    }

    const filename = `Monthly_Department_Report_${department || 'NIET'}_${reportData?.reportingMonth || 'Report'}_${reportData?.reportingYear || new Date().getFullYear()}.pdf`

    // Return genuine PDF binary stream
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('[PDF DEBUG ERROR] PDF generation stage error details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace available'
    })
    
    // Cleanup on error
    try {
      if (tempHtmlPath && existsSync(tempHtmlPath)) unlinkSync(tempHtmlPath)
      if (tempPdfPath && existsSync(tempPdfPath)) unlinkSync(tempPdfPath)
    } catch (e) {}

    // Generate emergency fallback PDF stream using PDFKit so browser never receives HTML/corrupt file
    try {
      const emergencyPdf = await generatePdfWithPdfKit({}, 'NIET')
      return new NextResponse(new Uint8Array(emergencyPdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Monthly_Department_Report.pdf"',
          'Content-Length': emergencyPdf.length.toString(),
        },
      })
    } catch (fallbackErr: any) {
      console.error('[PDF DEBUG FALLBACK ERROR]', fallbackErr)
      return NextResponse.json({ error: 'Failed to generate PDF: ' + (error?.message || 'Internal error') }, { status: 500 })
    }
  }
}

function generatePdfWithPdfKit(reportData: any, department: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // A4 Landscape layout: 841.89pt width x 595.28pt height
      const doc = new PDFDocument({ margin: 28, size: 'A4', layout: 'landscape' })
      const chunks: Buffer[] = []

      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', (err) => reject(err))

      const safeData = reportData || {}
      const studentDev = safeData.studentDev || {}
      const internship = safeData.internship || {}
      const qaActivities = Array.isArray(safeData.qaActivities) ? safeData.qaActivities : []
      const researchFaculty = Array.isArray(safeData.researchFaculty) ? safeData.researchFaculty : []
      const facultyDev = Array.isArray(safeData.facultyDev) ? safeData.facultyDev : []

      const startX = 28
      const pageWidth = 841.89 - 56 // 785.89pt

      // Header Banner with Logos
      const nietLogoPath = join(process.cwd(), 'public/images/niet-logo.png')
      const nehruLogoPath = join(process.cwd(), 'public/images/nehrugroup-logo.png')

      if (existsSync(nietLogoPath)) {
        try { doc.image(nietLogoPath, startX, 22, { width: 45, height: 45 }) } catch (e) {}
      }
      if (existsSync(nehruLogoPath)) {
        try { doc.image(nehruLogoPath, startX + pageWidth - 45, 22, { width: 45, height: 45 }) } catch (e) {}
      }

      doc.fillColor('#1e40af').fontSize(13).text('NEHRU INSTITUTE OF ENGINEERING AND TECHNOLOGY', startX + 50, 22, { width: pageWidth - 100, align: 'center' })
      doc.fillColor('#4b5563').fontSize(8).text('(AUTONOMOUS) | ISO Certified | NAAC "A+" | NBA Accredited', startX + 50, 38, { width: pageWidth - 100, align: 'center' })
      
      // Title Bar
      doc.rect(startX, 52, pageWidth, 18).fill('#1e40af')
      doc.fillColor('#ffffff').fontSize(10).text('MONTHLY DEPARTMENT REPORT', startX, 56, { width: pageWidth, align: 'center' })

      let y = 74

      // Meta Table Bar
      doc.rect(startX, y, pageWidth, 18).fill('#f8fafc').stroke('#cbd5e1')
      doc.fillColor('#1e293b').fontSize(8).text(`Department: ${department || safeData.department || 'NIET'}   |   Academic Year: ${safeData.academicYear || '2025-2026'}   |   Reporting Period: ${safeData.reportingMonth || 'Current'} ${safeData.reportingYear || ''}   |   Date: ${new Date().toLocaleDateString('en-IN')}`, startX + 8, y + 4)
      
      y += 24

      // Helper for Section Banners
      const drawSectionHeader = (title: string, colorHex: string) => {
        if (y > 510) {
          doc.addPage({ margin: 28, size: 'A4', layout: 'landscape' })
          y = 28
        }
        doc.rect(startX, y, pageWidth, 16).fill(colorHex)
        doc.fillColor('#ffffff').fontSize(9).text(title, startX + 6, y + 3)
        y += 20
      }

      // Helper for Grid Tables
      const drawGridTable = (headers: string[], rows: (string | number)[][], colWidths: number[]) => {
        const safeHeaders = Array.isArray(headers) ? headers : []
        const safeRows = Array.isArray(rows) ? rows : []
        const rowHeight = 15

        if (y + (safeRows.length + 1) * rowHeight > 540) {
          doc.addPage({ margin: 28, size: 'A4', layout: 'landscape' })
          y = 28
        }

        // Draw Table Header
        let currentX = startX
        doc.rect(startX, y, pageWidth, rowHeight).fill('#f1f5f9')
        safeHeaders.forEach((h, i) => {
          const w = (Array.isArray(colWidths) && colWidths[i]) ? colWidths[i] : 100
          doc.rect(currentX, y, w, rowHeight).stroke('#cbd5e1')
          doc.fillColor('#1e293b').fontSize(7.5).text(String(h ?? ''), currentX + 2, y + 3, { width: w - 4, align: 'center' })
          currentX += w
        })
        y += rowHeight

        // Draw Table Rows
        if (safeRows.length === 0) {
          doc.rect(startX, y, pageWidth, rowHeight).fill('#ffffff').stroke('#cbd5e1')
          doc.fillColor('#94a3b8').fontSize(7.5).text('No entries recorded for this reporting period', startX + 4, y + 3, { width: pageWidth - 8, align: 'center' })
          y += rowHeight
        } else {
          safeRows.forEach((r, rIdx) => {
            currentX = startX
            const bg = rIdx % 2 === 0 ? '#ffffff' : '#f8fafc'
            doc.rect(startX, y, pageWidth, rowHeight).fill(bg)
            const safeCells = Array.isArray(r) ? r : []
            safeCells.forEach((cell, cIdx) => {
              const w = (Array.isArray(colWidths) && colWidths[cIdx]) ? colWidths[cIdx] : 100
              doc.rect(currentX, y, w, rowHeight).stroke('#cbd5e1')
              const align = cIdx === 0 ? 'left' : 'center'
              doc.fillColor('#334155').fontSize(7.5).text(String(cell ?? '-'), currentX + 2, y + 3, { width: w - 4, align })
              currentX += w
            })
            y += rowHeight
          })
        }
        y += 8
      }

      // Check if Admin Dashboard Executive Summary dataset
      if (safeData.executiveSummary || safeData.departmentPerformance || safeData.placementStats) {
        const exec = safeData.executiveSummary || {}
        drawSectionHeader('1. EXECUTIVE SUMMARY & INSTITUTIONAL QUALITY METRICS', '#1e3a5f')
        const execHeaders = ['Metric', 'Value', 'Details / Remarks']
        const execRows = [
          ['Total Students', String(exec.totalStudents || 0), 'Enrolled across all active programs'],
          ['Total Faculty', String(exec.totalFaculty || 0), 'Full-time & Adjunct Teaching Staff'],
          ['Active Departments', String(exec.totalDepartments || 0), 'Engineering & Science Disciplines'],
          ['Total Achievements Verified', String(exec.totalAchievements || 0), 'IQAC Approved Records'],
          ['Placements Recorded', String(exec.totalPlacements || 0), 'On-Campus & Off-Campus'],
          ['Research Publications', String(exec.totalPublications || 0), 'Scopus, WoS & UGC Care'],
          ['Verified Data Records', String(exec.verifiedRecords || 0), 'Passed Verification'],
          ['Pending Approvals', String(exec.pendingApprovals || 0), 'Under Review'],
          ['Overall Performance Score', `${exec.overallPerformance || 0}%`, 'Institutional Index Score']
        ]
        drawGridTable(execHeaders, execRows, [250, 150, 385.89])

        if (Array.isArray(safeData.departmentPerformance) && safeData.departmentPerformance.length > 0) {
          drawSectionHeader('2. DEPARTMENT-WISE PERFORMANCE ANALYSIS', '#059669')
          const deptHeaders = ['Dept Name', 'Code', 'Students', 'Faculty', 'Achievements', 'Publications', 'Placements', 'Score']
          const deptRows = safeData.departmentPerformance.map((d: any) => [
            d?.name || 'Dept',
            d?.code || 'DEPT',
            String(d?.stats?.students || 0),
            String(d?.stats?.faculty || 0),
            String(d?.stats?.achievements || 0),
            String(d?.stats?.publications || 0),
            String(d?.stats?.placements || 0),
            `${d?.performanceScore || 0}%`
          ])
          drawGridTable(deptHeaders, deptRows, [160, 60, 75, 75, 95, 95, 95, 130.89])
        }

        if (safeData.placementStats) {
          const ps = safeData.placementStats
          drawSectionHeader('3. TRAINING & PLACEMENT CELL REPORT', '#7c3aed')
          const psHeaders = ['Placement Metric', 'Stat Value', 'Remarks']
          const psRows = [
            ['Total Placed Students', String(ps.totalPlaced || 0), 'Offers Accepted'],
            ['Overall Placement Rate', `${ps.placementRate || 0}%`, 'Eligible Batch Percent'],
            ['Highest Package Offered', `${ps.highestPackage || 'N/A'} LPA`, 'Highest CTC'],
            ['Average Package Offered', `${ps.averagePackage || 'N/A'} LPA`, 'Average Batch CTC'],
            ['Companies Visited', String(ps.companiesVisited || 0), 'Recruiting Partners'],
            ['Dream & Super Dream Offers', `${ps.dreamOffers || 0} / ${ps.superDreamOffers || 0}`, 'High Package Category']
          ]
          drawGridTable(psHeaders, psRows, [250, 160, 375.89])
        }

        if (safeData.researchStats) {
          const rs = safeData.researchStats
          drawSectionHeader('4. RESEARCH & DEVELOPMENT METRICS', '#d97706')
          const rsHeaders = ['Research Indicator', 'Record Count', 'Indexing / Details']
          const rsRows = [
            ['Total Journal Publications', String(rs.totalPublications || 0), 'Scopus / WoS / UGC Care'],
            ['Scopus Indexed Papers', String(rs.scopusIndexed || 0), 'International Journals'],
            ['Web of Science Papers', String(rs.webOfScience || 0), 'High Impact Factor'],
            ['Conference Papers', String(rs.conferencePapers || 0), 'IEEE / Springer / Elsevier'],
            ['Book Chapters & Books', `${rs.bookChapters || 0} / ${rs.booksPublished || 0}`, 'Edited Books'],
            ['Patents Filed & Granted', `${rs.patentsFiled || 0} / ${rs.patentsGranted || 0}`, 'IPR Applications']
          ]
          drawGridTable(rsHeaders, rsRows, [250, 160, 375.89])
        }
      } else {
        // Section A: Academic Activities
        drawSectionHeader('A. ACADEMIC ACTIVITIES', '#059669')
        const academicHeaders = ['Particulars', 'Theory', 'Lab / Practical', 'Status / Remarks']
        const academicRows = [
          ['Syllabus Coverage', safeData.syllabusCoverageTheory || '-', safeData.syllabusCoverageLab || '-', 'Updated in LMS'],
          ['Lesson Plan Update', safeData.lessonPlanTheory || '-', safeData.lessonPlanLab || '-', 'Verified by HoD'],
          ['CIA Conducted & Submitted', safeData.ciaConducted || '-', 'N/A', 'Evaluated & Published'],
          ['Attendance Report & Remedial', safeData.attendanceReport || '-', safeData.remedialClasses || '-', 'Remedial held for slow learners'],
          ['Mentoring Sessions Conducted', safeData.mentoringSessions || '-', 'N/A', 'Student counseling completed']
        ]
        if (Array.isArray(safeData.customAcademicRows)) {
          safeData.customAcademicRows.forEach((r: any) => {
            academicRows.push([r?.particulars || 'Custom Academic', r?.theory || '-', r?.lab || '-', 'Custom Entry'])
          })
        }
        drawGridTable(academicHeaders, academicRows, [200, 140, 140, 305.89])

        // Section B: Student Development Activities
        drawSectionHeader('B. STUDENT DEVELOPMENT ACTIVITIES', '#7c3aed')
        const bHeaders = ['Category', 'Guest Lectures', 'Workshops', 'Ind. Visits', 'Value Added', 'Skill Enh.', 'Hands-on', 'Hackathons']
        const guestL = studentDev.guestLectures || {}
        const workS = studentDev.workshops || {}
        const indV = studentDev.industrialVisits || {}
        const valA = studentDev.valueAddedCourses || {}
        const skillE = studentDev.skillEnhancement || {}
        const handsO = studentDev.handsOnTraining || {}
        const hackA = studentDev.hackathon || {}

        const bRows = [
          ['Prev Months (Cumulative)', guestL.prev || '0', workS.prev || '0', indV.prev || '0', valA.prev || '0', skillE.prev || '0', handsO.prev || '0', hackA.prev || '0'],
          ['Current Month', guestL.curr || '0', workS.curr || '0', indV.curr || '0', valA.curr || '0', skillE.curr || '0', handsO.curr || '0', hackA.curr || '0']
        ]
        drawGridTable(bHeaders, bRows, [155.89, 90, 90, 90, 90, 90, 90, 90])

        // Section C: Research & Innovation
        drawSectionHeader('C. RESEARCH & INNOVATION (FACULTY WISE)', '#d97706')
        const cHeaders = ['Faculty Name', 'Journals', 'Conferences', 'Books', 'Book Chapters', 'Patents', 'Grants']
        const cRows = (Array.isArray(researchFaculty) ? researchFaculty : []).map((f: any) => [
          f?.name || 'Faculty',
          f?.journalPub?.curr || '0',
          f?.conferencePapers?.curr || '0',
          f?.book?.curr || '0',
          f?.bookChapters?.curr || '0',
          f?.patents?.curr || '0',
          f?.fundedProjects?.curr || '0'
        ])
        drawGridTable(cHeaders, cRows, [215.89, 95, 95, 95, 95, 95, 95])

        // Section D: Faculty Development Programs
        drawSectionHeader('D. FACULTY DEVELOPMENT PROGRAMS', '#0369a1')
        const dHeaders = ['Faculty Name', 'FDPs Attended', 'FDPs Organized', 'NPTEL Completed', 'MOOCs', 'Resource Person']
        const dRows = (Array.isArray(facultyDev) ? facultyDev : []).map((f: any) => [
          f?.name || 'Faculty',
          f?.fdpsAttended?.curr || '0',
          f?.fdpsOrganized?.curr || '0',
          f?.nptelCompleted?.curr || '0',
          f?.moocsCompleted?.curr || '0',
          f?.resourcePerson?.curr || '0'
        ])
        drawGridTable(dHeaders, dRows, [235.89, 110, 110, 110, 110, 110])

        // Section E: Internship Details
        drawSectionHeader('E. STUDENTS INTERNSHIP DETAILS', '#0f766e')
        const eHeaders = ['Period', 'Paid Internships', 'Non-Paid Internships', 'Virtual Internships', 'Not Availed']
        const prevInt = internship.previous || {}
        const currInt = internship.current || {}
        const eRows = [
          ['Current Month', currInt.paid || '0', currInt.nonPaid || '0', currInt.virtual || '0', currInt.notAvailed || '0'],
          ['Cumulative Total', prevInt.paid || '0', prevInt.nonPaid || '0', prevInt.virtual || '0', '-']
        ]
        if (Array.isArray(safeData.customInternshipRows)) {
          safeData.customInternshipRows.forEach((r: any) => {
            eRows.push([r?.period || 'Custom', r?.paid || '0', r?.nonPaid || '0', r?.virtual || '0', r?.notAvailed || '0'])
          })
        }
        drawGridTable(eHeaders, eRows, [185.89, 150, 150, 150, 150])

        // Section F: Faculty - Industry Interaction
        drawSectionHeader('F. FACULTY - INDUSTRY INTERACTION', '#b91c1c')
        const fHeaders = ['Faculty Name', 'MoUs Signed', 'Industry Visits', 'Experts Invited', 'Collaborative', 'Consultancy']
        const indInt = Array.isArray(safeData.industryInteraction) ? safeData.industryInteraction : []
        const fRows = indInt.map((item: any) => [
          item?.name || 'Faculty',
          item?.mousSigned?.curr || '0',
          item?.industryVisits?.curr || '0',
          item?.expertsInvited?.curr || '0',
          item?.collaborativeActivities?.curr || '0',
          item?.consultancyServices?.curr || '0'
        ])
        drawGridTable(fHeaders, fRows, [200, 115, 115, 115, 120, 120.89])

        // Section G: Quality Assurance Activities
        drawSectionHeader('G. QUALITY ASSURANCE ACTIVITIES', '#65a30d')
        const gHeaders = ['Particulars', 'Status', 'Remarks']
        const gRows = (Array.isArray(qaActivities) ? qaActivities : []).map((qa: any) => [qa?.particular || '-', qa?.status || '-', qa?.remarks || '-'])
        drawGridTable(gHeaders, gRows, [300, 180, 305.89])
      }

      // Signatures Block
      if (y > 520) {
        doc.addPage({ margin: 28, size: 'A4', layout: 'landscape' })
        y = 500
      } else {
        y = 525
      }

      doc.fontSize(8).fillColor('#475569')
      const sigGap = pageWidth / 4;
      ['Head of Department (HoD)', 'School Dean', 'Head - IQAC', 'Vice Principal / Principal'].forEach((label, i) => {
        const x = startX + i * sigGap
        doc.text('________________________', x, y, { width: sigGap, align: 'center' })
        doc.text(label, x, y + 10, { width: sigGap, align: 'center' })
      })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

async function generateWithPlaywright(htmlContent: string, outputPath: string): Promise<void> {
  let browser

  // If running on Vercel / AWS Lambda serverless environment, use @sparticuz/chromium with playwright-core
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const sparticuzChromium = (await import('@sparticuz/chromium')).default
      const { chromium: playwrightCore } = await import('playwright-core')

      const executablePath = await sparticuzChromium.executablePath()
      browser = await playwrightCore.launch({
        args: sparticuzChromium.args,
        executablePath,
        headless: true,
      })
    } catch (sparticuzErr) {
      console.warn('Sparticuz Chromium launch failed on serverless, falling back:', sparticuzErr)
    }
  }

  // Fallback to standard playwright launch (for local environment)
  if (!browser) {
    const { chromium } = await import('playwright')

    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-component-extensions-with-background-pages',
        '--disable-default-apps'
      ]
    }

    try {
      browser = await chromium.launch(launchOptions)
    } catch (err) {
      console.warn('Default Playwright chromium launch failed, trying fallback channels/paths...', err)

      const channels = ['chrome', 'msedge']
      for (const channel of channels) {
        try {
          browser = await chromium.launch({ ...launchOptions, channel })
          break
        } catch (cErr) {}
      }

      if (!browser) {
        const possiblePaths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
          'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        ]

        for (const execPath of possiblePaths) {
          if (existsSync(execPath)) {
            try {
              browser = await chromium.launch({ ...launchOptions, executablePath: execPath })
              break
            } catch (pErr) {}
          }
        }
      }

      if (!browser) {
        throw err
      }
    }
  }

  try {
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'load', timeout: 15000 })
    
    await page.pdf({
      path: outputPath,
      width: '297mm',
      height: '210mm',
      landscape: true,
      printBackground: true,
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: '<div style="font-size: 8px; text-align: center; width: 100%; color: #9ca3af;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
    })
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

function generateReportHTML(data: any, dept: string, nietLogoDataUrl: string = '', nehrugroupLogoDataUrl: string = ''): string {
  // Safely access all nested properties with fallbacks
  const safeData = data || {}
  const studentDev = safeData.studentDev || {}
  const internship = safeData.internship || {}
  const documents = safeData.documents || {}
  const qaActivities = Array.isArray(safeData.qaActivities) ? safeData.qaActivities : []
  const researchFaculty = Array.isArray(safeData.researchFaculty) ? safeData.researchFaculty : []
  const facultyDev = Array.isArray(safeData.facultyDev) ? safeData.facultyDev : []
  
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
      size: 297mm 210mm;
      margin: 10mm;
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
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 3px double #1e40af;
    }
    
    .header-with-logos {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .logo-img {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }
    
    .logo-placeholder {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    }
    
    .header-center {
      text-align: center;
      flex: 1;
      padding: 0 20px;
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
    <div class="header-with-logos">
      ${nietLogoDataUrl ? `<img src="${nietLogoDataUrl}" alt="NIET Coimbatore" class="logo-img" />` : '<div class="logo-placeholder">NIET</div>'}
      <div class="header-center">
        <div class="institute-name">NEHRU INSTITUTE OF ENGINEERING AND TECHNOLOGY</div>
        <div class="institute-subtitle">(AUTONOMOUS) | ISO Certified | NAAC "A+" | NBA Accredited</div>
      </div>
      ${nehrugroupLogoDataUrl ? `<img src="${nehrugroupLogoDataUrl}" alt="Nehru Group" class="logo-img" />` : '<div class="logo-placeholder">NGI</div>'}
    </div>
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
        ${(Array.isArray(safeData.customAcademicRows) ? safeData.customAcademicRows : []).map((row: any) => `
          <tr><td class="row-label">${row?.particulars || 'Custom Academic Activity'}</td><td>${row?.theory || '-'}</td><td>${row?.lab || '-'}</td></tr>
        `).join('')}
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
        ${(Array.isArray(safeData.customInternshipRows) ? safeData.customInternshipRows : []).map((row: any) => `
          <tr><td class="row-label">${row?.period || 'Custom Period'}</td><td>${row?.paid || '-'}</td><td>${row?.nonPaid || '-'}</td><td>${row?.virtual || '-'}</td><td>${row?.notAvailed || '-'}</td></tr>
        `).join('')}
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
        <div style="height: 35px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
          ${safeData.signatures?.hod ? `<img src="${safeData.signatures.hod}" style="max-height: 35px; max-width: 100%; object-fit: contain;" />` : ''}
        </div>
        <div class="signature-line"></div>
        <div class="signature-label">HoD</div>
        <div class="signature-date">Date: _______</div>
      </div>
      <div class="signature-box">
        <div style="height: 35px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
          ${safeData.signatures?.dean ? `<img src="${safeData.signatures.dean}" style="max-height: 35px; max-width: 100%; object-fit: contain;" />` : ''}
        </div>
        <div class="signature-line"></div>
        <div class="signature-label">School Dean</div>
        <div class="signature-date">Date: _______</div>
      </div>
      <div class="signature-box">
        <div style="height: 35px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
          ${safeData.signatures?.iqac ? `<img src="${safeData.signatures.iqac}" style="max-height: 35px; max-width: 100%; object-fit: contain;" />` : ''}
        </div>
        <div class="signature-line"></div>
        <div class="signature-label">Head-IQAC</div>
        <div class="signature-date">Date: _______</div>
      </div>
      <div class="signature-box">
        <div style="height: 35px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
          ${safeData.signatures?.vicePrincipal ? `<img src="${safeData.signatures.vicePrincipal}" style="max-height: 35px; max-width: 100%; object-fit: contain;" />` : ''}
        </div>
        <div class="signature-line"></div>
        <div class="signature-label">Vice Principal</div>
        <div class="signature-date">Date: _______</div>
      </div>
      <div class="signature-box">
        <div style="height: 35px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
          ${safeData.signatures?.principal ? `<img src="${safeData.signatures.principal}" style="max-height: 35px; max-width: 100%; object-fit: contain;" />` : ''}
        </div>
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
