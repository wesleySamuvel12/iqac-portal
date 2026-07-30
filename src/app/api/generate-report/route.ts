import { NextRequest, NextResponse } from 'next/server'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  ShadingType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  VerticalAlign
} from 'docx'

// Types for report data
interface ReportData {
  schoolName: string
  department: string
  reportingMonth: string
  reportingYear: string
  academicYear: string
  facultyCount: string
  profCount: string
  aspCount: string
  apCount: string
  phdHolders: string
  phdCount: string
  pursuingPhd: string
  notRegistered: string
  totalStudents: string
  year1Students: string
  year2Students: string
  year3Students: string
  year4Students: string
  syllabusCoverageTheory: string
  syllabusCoverageLab: string
  lessonPlanTheory: string
  lessonPlanLab: string
  ciaConducted: string
  attendanceReport: string
  remedialClasses: string
  mentoringSessions: string
  studentDev: Record<string, { prev: string; curr: string }>
  researchFaculty: Array<{
    name: string
    journalPub: { prev: string; curr: string }
    conferencePapers: { prev: string; curr: string }
    book: { prev: string; curr: string }
    bookChapters: { prev: string; curr: string }
    patents: { prev: string; curr: string }
    fundedProjects: { prev: string; curr: string }
  }>
  facultyDev: Array<{
    name: string
    fdpsAttended: { prev: string; curr: string }
    fdpsOrganized: { prev: string; curr: string }
    nptelCompleted: { prev: string; curr: string }
    moocsCompleted: { prev: string; curr: string }
    resourcePerson: { prev: string; curr: string }
  }>
  internship: {
    previous: { paid: string; nonPaid: string; virtual: string; notAvailed: string }
    current: { paid: string; nonPaid: string; virtual: string; notAvailed: string }
    total: { paid: string; nonPaid: string; virtual: string; notAvailed: string }
  }
  industryInteraction: Array<{
    name: string
    mousSigned: { prev: string; curr: string }
    industryVisits: { prev: string; curr: string }
    expertsInvited: { prev: string; curr: string }
    collaborativeActivities: { prev: string; curr: string }
    consultancyServices: { prev: string; curr: string }
  }>
  qaActivities: Array<{ particular: string; status: string; remarks: string }>
  documents: Record<string, boolean>
}

// Helper function to create bordered cell
function createCell(
  text: string,
  options: {
    width?: number
    bold?: boolean
    shading?: string
    alignment?: typeof AlignmentType[keyof typeof AlignmentType]
    verticalAlign?: typeof VerticalAlign[keyof typeof VerticalAlign]
    rowSpan?: number
    colSpan?: number
    fontSize?: number
  } = {}
): TableCell {
  const {
    width = 1000,
    bold = false,
    shading,
    alignment = AlignmentType.LEFT,
    verticalAlign = VerticalAlign.CENTER,
    rowSpan = 1,
    colSpan = 1,
    fontSize = 20
  } = options

  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    rowSpan,
    columnSpan: colSpan,
    shading: shading ? { type: ShadingType.SOLID, color: shading, fill: shading } : undefined,
    verticalAlign,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    },
    children: [
      new Paragraph({
        alignment,
        children: [
          new TextRun({
            text: text || '',
            bold,
            size: fontSize,
            font: 'Times New Roman',
          }),
        ],
      }),
    ],
  })
}

// Helper function to create header cell with background color
function createHeaderCell(
  text: string,
  options: {
    width?: number
    colSpan?: number
    rowSpan?: number
    color?: string
    fontSize?: number
  } = {}
): TableCell {
  return createCell(text, {
    ...options,
    bold: true,
    shading: options.color || 'D4EDDA',
    alignment: AlignmentType.CENTER,
    fontSize: options.fontSize || 18,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data: ReportData = body.reportData
    
    // Create the document
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: 'Times New Roman', size: 20 },
          },
        },
      },
      sections: [
        // Section 1: Cover/Header Page
        {
          properties: {
            page: {
              margin: { top: 720, bottom: 720, left: 1080, right: 1080 },
            },
          },
          children: [
            // NIET Header Table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: '1E3A5F' },
                bottom: { style: BorderStyle.SINGLE, size: 2, color: '1E3A5F' },
                left: { style: BorderStyle.SINGLE, size: 2, color: '1E3A5F' },
                right: { style: BorderStyle.SINGLE, size: 2, color: '1E3A5F' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 75, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.NIL },
                        bottom: { style: BorderStyle.NIL },
                        left: { style: BorderStyle.NIL },
                        right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                      },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 80 },
                          children: [
                            new TextRun({ text: 'NEHRU INSTITUTE OF ENGINEERING AND TECHNOLOGY', bold: true, size: 28, font: 'Times New Roman', color: '1E3A5F' }),
                          ],
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 60 },
                          children: [
                            new TextRun({ text: '(AUTONOMOUS) – An ISO 9001:2015 & ISO 14001:2015 Certified Institution', size: 18, font: 'Times New Roman', color: '333333' }),
                          ],
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 40 },
                          children: [
                            new TextRun({ text: 'Affiliated to Anna University, Chennai | Approved by AICTE, New Delhi | Recognised by UGC with 2(f) & 12(B)', size: 16, font: 'Times New Roman', color: '555555' }),
                          ],
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 40 },
                          children: [
                            new TextRun({ text: 'Re-accredited by NAAC with "A+" | NBA Accredited: UG | ECE | EEE | MECH | MCT', size: 16, font: 'Times New Roman', color: '555555' }),
                          ],
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({ text: 'Thirumalayampalayam, Coimbatore-641105, Tamil Nadu', size: 16, font: 'Times New Roman', italics: true, color: '666666' }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 25, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.NIL },
                        bottom: { style: BorderStyle.NIL },
                        left: { style: BorderStyle.NIL },
                        right: { style: BorderStyle.NIL },
                      },
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({ text: '[LOGO]', size: 20, color: '999999' }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            // Spacing
            new Paragraph({ spacing: { after: 200 }, children: [] }),

            // Title Section - Monthly Department Report
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: '1E3A5F' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: '1E3A5F' },
                left: { style: BorderStyle.SINGLE, size: 1, color: '1E3A5F' },
                right: { style: BorderStyle.SINGLE, size: 1, color: '1E3A5F' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      shading: { type: ShadingType.SOLID, color: '1E3A5F', fill: '1E3A5F' },
                      borders: {
                        top: { style: BorderStyle.NIL },
                        bottom: { style: BorderStyle.NIL },
                        left: { style: BorderStyle.NIL },
                        right: { style: BorderStyle.SINGLE, size: 1, color: 'FFFFFF' },
                      },
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({ text: 'MONTHLY DEPARTMENT REPORT', bold: true, size: 24, font: 'Times New Roman', color: 'FFFFFF' }),
                          ],
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({ text: `Academic Year: ${data.academicYear}`, size: 20, font: 'Times New Roman', color: 'FFFFFF' }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      shading: { type: ShadingType.SOLID, color: 'E8F4FC', fill: 'E8F4FC' },
                      borders: {
                        top: { style: BorderStyle.NIL },
                        bottom: { style: BorderStyle.NIL },
                        left: { style: BorderStyle.NIL },
                        right: { style: BorderStyle.NIL },
                      },
                      children: [
                        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: '', size: 16 })] }),
                        new Paragraph({ children: [new TextRun({ text: `Name of the School         : ${data.schoolName || '_'}`, size: 18 })] }),
                        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: '', size: 16 })] }),
                        new Paragraph({ children: [new TextRun({ text: `Name of the Department   : ${data.department || '_'}`, size: 18 })] }),
                        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: '', size: 16 })] }),
                        new Paragraph({ children: [new TextRun({ text: `Reporting Month & Year       : ${data.reportingMonth} ${data.reportingYear}`, size: 18 })] }),
                        new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: '', size: 16 })] }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            // Preamble
            new Paragraph({ spacing: { before: 200, after: 100 }, children: [] }),
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: 'Preamble: This Monthly Department Report is submitted by the respective department to Principal-NIET, providing details of academic, research, student development, and other institutional activities carried out during the reporting period. All activities are reported cumulatively from 1st July of the academic year.',
                  size: 18,
                  italics: true,
                  font: 'Times New Roman',
                }),
              ],
            }),

            // DEPT. BASIC INFORMATION Section
            new Paragraph({ spacing: { before: 200 }, children: [] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: '00897B' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: '00897B' },
                left: { style: BorderStyle.SINGLE, size: 1, color: '00897B' },
                right: { style: BorderStyle.SINGLE, size: 1, color: '00897B' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 10,
                      shading: { type: ShadingType.SOLID, color: 'E0F2F1', fill: 'E0F2F1' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'DEPT. BASIC INFORMATION', bold: true, size: 22, color: '00695C' })] })],
                    }),
                  ],
                }),
                // Row 1: Faculty counts
                new TableRow({
                  children: [
                    createHeaderCell('Number of Faculty', { width: 1800, color: 'E0F2F1', color: 'FFF3E0' }),
                    createCell(`: ${data.facultyCount || '_'}`, { width: 1200, alignment: AlignmentType.CENTER }),
                    createHeaderCell('No. of Prof:', { width: 1200, color: 'FFF3E0' }),
                    createCell(data.profCount || '_', { width: 900, alignment: AlignmentType.CENTER }),
                    createHeaderCell('No. of AsP:', { width: 1100, color: 'FFF3E0' }),
                    createCell(data.aspCount || '_', { width: 900, alignment: AlignmentType.CENTER }),
                    createHeaderCell('No. of AP:', { width: 1100, color: 'FFF3E0' }),
                    createCell(data.apCount || '_', { width: 900, alignment: AlignmentType.CENTER }),
                  ],
                }),
                // Row 2: PhD info
                new TableRow({
                  children: [
                    createHeaderCell('Ph. D Holders', { width: 1800, color: 'FFF3E0' }),
                    createCell(`: ${data.phdHolders || '_'}`, { width: 2100, colSpan: 2, alignment: AlignmentType.CENTER }),
                    createHeaderCell('No. of PhD:', { width: 1200, color: 'FFF3E0' }),
                    createCell(data.phdCount || '_', { width: 900, alignment: AlignmentType.CENTER }),
                    createHeaderCell('Pursuing PhD:', { width: 1300, color: 'FFF3E0' }),
                    createCell(data.pursuingPhd || '_', { width: 900, alignment: AlignmentType.CENTER }),
                    createHeaderCell('Not Yet Registered:', { width: 1600, color: 'FFF3E0' }),
                    createCell(data.notRegistered || '_', { width: 900, alignment: AlignmentType.CENTER }),
                  ],
                }),
                // Row 3: Students
                new TableRow({
                  children: [
                    createHeaderCell('Number of Students', { width: 1800, color: 'FFF3E0' }),
                    createCell(`: ${data.totalStudents || '(Total)'}`, { width: 1200, alignment: AlignmentType.CENTER }),
                    createHeaderCell('I Year:', { width: 900, color: 'FFF3E0' }),
                    createCell(data.year1Students || '_', { width: 800, alignment: AlignmentType.CENTER }),
                    createHeaderCell('II Year:', { width: 900, color: 'FFF3E0' }),
                    createCell(data.year2Students || '_', { width: 800, alignment: AlignmentType.CENTER }),
                    createHeaderCell('III Year:', { width: 1000, color: 'FFF3E0' }),
                    createCell(data.year3Students || '_', { width: 800, alignment: AlignmentType.CENTER }),
                    createHeaderCell('IV Year:', { width: 900, color: 'FFF3E0' }),
                    createCell(data.year4Students || '_', { width: 800, alignment: AlignmentType.CENTER }),
                  ],
                }),
              ],
            }),

            // A. ACADEMIC ACTIVITIES Section
            new Paragraph({ spacing: { before: 300 }, children: [] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: '388E3C' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: '388E3C' },
                left: { style: BorderStyle.SINGLE, size: 1, color: '388E3C' },
                right: { style: BorderStyle.SINGLE, size: 1, color: '388E3C' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 4,
                      shading: { type: ShadingType.SOLID, color: 'C8E6C9', fill: 'C8E6C9' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'A. ACADEMIC ACTIVITIES', bold: true, size: 22, color: '2E7D32' })] })],
                    }),
                  ],
                }),
                // Header row
                new TableRow({
                  children: [
                    createHeaderCell('Sl.', { width: 600, color: 'E8F5E9' }),
                    createHeaderCell('Particulars', { width: 4500, color: 'E8F5E9' }),
                    createHeaderCell('Theory', { width: 2500, color: 'E8F5E9' }),
                    createHeaderCell('Lab / Practical', { width: 2500, color: 'E8F5E9' }),
                  ],
                }),
                // Data rows
                ...[
                  ['1', 'Syllabus Coverage', data.syllabusCoverageTheory, data.syllabusCoverageLab],
                  ['2', 'Lesson Plan Update', data.lessonPlanTheory, data.lessonPlanLab],
                  ['3', 'CIA – I / II / III Conducted & Report Submitted', data.ciaConducted, 'NA'],
                  ['4', 'Student Attendance Report Prepared & Submitted', data.attendanceReport, ''],
                  ['5', 'Remedial Classes Conducted (Enclose Report)', data.remedialClasses, 'NA'],
                  ['6', 'Mentoring Sessions Conducted', data.mentoringSessions, 'NA'],
                ].map((row) =>
                  new TableRow({
                    children: [
                      createCell(row[0], { width: 600, alignment: AlignmentType.CENTER }),
                      createCell(row[1], { width: 4500, bold: row[0] !== '4' }),
                      createCell(row[2] || '_',{ width: 2500, alignment: AlignmentType.CENTER }),
                      createCell(row[3] || (row[0] === '4' ? '' : '_'), { width: 2500, alignment: AlignmentType.CENTER }),
                    ],
                  })
                ),
              ],
            }),

            // B. STUDENT DEVELOPMENT ACTIVITIES Section
            new Paragraph({ spacing: { before: 300 }, children: [] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: '7B1FA2' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: '7B1FA2' },
                left: { style: BorderStyle.SINGLE, size: 1, color: '7B1FA2' },
                right: { style: BorderStyle.SINGLE, size: 1, color: '7B1FA2' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 17,
                      shading: { type: ShadingType.SOLID, color: 'E1BEE7', fill: 'E1BEE7' },
                      children: [
                        new Paragraph({ children: [new TextRun({ text: 'B. STUDENT DEVELOPMENT ACTIVITIES ', bold: true, size: 20, color: '6A1B9A' })] }),
                        new Paragraph({ children: [new TextRun({ text: '(*Prev Months: Cumulative counting starts from 1st July)', size: 16, italics: true, color: '6A1B9A' })] }),
                      ],
                    }),
                  ],
                }),
                // Header rows
                new TableRow({
                  children: [
                    createHeaderCell('Particulars', { width: 1400, rowSpan: 2, color: 'F3E5F5' }),
                    createHeaderCell('Guest Lectures /\nSeminar/Webinar', { width: 1500, colSpan: 2, color: 'F3E5F5', fontSize: 16 }),
                    createHeaderCell('Workshops\nOrganized', { width: 1300, colSpan: 2, color: 'F3E5F5', fontSize: 16 }),
                    createHeaderCell('Industrial\nVisits', { width: 1200, colSpan: 2, color: 'F3E5F5', fontSize: 16 }),
                    createHeaderCell('Value Added\nCourses', { width: 1300, colSpan: 2, color: 'F3E5F5', fontSize: 16 }),
                    createHeaderCell('Skill\nEnhancement', { width: 1200, colSpan: 2, color: 'F3E5F5', fontSize: 16 }),
                    createHeaderCell('Hands-on\nTraining', { width: 1200, colSpan: 2, color: 'F3E5F5', fontSize: 16 }),
                    createHeaderCell('Hackathon', { width: 1000, colSpan: 2, color: 'F3E5F5', fontSize: 16 }),
                    createHeaderCell('Prof. Society\nActivities', { width: 1000, rowSpan: 2, color: 'F3E5F5', fontSize: 16 }),
                  ],
                }),
                new TableRow({
                  children: [
                    ...Array(8).fill(null).flatMap(() => [
                      createHeaderCell('Prev\nMonths', { width: 650, color: 'F3E5F5', fontSize: 14 }),
                      createHeaderCell('Curr\nMonth', { width: 650, color: 'F3E5F5', fontSize: 14 }),
                    ]),
                  ],
                }),
                // Data rows
                new TableRow({
                  children: [
                    createCell('Prev Months*', { width: 1400, bold: true, shading: 'F5F5F5' }),
                    createCell(data.studentDev.guestLectures?.prev || '', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell(data.studentDev.workshops?.prev || '', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell(data.studentDev.industrialVisits?.prev || '', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell(data.studentDev.valueAddedCourses?.prev || '', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell(data.studentDev.skillEnhancement?.prev || '', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell(data.studentDev.handsOnTraining?.prev || '', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell(data.studentDev.hackathon?.prev || '', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 1000, alignment: AlignmentType.CENTER }),
                  ],
                }),
                new TableRow({
                  children: [
                    createCell('Curr Month', { width: 1400, bold: true, shading: 'E3F2FD' }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell(data.studentDev.guestLectures?.curr || '', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell(data.studentDev.workshops?.curr || '', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell(data.studentDev.industrialVisits?.curr || '', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell(data.studentDev.valueAddedCourses?.curr || '', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell(data.studentDev.skillEnhancement?.curr || '', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell(data.studentDev.handsOnTraining?.curr || '', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell(data.studentDev.hackathon?.curr || '', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 650, alignment: AlignmentType.CENTER }),
                    createCell('', { width: 1000, alignment: AlignmentType.CENTER }),
                  ],
                }),
                new TableRow({
                  children: [
                    createCell('Total (Cumulative)', { width: 1400, bold: true, shading: 'C8E6C9' }),
                    ...Array(8).fill(null).map(() => [
                      createCell('', { width: 1300, colSpan: 2, shading: 'C8E6C9', alignment: AlignmentType.CENTER }),
                    ]).flat(),
                    createCell('', { width: 1000, shading: 'C8E6C9', alignment: AlignmentType.CENTER }),
                  ],
                }),
              ],
            }),

            // C. RESEARCH & INNOVATION Section
            new Paragraph({ spacing: { before: 300 }, children: [] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: '00695C' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: '00695C' },
                left: { style: BorderStyle.SINGLE, size: 1, color: '00695C' },
                right: { style: BorderStyle.SINGLE, size: 1, color: '00695C' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 13,
                      shading: { type: ShadingType.SOLID, color: 'B2DFDB', fill: 'B2DFDB' },
                      children: [
                        new Paragraph({ children: [new TextRun({ text: 'C. RESEARCH & INNOVATION ', bold: true, size: 20, color: '004D40' })] }),
                        new Paragraph({ children: [new TextRun({ text: '(*Prev Months: Cumulative counting starts from 1st July)', size: 16, italics: true, color: '004D40' })] }),
                      ],
                    }),
                  ],
                }),
                // Headers
                new TableRow({
                  children: [
                    createHeaderCell('Particulars', { width: 1100, rowSpan: 2, color: 'E0F2F1' }),
                    createHeaderCell('Journal Publication\n(SCI/Scopus/WoS)', { width: 1400, colSpan: 2, color: 'E0F2F1', fontSize: 15 }),
                    createHeaderCell('Conference Papers\n(Scopus Indexed)', { width: 1300, colSpan: 2, color: 'E0F2F1', fontSize: 15 }),
                    createHeaderCell('Book', { width: 1000, colSpan: 2, color: 'E0F2F1', fontSize: 15 }),
                    createHeaderCell('Book Chapters\n(Scopus Indexed)', { width: 1200, colSpan: 2, color: 'E0F2F1', fontSize: 15 }),
                    createHeaderCell('Patents Published\n/ Grand', { width: 1100, colSpan: 2, color: 'E0F2F1', fontSize: 15 }),
                    createHeaderCell('Funded Projects\nProposal submission', { width: 1200, colSpan: 2, color: 'E0F2F1', fontSize: 15 }),
                    createHeaderCell('Faculty\nSign', { width: 700, rowSpan: 2, color: 'E0F2F1', fontSize: 15 }),
                  ],
                }),
                new TableRow({
                  children: [
                    ...Array(6).fill(null).flatMap(() => [
                      createHeaderCell('Prev', { width: 600, color: 'E0F2F1', fontSize: 14 }),
                      createHeaderCell('Curr', { width: 600, color: 'E0F2F1', fontSize: 14 }),
                    ]),
                  ],
                }),
                // Faculty Name header
                new TableRow({
                  children: [
                    createCell('Faculty Name', { width: 1100, bold: true, shading: 'EEEEEE' }),
                    ...Array(12).fill(null).map(() => createCell('', { width: 600, shading: 'EEEEEE' })),
                    createCell('', { width: 700, shading: 'EEEEEE' }),
                  ],
                }),
                // Faculty data rows
                ...(data.researchFaculty || []).slice(0, 9).map((faculty, idx) =>
                  new TableRow({
                    children: [
                      createCell(faculty.name || `Faculty ${idx + 1}`, { width: 1100 }),
                      ...['journalPub', 'conferencePapers', 'book', 'bookChapters', 'patents', 'fundedProjects'].flatMap((key) => [
                        createCell(faculty[key]?.prev || '', { width: 600, alignment: AlignmentType.CENTER }),
                        createCell(faculty[key]?.curr || '', { width: 600, alignment: AlignmentType.CENTER }),
                      ]),
                      createCell('', { width: 700, alignment: AlignmentType.CENTER }),
                    ],
                  })
                ),
              ],
            }),

            // D. FACULTY DEVELOPMENT Section
            new Paragraph({ spacing: { before: 300 }, children: [] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: 'E65100' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E65100' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'E65100' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'E65100' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 11,
                      shading: { type: ShadingType.SOLID, color: 'FFE0B2', fill: 'FFE0B2' },
                      children: [
                        new Paragraph({ children: [new TextRun({ text: 'D. FACULTY DEVELOPMENT ', bold: true, size: 20, color: 'BF360C' })] }),
                        new Paragraph({ children: [new TextRun({ text: '(*Prev Months: Cumulative counting starts from 1st July)', size: 16, italics: true, color: 'BF360C' })] }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    createHeaderCell('Particulars', { width: 1400, rowSpan: 2, color: 'FFF3E0' }),
                    createHeaderCell('FDPs/Workshops/\nConf/Seminars\nAttended', { width: 1500, colSpan: 2, color: 'FFF3E0', fontSize: 14 }),
                    createHeaderCell('FDPs/Workshops/\nConf/Seminars\nOrganized', { width: 1500, colSpan: 2, color: 'FFF3E0', fontSize: 14 }),
                    createHeaderCell('NPTEL\nCompleted', { width: 1200, colSpan: 2, color: 'FFF3E0', fontSize: 14 }),
                    createHeaderCell('MOOCs\nCompleted', { width: 1200, colSpan: 2, color: 'FFF3E0', fontSize: 14 }),
                    createHeaderCell('Resource Person\nEngagements', { width: 1300, colSpan: 2, color: 'FFF3E0', fontSize: 14 }),
                    createHeaderCell('Faculty\nSign', { width: 700, rowSpan: 2, color: 'FFF3E0', fontSize: 14 }),
                  ],
                }),
                new TableRow({
                  children: [
                    ...Array(5).fill(null).flatMap(() => [
                      createHeaderCell('Prev Month', { width: 700, color: 'FFF3E0', fontSize: 13 }),
                      createHeaderCell('Curr Month', { width: 700, color: 'FFF3E0', fontSize: 13 }),
                    ]),
                  ],
                }),
                new TableRow({
                  children: [
                    createCell('Faculty Name / Designation', { width: 1400, bold: true, shading: 'EEEEEE' }),
                    ...Array(10).fill(null).map(() => createCell('', { width: 700, shading: 'EEEEEE' })),
                    createCell('', { width: 700, shading: 'EEEEEE' }),
                  ],
                }),
                ...(data.facultyDev || []).slice(0, 9).map((faculty, idx) =>
                  new TableRow({
                    children: [
                      createCell(faculty.name || `Faculty ${idx + 1}`, { width: 1400 }),
                      ...['fdpsAttended', 'fdpsOrganized', 'nptelCompleted', 'moocsCompleted', 'resourcePerson'].flatMap((key) => [
                        createCell(faculty[key]?.prev || '', { width: 700, alignment: AlignmentType.CENTER }),
                        createCell(faculty[key]?.curr || '', { width: 700, alignment: AlignmentType.CENTER }),
                      ]),
                      createCell('', { width: 700, alignment: AlignmentType.CENTER }),
                    ],
                  })
                ),
              ],
            }),

            // E. STUDENTS INTERNSHIP Section
            new Paragraph({ spacing: { before: 300 }, children: [] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: 'C62828' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'C62828' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'C62828' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'C62828' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 6,
                      shading: { type: ShadingType.SOLID, color: 'FFCDD2', fill: 'FFCDD2' },
                      children: [
                        new Paragraph({ children: [new TextRun({ text: 'E. STUDENTS INTERNSHIP ', bold: true, size: 20, color: 'B71C1C' })] }),
                        new Paragraph({ children: [new TextRun({ text: '(*Prev Months: Cumulative counting starts from 1st July)', size: 16, italics: true, color: 'B71C1C' })] }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    createHeaderCell('Internship Details', { width: 2200, colSpan: 2, color: 'FFEBEE' }),
                    createHeaderCell('Industry Internships\n(Paid)', { width: 1700, color: 'FFEBEE' }),
                    createHeaderCell('Industry Internships\n(Non-Paid)', { width: 1900, color: 'FFEBEE' }),
                    createHeaderCell('Virtual\nInternships', { width: 1600, color: 'FFEBEE' }),
                    createHeaderCell('No. of Students Not\nAvailed Internship', { width: 2300, color: 'FFEBEE' }),
                  ],
                }),
                new TableRow({
                  children: [
                    createCell('Previous Months', { width: 2200, colSpan: 2, bold: true, shading: 'FFEBEE' }),
                    createCell(data.internship?.previous?.paid || '', { width: 1700, alignment: AlignmentType.CENTER }),
                    createCell(data.internship?.previous?.nonPaid || '', { width: 1900, alignment: AlignmentType.CENTER }),
                    createCell(data.internship?.previous?.virtual || '', { width: 1600, alignment: AlignmentType.CENTER }),
                    createCell(data.internship?.previous?.notAvailed || '', { width: 2300, alignment: AlignmentType.CENTER }),
                  ],
                }),
                new TableRow({
                  children: [
                    createCell('Current Month', { width: 2200, colSpan: 2, bold: true, shading: 'E3F2FD' }),
                    createCell(data.internship?.current?.paid || '', { width: 1700, alignment: AlignmentType.CENTER }),
                    createCell(data.internship?.current?.nonPaid || '', { width: 1900, alignment: AlignmentType.CENTER }),
                    createCell(data.internship?.current?.virtual || '', { width: 1600, alignment: AlignmentType.CENTER }),
                    createCell(data.internship?.current?.notAvailed || '', { width: 2300, alignment: AlignmentType.CENTER }),
                  ],
                }),
                new TableRow({
                  children: [
                    createCell('Total (Cumulative)', { width: 2200, colSpan: 2, bold: true, shading: 'C8E6C9' }),
                    createCell(data.internship?.total?.paid || '', { width: 1700, alignment: AlignmentType.CENTER, shading: 'C8E6C9' }),
                    createCell(data.internship?.total?.nonPaid || '', { width: 1900, alignment: AlignmentType.CENTER, shading: 'C8E6C9' }),
                    createCell(data.internship?.total?.virtual || '', { width: 1600, alignment: AlignmentType.CENTER, shading: 'C8E6C9' }),
                    createCell(data.internship?.total?.notAvailed || '', { width: 2300, alignment: AlignmentType.CENTER, shading: 'C8E6C9' }),
                  ],
                }),
              ],
            }),

            // F. FACULTY-INDUSTRY INTERACTION Section
            new Paragraph({ spacing: { before: 300 }, children: [] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: '00838F' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: '00838F' },
                left: { style: BorderStyle.SINGLE, size: 1, color: '00838F' },
                right: { style: BorderStyle.SINGLE, size: 1, color: '00838F' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 11,
                      shading: { type: ShadingType.SOLID, color: 'B2EBF2', fill: 'B2EBF2' },
                      children: [
                        new Paragraph({ children: [new TextRun({ text: 'F. FACULTY - INDUSTRY INTERACTION ', bold: true, size: 20, color: '006064' })] }),
                        new Paragraph({ children: [new TextRun({ text: '(*Prev months: Cumulative counting starts from 1st July)', size: 16, italics: true, color: '006064' })] }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    createHeaderCell('Faculty Name /\nDesignation', { width: 1400, rowSpan: 2, color: 'E0F7FA' }),
                    createHeaderCell('MoUs Signed', { width: 1400, colSpan: 2, color: 'E0F7FA', fontSize: 15 }),
                    createHeaderCell('Industry Visits', { width: 1300, colSpan: 2, color: 'E0F7FA', fontSize: 15 }),
                    createHeaderCell('Experts Invited', { width: 1300, colSpan: 2, color: 'E0F7FA', fontSize: 15 }),
                    createHeaderCell('Collaborative\nActivities', { width: 1400, colSpan: 2, color: 'E0F7FA', fontSize: 15 }),
                    createHeaderCell('Consultancy\nServices', { width: 1400, colSpan: 2, color: 'E0F7FA', fontSize: 15 }),
                  ],
                }),
                new TableRow({
                  children: [
                    ...Array(5).fill(null).flatMap(() => [
                      createHeaderCell('Prev Months', { width: 700, color: 'E0F7FA', fontSize: 13 }),
                      createHeaderCell('Curr Month', { width: 700, color: 'E0F7FA', fontSize: 13 }),
                    ]),
                  ],
                }),
                ...(data.industryInteraction || []).slice(0, 8).map((faculty, idx) =>
                  new TableRow({
                    children: [
                      createCell(faculty.name || `Faculty ${idx + 1}`, { width: 1400 }),
                      ...['mousSigned', 'industryVisits', 'expertsInvited', 'collaborativeActivities', 'consultancyServices'].flatMap((key) => [
                        createCell(faculty[key]?.prev || '', { width: 700, alignment: AlignmentType.CENTER }),
                        createCell(faculty[key]?.curr || '', { width: 700, alignment: AlignmentType.CENTER }),
                      ]),
                    ],
                  })
                ),
                new TableRow({
                  children: [
                    createCell('As on _____, 20... (Cumulative)', { width: 1400, bold: true, shading: 'C8E6C9' }),
                    ...Array(10).fill(null).map(() => createCell('', { width: 700, shading: 'C8E6C9', alignment: AlignmentType.CENTER })),
                  ],
                }),
              ],
            }),

            // G. QUALITY ASSURANCE ACTIVITIES Section
            new Paragraph({ spacing: { before: 300 }, children: [] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: '558B2F' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: '558B2F' },
                left: { style: BorderStyle.SINGLE, size: 1, color: '558B2F' },
                right: { style: BorderStyle.SINGLE, size: 1, color: '558B2F' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 3,
                      shading: { type: ShadingType.SOLID, color: 'DCEDC8', fill: 'DCEDC8' },
                      children: [
                        new Paragraph({ children: [new TextRun({ text: 'G. QUALITY ASSURANCE ACTIVITIES ', bold: true, size: 20, color: '33691E' })] }),
                        new Paragraph({ children: [new TextRun({ text: '(Documents and supporting evidence shall be maintained and kept ready for Academic Audit)', size: 15, italics: true, color: '33691E' })] }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    createHeaderCell('Particulars', { width: 4500, color: 'F1F8E9' }),
                    createHeaderCell('Status', { width: 2500, color: 'F1F8E9' }),
                    createHeaderCell('Remarks', { width: 3500, color: 'F1F8E9' }),
                  ],
                }),
                ...(data.qaActivities || []).map((item) =>
                  new TableRow({
                    children: [
                      createCell(item.particular, { width: 4500 }),
                      createCell(item.status || '', { width: 2500, alignment: AlignmentType.CENTER }),
                      createCell(item.remarks || '', { width: 3500 }),
                    ],
                  })
                ),
              ],
            }),

            // H. DOCUMENTS TO BE ATTACHED Section
            new Paragraph({ spacing: { before: 300 }, children: [] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: '303F9F' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: '303F9F' },
                left: { style: BorderStyle.SINGLE, size: 1, color: '303F9F' },
                right: { style: BorderStyle.SINGLE, size: 1, color: '303F9F' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 2,
                      shading: { type: ShadingType.SOLID, color: 'C5CAE9', fill: 'C5CAE9' },
                      children: [new Paragraph({ children: [new TextRun({ text: 'H. DOCUMENTS TO BE ATTACHED', bold: true, size: 22, color: '1A237E' })] })],
                    }),
                  ],
                }),
                ...([
                  ['eventReports', 'Event Reports', 'internshipDetails', 'Internship Details'],
                  ['workshopCertificates', 'Workshop / FDP / Conference etc. participation Certificates', 'studentAchievementProofs', 'Student Achievement Proofs'],
                  ['publicationProofs', 'Publication Proofs', 'sdgExtensionReports', 'SDG / Extension Activity Reports'],
                  ['placementDetails', 'Placement Details', 'mouIndustryDocuments', 'MoU / Industry Interaction Documents'],
                ] as [string, string, string, string][]).map(([key1, label1, key2, label2]) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                          bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                          left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                          right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: data.documents?.[key1] ? '\u2611' : '\u2610', size: 24 }),
                              new TextRun({ text: `  ${label1}`, size: 18 }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                          bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                          left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                          right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: data.documents?.[key2] ? '\u2611' : '\u2610', size: 24 }),
                              new TextRun({ text: `  ${label2}`, size: 18 }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  })
                ),
              ],
            }),

            // Signature Section
            new Paragraph({ spacing: { before: 400 }, children: [] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
              },
              rows: [
                new TableRow({
                  children: ['HoD', 'School Dean / Director', 'Head-IQAC', 'Vice-Principal', 'Principal'].map((role) =>
                    new TableCell({
                      width: { size: 20, type: WidthType.PERCENTAGE },
                      verticalAlign: VerticalAlign.BOTTOM,
                      children: [
                        new Paragraph({ spacing: { after: 400 }, children: [] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: role, bold: true, size: 20 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Date:', size: 16 })] }),
                      ],
                    })
                  ),
                }),
              ],
            }),

            // Copy submitted to section
            new Paragraph({ spacing: { before: 300 }, children: [] }),
            new Paragraph({ children: [new TextRun({ text: 'Copy submitted to', size: 20, italics: true })] }),
            new Paragraph({ spacing: { before: 100 }, children: [] }),
            new Table({
              width: { size: 70, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: '1.', size: 18 })] })] }),
                    new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'AO / HR / Principal office', size: 18 })] })] }),
                    new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Submitted on: ___________', size: 16 })] })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: '2.', size: 18 })] })] }),
                    new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'IQAC', size: 18 })] })] }),
                    new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Submitted on: ___________', size: 16 })] })] }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    })

    // Generate the document buffer
    const buffer = await Packer.toBuffer(doc)

    // Return the document as a downloadable file
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Monthly_Department_Report_${data.department}_${data.reportingMonth}_${data.reportingYear}.docx"`,
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
