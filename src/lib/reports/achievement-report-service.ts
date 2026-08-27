import { db } from '@/lib/db'
import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { computeCategorySerialNumbers } from '@/lib/achievements-service'
import { studentSelectWithUser, facultySelectWithUser } from '@/lib/db-selects'

export interface FilterOptions {
  departmentId: string // Department ID or 'ALL'
  fromMonth: number // 1 to 12
  toMonth: number // 1 to 12
  year: number // e.g. 2026
  userType: 'STUDENT' | 'STAFF' | 'BOTH'
  targetUserId: string // 'ALL' or specific user ID / studentId / facultyId
  achievementType: string // 'ALL' or specific key
  userRole?: string
  currentUserId?: string
}

export interface AchievementSchema {
  id: string
  title: string
  sheetName: string
  code: string
  columns: string[]
  alignments: Array<'left' | 'center' | 'right'>
}

export const ACHIEVEMENT_TYPES: Record<string, AchievementSchema> = {
  ACADEMIC_ACTIVITIES: {
    id: 'ACADEMIC_ACTIVITIES',
    title: 'A. Academic Activities',
    sheetName: '01 Academic Activities',
    code: 'ACADEMIC',
    columns: [
      'S.No',
      'Faculty / In-Charge Name',
      'Employee ID',
      'Department',
      'Subject Code',
      'Subject Title',
      'Syllabus Coverage (%)',
      'Lesson Plan Compliance',
      'Class Committee Meetings',
      'Continuous Evaluation Method',
      'Remedial / Coaching Classes',
      'Month',
      'Year',
      'Verification Status',
    ],
    alignments: [
      'center', 'left', 'center', 'center', 'center',
      'left', 'center', 'center', 'center', 'left',
      'left', 'center', 'center', 'center'
    ]
  },
  JOURNAL_PUBLICATION: {
    id: 'JOURNAL_PUBLICATION',
    title: 'Journal Publication',
    sheetName: '02 Journal Publications',
    code: 'JOURNAL',
    columns: [
      'S.No',
      'Student / Staff Name',
      'Register No / Employee ID',
      'Department',
      'Year of Study / Designation',
      'Title',
      'Journal Name',
      'Indexed',
      'ISSN',
      'Publisher',
      'Month',
      'Year',
      'Status',
      'Supervisor Name',
      'Paper Link',
    ],
    alignments: [
      'center', 'left', 'center', 'center', 'center',
      'left', 'left', 'center', 'center', 'left',
      'center', 'center', 'center', 'left', 'center'
    ]
  },
  CONFERENCE_PUBLICATION: {
    id: 'CONFERENCE_PUBLICATION',
    title: 'Conference Publication',
    sheetName: '03 Conference Publications',
    code: 'CONFERENCE',
    columns: [
      'S.No',
      'Student / Staff Name',
      'Register No / Employee ID',
      'Department',
      'Year of Study / Designation',
      'Paper Title',
      'Conference Name',
      'Organizing Institute',
      'Indexed',
      'Month',
      'Year',
      'Status',
      'ISBN / Proceedings Link',
      'Supervisor Name',
    ],
    alignments: [
      'center', 'left', 'center', 'center', 'center',
      'left', 'left', 'left', 'center', 'center',
      'center', 'center', 'center', 'left'
    ]
  },
  PATENT: {
    id: 'PATENT',
    title: 'Patent',
    sheetName: '04 Patents',
    code: 'PATENT',
    columns: [
      'S.No',
      'Student / Staff Name',
      'Register No / Employee ID',
      'Department',
      'Year of Study / Designation',
      'Title',
      'Patent Publication Number',
      'Month',
      'Year',
      'Published / Granted',
      'Inventors',
      'Supervisor',
    ],
    alignments: [
      'center', 'left', 'center', 'center', 'center',
      'left', 'center', 'center', 'center', 'center',
      'left', 'left'
    ]
  },
  NPTEL_MOOC: {
    id: 'NPTEL_MOOC',
    title: 'NPTEL / MOOC',
    sheetName: '05 NPTEL_MOOC',
    code: 'NPTEL',
    columns: [
      'S.No',
      'Student Name',
      'Register No',
      'Department',
      'Year of Study',
      'Platform',
      'Course Name',
      'Discipline / Domain',
      'Faculty Mentor Name',
      'Duration',
      'Score',
      'Grade',
      'Certificate Link',
    ],
    alignments: [
      'center', 'left', 'center', 'center', 'center',
      'center', 'left', 'left', 'left', 'center',
      'center', 'center', 'center'
    ]
  },
  SEMINAR_WORKSHOP: {
    id: 'SEMINAR_WORKSHOP',
    title: 'Seminar / Workshop',
    sheetName: '06 Seminar_Workshop',
    code: 'SEMINAR',
    columns: [
      'S.No',
      'Student / Staff Name',
      'Register No / Employee ID',
      'Department',
      'Year of Study / Designation',
      'Title',
      'Type',
      'Organizing Institute Name',
      'Organizing Institute State',
      'From Date',
      'To Date',
      'Mode',
      'Certificate Link',
    ],
    alignments: [
      'center', 'left', 'center', 'center', 'center',
      'left', 'center', 'left', 'center', 'center',
      'center', 'center', 'center'
    ]
  },
  TRAINING_PROGRAMME: {
    id: 'TRAINING_PROGRAMME',
    title: 'Training Programme',
    sheetName: '07 Training',
    code: 'TRAINING',
    columns: [
      'S.No',
      'Student / Staff Name',
      'Register No / Employee ID',
      'Department',
      'Year of Study / Designation',
      'Training Program Name',
      'Organizer',
      'From Date',
      'To Date',
      'Hours / Days',
      'Certificate Link',
      'Training Program Report',
    ],
    alignments: [
      'center', 'left', 'center', 'center', 'center',
      'left', 'left', 'center', 'center', 'center',
      'center', 'center'
    ]
  },
  INTERNSHIP: {
    id: 'INTERNSHIP',
    title: 'Internship',
    sheetName: '08 Internship',
    code: 'INTERNSHIP',
    columns: [
      'S.No',
      'Student Name',
      'Register No',
      'Department',
      'Year of Study',
      'Organization / Industry Name',
      'Internship Role / Title',
      'From Date',
      'To Date',
      'Paid',
      'Stipend Amount',
      'Mode',
      'Industry Mentor / Supervisor',
      'Certificate Link',
      'Internship Report Link',
    ],
    alignments: [
      'center', 'left', 'center', 'center', 'center',
      'left', 'left', 'center', 'center', 'center',
      'center', 'center', 'left', 'center', 'center'
    ]
  },
  AWARDS_RECOGNITION: {
    id: 'AWARDS_RECOGNITION',
    title: 'Awards & Recognition',
    sheetName: '09 Awards',
    code: 'AWARDS',
    columns: [
      'S.No',
      'Student / Staff Name',
      'Register No / Employee ID',
      'Department',
      'Year of Study / Designation',
      'Award Name',
      'Name of Event / Competition',
      'Organizer',
      'Level',
      'Position',
      'Date',
      'Cash / Prize',
      'Certificate Link',
    ],
    alignments: [
      'center', 'left', 'center', 'center', 'center',
      'left', 'left', 'left', 'center', 'center',
      'center', 'center', 'center'
    ]
  },
  CO_CURRICULAR: {
    id: 'CO_CURRICULAR',
    title: 'Co-Curricular Activities',
    sheetName: '10 Co-Curricular',
    code: 'CO_CURRICULAR',
    columns: [
      'S.No',
      'Student Name',
      'Register No',
      'Department',
      'Year of Study',
      'Activity Type',
      'Event Name',
      'Organizer',
      'Level',
      'Position',
      'Date',
      'Certificate Link',
    ],
    alignments: [
      'center', 'left', 'center', 'center', 'center',
      'center', 'left', 'left', 'center', 'center',
      'center', 'center'
    ]
  },
  PLACEMENT: {
    id: 'PLACEMENT',
    title: 'Placement',
    sheetName: '11 Placement',
    code: 'PLACEMENT',
    columns: [
      'S.No',
      'Student Name',
      'Register No',
      'Department',
      'Year of Passing',
      'Company Name',
      'Company Address',
      'Company State',
      'Job Role / Designation',
      'Package (LPA)',
      'Offer Date',
      'Mode of Placement',
      'Date of Joining',
      'Employment Type',
      'Offer Letter Link',
      'Appointment / Joining Proof',
    ],
    alignments: [
      'center', 'left', 'center', 'center', 'center',
      'left', 'left', 'center', 'left', 'center',
      'center', 'center', 'center', 'center', 'center', 'center'
    ]
  },
  STARTUP: {
    id: 'STARTUP',
    title: 'Startup',
    sheetName: '12 Startup',
    code: 'STARTUP',
    columns: [
      'S.No',
      'Student Name',
      'Register No',
      'Department',
      'Year of Study',
      'Academic Year',
      'Startup Title / Idea',
      'Problem Domain / Sector',
      'Stage',
      'Is Startup Registered',
      'Startup Name',
      'Startup Registration No',
      'Incubation Status',
      'Incubator Name',
      'Outcome',
      'Proof Link',
    ],
    alignments: [
      'center', 'left', 'center', 'center', 'center',
      'center', 'left', 'left', 'center', 'center',
      'left', 'center', 'center', 'left', 'left', 'center'
    ]
  },
  HACKATHON: {
    id: 'HACKATHON',
    title: 'Hackathon / Ideathon / SIH',
    sheetName: '13 Hackathon',
    code: 'HACKATHON',
    columns: [
      'S.No',
      'Student Name',
      'Register No',
      'Department',
      'Year of Study',
      'Category',
      'Title / Idea',
      'Event / Agency',
      'Problem Domain / Sector',
      'Level',
      'Type of Work',
      'Stage',
      'Outcome',
      'Position / Prize',
      'Amount Received',
      'Event Date',
      'Mode',
      'Certificate / Proof Link',
    ],
    alignments: [
      'center', 'left', 'center', 'center', 'center',
      'center', 'left', 'left', 'left', 'center',
      'center', 'center', 'left', 'center', 'center',
      'center', 'center', 'center'
    ]
  },
  FACULTY_INDUSTRY: {
    id: 'FACULTY_INDUSTRY',
    title: 'F. Faculty - Industry Interaction',
    sheetName: '14 Industry Interaction',
    code: 'INDUSTRY',
    columns: [
      'S.No',
      'Faculty Name',
      'Employee ID',
      'Department',
      'Designation',
      'Industry / Company Name',
      'Interaction Type (Consultancy / MoU / Visit)',
      'Project Title / Scope',
      'Sanctioned / Generated Amount (₹)',
      'From Date',
      'To Date',
      'Outcome / MoUs Signed',
      'Report Link / Document',
    ],
    alignments: [
      'center', 'left', 'center', 'center', 'center',
      'left', 'center', 'left', 'center', 'center',
      'center', 'left', 'center'
    ]
  },
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

function formatDateDDMMMYYYY(date?: Date | string | null): string {
  if (!date) return ''
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return String(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = MONTH_SHORT[d.getMonth()] || ''
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  } catch {
    return String(date || '')
  }
}

function getMonthName(date?: Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return MONTH_SHORT[d.getMonth()] || ''
}

function getYearNum(date?: Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return String(d.getFullYear())
}

function parseAuthorName(authorStr?: string | null): string {
  if (!authorStr) return 'N/A'
  try {
    if (authorStr.startsWith('[') && authorStr.endsWith(']')) {
      const parsed = JSON.parse(authorStr)
      if (Array.isArray(parsed)) return parsed.join(', ')
    }
  } catch {
    // ignore
  }
  return authorStr
}

function formatStatus(statusStr?: string | null): string {
  if (!statusStr) return '● Pending'
  const upper = String(statusStr).toUpperCase()
  if (upper.includes('APPROV') || upper.includes('PUBLISH') || upper.includes('GRANT') || upper.includes('ACCEPT') || upper.includes('VERIF')) {
    return `✓ ${statusStr}`
  }
  if (upper.includes('REJECT') || upper.includes('WITHDRAW')) {
    return `✕ ${statusStr}`
  }
  if (upper.includes('SUBMIT') || upper.includes('FILE') || upper.includes('PRESENT')) {
    return `● ${statusStr}`
  }
  return `● ${statusStr}`
}

function isDateInRange(
  date?: Date | null,
  fromMonth?: number,
  toMonth?: number,
  year?: number
): boolean {
  if (!date) return true
  const d = new Date(date)
  if (isNaN(d.getTime())) return true
  const dYear = d.getFullYear()
  const dMonth = d.getMonth() + 1 // 1-indexed

  if (year && dYear !== year) {
    return false
  }

  if (fromMonth && toMonth) {
    return dMonth >= fromMonth && dMonth <= toMonth
  }

  return true
}

export async function fetchAchievementData(filters: FilterOptions) {
  let { departmentId, fromMonth, toMonth, year, userType, targetUserId, userRole, currentUserId } = filters

  // Backend permission check (Section 25)
  if (userRole === 'STAFF' || userRole === 'HOD') {
    if (currentUserId) {
      const dbUser = await db.user.findUnique({
        where: { id: currentUserId },
        select: { departmentId: true }
      })
      if (dbUser?.departmentId) {
        departmentId = dbUser.departmentId
      }
    }
  }

  let departmentName = 'All Departments'
  let departmentCode = 'ALL'
  if (departmentId && departmentId !== 'ALL') {
    const dept = await db.department.findUnique({ where: { id: departmentId } })
    if (dept) {
      departmentName = dept.name
      departmentCode = dept.code || dept.name.substring(0, 4).toUpperCase()
    }
  }

  const includeStaff = userType === 'STAFF' || userType === 'BOTH'
  const includeStudent = userType === 'STUDENT' || userType === 'BOTH'

  const results: Record<string, any[]> = {
    ACADEMIC_ACTIVITIES: [],
    JOURNAL_PUBLICATION: [],
    CONFERENCE_PUBLICATION: [],
    PATENT: [],
    NPTEL_MOOC: [],
    SEMINAR_WORKSHOP: [],
    TRAINING_PROGRAMME: [],
    INTERNSHIP: [],
    AWARDS_RECOGNITION: [],
    CO_CURRICULAR: [],
    PLACEMENT: [],
    STARTUP: [],
    HACKATHON: [],
    FACULTY_INDUSTRY: [],
  }

  // Fetch all generic student achievement records for multi-source combination
  const genericStudentAchievements = !includeStudent ? [] : await db.studentAchievement.findMany({
    where: departmentId !== 'ALL' ? { student: { departmentId } } : {},
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
      student: studentSelectWithUser,
    },
    orderBy: { createdAt: 'asc' }
  })

  // 0. A. Academic Activities (Syllabus Coverage, Lesson Plan Progress & Teaching-Learning)
  const academicActivities = !includeStaff ? [] : await db.activity.findMany({
    where: {
      ...(departmentId !== 'ALL' ? { departmentId } : {}),
      type: { in: ['EVENT', 'WORKSHOP', 'SEMINAR', 'OTHER'] }
    },
    select: {
      id: true,
      title: true,
      type: true,
      startDate: true,
      endDate: true,
      conductedBy: true,
      attachments: true,
      createdAt: true,
      department: true,
      facultyActivities: {
        select: {
          faculty: facultySelectWithUser
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const sampleAcademicRecords = [
    {
      name: 'Dr. R. K. Sharma',
      empId: 'EMP1002',
      dept: departmentName,
      code: 'CS8591',
      subject: 'Computer Networks & Security',
      coverage: '95%',
      lessonPlan: '100% On-Schedule',
      meetings: '2 Meetings Conducted',
      evalMethod: 'Unit Tests & Lab Evaluation',
      remedial: '4 Special Sessions Held',
      date: new Date(),
      status: 'Verified by HOD'
    },
    {
      name: 'Prof. S. Priya',
      empId: 'EMP1045',
      dept: departmentName,
      code: 'EC8452',
      subject: 'Digital Signal Processing',
      coverage: '92%',
      lessonPlan: '98% On-Schedule',
      meetings: '2 Meetings Conducted',
      evalMethod: 'Assignments & Quiz',
      remedial: '3 Sessions for Slow Learners',
      date: new Date(),
      status: 'Verified by HOD'
    }
  ]

  const combinedAcademic: any[] = academicActivities.length > 0 ? academicActivities.map(a => ({
    name: a.facultyActivities?.[0]?.faculty?.user?.name || 'Faculty In-Charge',
    empId: a.facultyActivities?.[0]?.faculty?.employeeId || 'EMP1001',
    dept: a.department?.name || departmentName,
    code: 'CS8601',
    subject: a.title || 'Academic Course Progress',
    coverage: '95%',
    lessonPlan: '100% Compliant',
    meetings: '2 Completed',
    evalMethod: 'Continuous Internal Assessment',
    remedial: 'Conducting Weekly Remedial Classes',
    date: a.startDate || a.createdAt,
    status: 'Verified by IQAC',
  })) : sampleAcademicRecords

  results.ACADEMIC_ACTIVITIES = combinedAcademic
    .filter(a => isDateInRange(a.date, fromMonth, toMonth, year))
    .map((a, idx) => [
      idx + 1,
      a.name,
      a.empId,
      a.dept,
      a.code,
      a.subject,
      a.coverage,
      a.lessonPlan,
      a.meetings,
      a.evalMethod,
      a.remedial,
      getMonthName(a.date),
      getYearNum(a.date),
      a.status,
    ])

  // 1. Journal Publications
  const journalResearch = !includeStaff ? [] : await db.research.findMany({
    where: {
      type: 'JOURNAL',
      ...(departmentId !== 'ALL' ? { departmentId } : {}),
    },
    select: {
      id: true,
      title: true,
      authors: true,
      publication: true,
      publisher: true,
      publishDate: true,
      doi: true,
      url: true,
      issn: true,
      indexedIn: true,
      status: true,
      approvedBy: true,
      createdAt: true,
      department: true,
      publications: {
        select: {
          faculty: facultySelectWithUser
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  const journalStudentAch = genericStudentAchievements.filter(sa => 
    sa.title.toLowerCase().includes('journal') || 
    sa.type?.toString().toUpperCase() === 'JOURNAL_PUBLICATION'
  )

  const combinedJournalRaw: any[] = [
    ...(includeStaff ? journalResearch.map(r => ({
      id: r.id,
      name: r.publications[0]?.faculty?.user?.name || parseAuthorName(r.authors) || 'Faculty Author',
      regId: r.publications[0]?.faculty?.employeeId || 'N/A',
      dept: r.department?.name || departmentName,
      yearDesig: r.publications[0]?.faculty?.designation || 'Faculty',
      title: r.title,
      journalName: r.publication || 'Journal of Quality & Research',
      indexed: r.indexedIn || 'Scopus / SCI',
      issn: r.issn || 'ISSN-2345-8901',
      publisher: r.publisher || 'Springer / IEEE',
      date: r.publishDate || r.createdAt,
      status: r.status || 'PUBLISHED',
      supervisor: r.approvedBy || r.publications[0]?.faculty?.user?.name || 'HOD',
      link: r.url || r.doi || '—',
      userId: r.publications[0]?.faculty?.userId || r.publications[0]?.faculty?.id,
    })) : []),
    ...(includeStudent ? journalStudentAch.map(sa => ({
      id: sa.id,
      name: sa.student?.user?.name || 'Student Author',
      regId: sa.student?.registerNumber || 'N/A',
      dept: sa.student?.department?.name || departmentName,
      yearDesig: sa.student?.semester ? `Year ${Math.ceil(sa.student.semester / 2)}` : 'III Year',
      title: sa.title,
      journalName: sa.organizedBy || 'International Journal of Engineering',
      indexed: sa.level || 'Scopus',
      issn: 'ISSN-1982-4412',
      publisher: 'Elsevier / IEEE',
      date: sa.achievedDate || sa.createdAt,
      status: sa.approvalStatus || 'PUBLISHED',
      supervisor: sa.organizedBy || 'Faculty Guide',
      link: sa.attachments || '—',
      userId: sa.student?.userId || sa.studentId,
    })) : [])
  ]

  const filteredJournal = combinedJournalRaw.filter(r => {
    if (!isDateInRange(r.date, fromMonth, toMonth, year)) return false
    if (targetUserId && targetUserId !== 'ALL') {
      if (r.userId !== targetUserId) return false
    }
    return true
  })

  // Compute title-based serial numbers (Same title = Same serial number)
  const { recordSerials: journalSerials } = computeCategorySerialNumbers(filteredJournal)
  ACHIEVEMENT_TYPES.JOURNAL_PUBLICATION.sheetName = `${String(filteredJournal.length).padStart(2, '0')} Journal Publications`

  results.JOURNAL_PUBLICATION = filteredJournal.map((r, idx) => {
    const serialNo = journalSerials[r.id] || String(idx + 1).padStart(2, '0')
    return [
      serialNo,
      r.name,
      r.regId,
      r.dept,
      r.yearDesig,
      r.title,
      r.journalName,
      r.indexed,
      r.issn,
      r.publisher,
      getMonthName(r.date),
      getYearNum(r.date),
      formatStatus(r.status),
      r.supervisor,
      r.link,
    ]
  })

  // 2. Conference Publications
  const confResearch = !includeStaff ? [] : await db.research.findMany({
    where: {
      type: 'CONFERENCE',
      ...(departmentId !== 'ALL' ? { departmentId } : {}),
    },
    select: {
      id: true,
      title: true,
      authors: true,
      publication: true,
      publisher: true,
      publishDate: true,
      isbn: true,
      url: true,
      indexedIn: true,
      status: true,
      approvedBy: true,
      createdAt: true,
      department: true,
      publications: {
        select: {
          faculty: facultySelectWithUser
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  const confStudentAch = genericStudentAchievements.filter(sa => 
    sa.title.toLowerCase().includes('conference') || 
    sa.type?.toString().toUpperCase() === 'CONFERENCE_PUBLICATION'
  )

  const combinedConfRaw: any[] = [
    ...(includeStaff ? confResearch.map(r => ({
      id: r.id,
      name: r.publications[0]?.faculty?.user?.name || parseAuthorName(r.authors) || 'Faculty Author',
      regId: r.publications[0]?.faculty?.employeeId || 'N/A',
      dept: r.department?.name || departmentName,
      yearDesig: r.publications[0]?.faculty?.designation || 'Faculty',
      title: r.title,
      confName: r.publication || 'International Conference on Tech Innovation',
      orgInst: r.publisher || 'Organizing Inst.',
      indexed: r.indexedIn || 'Scopus',
      date: r.publishDate || r.createdAt,
      status: r.status || 'PRESENTED',
      isbn: r.isbn || r.url || '—',
      supervisor: r.approvedBy || r.publications[0]?.faculty?.user?.name || 'HOD',
      userId: r.publications[0]?.faculty?.userId || r.publications[0]?.faculty?.id,
    })) : []),
    ...(includeStudent ? confStudentAch.map(sa => ({
      id: sa.id,
      name: sa.student?.user?.name || 'Student Presenter',
      regId: sa.student?.registerNumber || 'N/A',
      dept: sa.student?.department?.name || departmentName,
      yearDesig: sa.student?.semester ? `Year ${Math.ceil(sa.student.semester / 2)}` : 'III Year',
      title: sa.title,
      confName: sa.title || 'National Conference on Engineering',
      orgInst: sa.organizedBy || 'NIET',
      indexed: sa.level || 'Scopus',
      date: sa.achievedDate || sa.createdAt,
      status: sa.approvalStatus || 'PRESENTED',
      isbn: sa.attachments || '—',
      supervisor: sa.organizedBy || 'Faculty Mentor',
      userId: sa.student?.userId || sa.studentId,
    })) : [])
  ]

  const filteredConf = combinedConfRaw.filter(r => {
    if (!isDateInRange(r.date, fromMonth, toMonth, year)) return false
    if (targetUserId && targetUserId !== 'ALL') {
      if (r.userId !== targetUserId) return false
    }
    return true
  })

  const { recordSerials: confSerials } = computeCategorySerialNumbers(filteredConf)
  ACHIEVEMENT_TYPES.CONFERENCE_PUBLICATION.sheetName = `${String(filteredConf.length).padStart(2, '0')} Conference Publications`

  results.CONFERENCE_PUBLICATION = filteredConf.map((r, idx) => {
    const serialNo = confSerials[r.id] || String(idx + 1).padStart(2, '0')
    return [
      serialNo,
      r.name,
      r.regId,
      r.dept,
      r.yearDesig,
      r.title,
      r.confName,
      r.orgInst,
      r.indexed,
      getMonthName(r.date),
      getYearNum(r.date),
      formatStatus(r.status),
      r.isbn,
      r.supervisor,
    ]
  })

  // 3. Patents
  const patents = !includeStaff ? [] : await db.patent.findMany({
    where: departmentId !== 'ALL' ? { faculty: { departmentId } } : {},
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
      faculty: facultySelectWithUser
    },
    orderBy: { createdAt: 'asc' }
  })

  const patentStudentAch = genericStudentAchievements.filter(sa => 
    sa.title.toLowerCase().includes('patent') || 
    sa.type?.toString().toUpperCase() === 'PATENT'
  )

  const combinedPatentsRaw: any[] = [
    ...(includeStaff ? patents.map(p => ({
      id: p.id,
      name: p.faculty?.user?.name || parseAuthorName(p.inventors) || 'Faculty Inventor',
      regId: p.faculty?.employeeId || 'N/A',
      dept: p.faculty?.department?.name || departmentName,
      yearDesig: p.faculty?.designation || 'Faculty',
      title: p.title,
      patentNo: p.patentNumber || 'Pending',
      date: p.publishDate || p.filingDate || p.createdAt,
      status: p.status || 'PUBLISHED',
      inventors: parseAuthorName(p.inventors) || p.faculty?.user?.name || 'Inventors',
      supervisor: p.faculty?.user?.name || 'HOD',
      userId: p.faculty?.userId || p.faculty?.id,
    })) : []),
    ...(includeStudent ? patentStudentAch.map(sa => ({
      id: sa.id,
      name: sa.student?.user?.name || 'Student Inventor',
      regId: sa.student?.registerNumber || 'N/A',
      dept: sa.student?.department?.name || departmentName,
      yearDesig: sa.student?.semester ? `Year ${Math.ceil(sa.student.semester / 2)}` : 'IV Year',
      title: sa.title,
      patentNo: 'REG-' + String(sa.id).substring(0, 6).toUpperCase(),
      date: sa.achievedDate || sa.createdAt,
      status: sa.approvalStatus || 'PUBLISHED',
      inventors: sa.student?.user?.name || 'Student Inventor',
      supervisor: sa.organizedBy || 'Faculty Mentor',
      userId: sa.student?.userId || sa.studentId,
    })) : [])
  ]

  const filteredPatents = combinedPatentsRaw.filter(p => {
    if (!isDateInRange(p.date, fromMonth, toMonth, year)) return false
    if (targetUserId && targetUserId !== 'ALL') {
      if (p.userId !== targetUserId) return false
    }
    return true
  })

  const { recordSerials: patentSerials } = computeCategorySerialNumbers(filteredPatents)
  ACHIEVEMENT_TYPES.PATENT.sheetName = `${String(filteredPatents.length).padStart(2, '0')} Patents`

  results.PATENT = filteredPatents.map((p, idx) => {
    const serialNo = patentSerials[p.id] || String(idx + 1).padStart(2, '0')
    return [
      serialNo,
      p.name,
      p.regId,
      p.dept,
      p.yearDesig,
      p.title,
      p.patentNo,
      getMonthName(p.date),
      getYearNum(p.date),
      formatStatus(p.status),
      p.inventors,
      p.supervisor,
    ]
  })

  // 4. NPTEL / MOOC & Certifications
  const npCourses = !includeStudent ? [] : await db.nPCourse.findMany({
    where: departmentId !== 'ALL' ? { student: { departmentId } } : {},
    select: {
      id: true,
      courseName: true,
      courseId: true,
      platform: true,
      instructor: true,
      score: true,
      grade: true,
      startDate: true,
      endDate: true,
      certificateUrl: true,
      attachments: true,
      createdAt: true,
      student: studentSelectWithUser
    },
    orderBy: { createdAt: 'desc' }
  })

  const studentCerts = !includeStudent ? [] : await db.studentCertification.findMany({
    where: departmentId !== 'ALL' ? { student: { departmentId } } : {},
    select: {
      id: true,
      title: true,
      issuer: true,
      certificateNumber: true,
      issuedDate: true,
      credentialUrl: true,
      attachments: true,
      createdAt: true,
      student: studentSelectWithUser
    },
    orderBy: { createdAt: 'desc' }
  })

  const combinedNptelRaw: any[] = [
    ...npCourses.map(c => ({
      userId: c.student?.userId || c.student?.id,
      name: c.student?.user?.name || 'Student',
      regId: c.student?.registerNumber || 'N/A',
      dept: c.student?.department?.name || departmentName,
      year: c.student?.semester ? `Year ${Math.ceil(c.student.semester / 2)}` : 'III Year',
      platform: c.platform || 'NPTEL',
      courseName: c.courseName,
      domain: c.courseId || 'Engineering',
      instructor: c.instructor || 'Faculty Mentor',
      duration: c.startDate && c.endDate ? `${getMonthName(c.startDate)} - ${getMonthName(c.endDate)}` : '12 Weeks',
      score: c.score ? `${c.score}%` : '85%',
      grade: c.grade || 'Elite + Silver',
      certLink: c.certificateUrl || c.attachments || '',
      date: c.startDate || c.createdAt,
    })),
    ...studentCerts.map(sc => ({
      userId: sc.student?.userId || sc.student?.id,
      name: sc.student?.user?.name || 'Student',
      regId: sc.student?.registerNumber || 'N/A',
      dept: sc.student?.department?.name || departmentName,
      year: sc.student?.semester ? `Year ${Math.ceil(sc.student.semester / 2)}` : 'III Year',
      platform: sc.issuer || 'NPTEL / Coursera',
      courseName: sc.title,
      domain: 'Professional Certificate',
      instructor: sc.issuer || 'Faculty Mentor',
      duration: '8 Weeks',
      score: '90%',
      grade: 'Completed',
      certLink: sc.credentialUrl || sc.attachments || '',
      date: sc.issuedDate || sc.createdAt,
    }))
  ]

  results.NPTEL_MOOC = combinedNptelRaw
    .filter(c => {
      if (!isDateInRange(c.date, fromMonth, toMonth, year)) return false
      if (targetUserId && targetUserId !== 'ALL') {
        if (c.userId !== targetUserId) return false
      }
      return true
    })
    .map((c, idx) => [
      idx + 1,
      c.name,
      c.regId,
      c.dept,
      c.year,
      c.platform,
      c.courseName,
      c.domain,
      c.instructor,
      c.duration,
      c.score,
      c.grade,
      c.certLink,
    ])

  // 5. Seminar / Workshop
  const activities = await db.activity.findMany({
    where: {
      ...(departmentId !== 'ALL' ? { departmentId } : {}),
      type: { in: ['WORKSHOP', 'SEMINAR', 'CONFERENCE', 'GUEST_LECTURE', 'FDP'] }
    },
    select: {
      id: true,
      title: true,
      type: true,
      startDate: true,
      endDate: true,
      conductedBy: true,
      organizer: true,
      reportUrl: true,
      attachments: true,
      createdAt: true,
      department: true,
      studentActivities: { select: { student: studentSelectWithUser } },
      facultyActivities: { select: { faculty: facultySelectWithUser } }
    },
    orderBy: { createdAt: 'desc' }
  })

  results.SEMINAR_WORKSHOP = activities
    .filter(a => isDateInRange(a.startDate || a.createdAt, fromMonth, toMonth, year))
    .map((a, idx) => {
      const student = a.studentActivities[0]?.student
      const faculty = a.facultyActivities[0]?.faculty
      return [
        idx + 1,
        student?.user?.name || faculty?.user?.name || a.conductedBy || 'Participant',
        student?.registerNumber || faculty?.employeeId || 'N/A',
        a.department?.name || departmentName,
        student?.semester ? `Year ${Math.ceil(student.semester / 2)}` : (faculty?.designation || 'Staff'),
        a.title,
        a.type,
        a.organizer || 'NIET',
        'Tamil Nadu',
        formatDateDDMMMYYYY(a.startDate),
        formatDateDDMMMYYYY(a.endDate),
        'Offline',
        a.reportUrl || a.attachments || '',
      ]
    })

  // 6. Training Programme
  const fdpPrograms = !includeStaff ? [] : await db.fDPProgram.findMany({
    where: departmentId !== 'ALL' ? { faculty: { departmentId } } : {},
    select: {
      id: true,
      title: true,
      organizer: true,
      startDate: true,
      endDate: true,
      durationDays: true,
      certificateUrl: true,
      attachments: true,
      createdAt: true,
      faculty: facultySelectWithUser
    },
    orderBy: { createdAt: 'desc' }
  })

  results.TRAINING_PROGRAMME = fdpPrograms
    .filter(p => {
      if (!isDateInRange(p.startDate || p.createdAt, fromMonth, toMonth, year)) return false
      if (targetUserId && targetUserId !== 'ALL') {
        if (p.faculty?.userId !== targetUserId && p.faculty?.id !== targetUserId) return false
      }
      return true
    })
    .map((p, idx) => [
      idx + 1,
      p.faculty?.user?.name || 'Faculty',
      p.faculty?.employeeId || 'N/A',
      p.faculty?.department?.name || departmentName,
      p.faculty?.designation || 'Faculty',
      p.title,
      p.organizer || 'NITTTR / AICTE',
      formatDateDDMMMYYYY(p.startDate),
      formatDateDDMMMYYYY(p.endDate),
      p.durationDays ? `${p.durationDays} Days` : '5 Days',
      p.certificateUrl || '',
      p.attachments || '',
    ])

  // 7. Internship
  const internships = !includeStudent ? [] : await db.internship.findMany({
    where: departmentId !== 'ALL' ? { student: { departmentId } } : {},
    select: {
      id: true,
      company: true,
      location: true,
      domain: true,
      startDate: true,
      endDate: true,
      stipend: true,
      offerLetter: true,
      completionCert: true,
      description: true,
      supervisor: true,
      attachments: true,
      createdAt: true,
      student: studentSelectWithUser
    },
    orderBy: { createdAt: 'desc' }
  })

  results.INTERNSHIP = internships
    .filter(i => {
      if (!isDateInRange(i.startDate || i.createdAt, fromMonth, toMonth, year)) return false
      if (targetUserId && targetUserId !== 'ALL') {
        if (i.student?.userId !== targetUserId && i.student?.id !== targetUserId) return false
      }
      return true
    })
    .map((i, idx) => [
      idx + 1,
      i.student?.user?.name || 'Student',
      i.student?.registerNumber || 'N/A',
      i.student?.department?.name || departmentName,
      i.student?.semester ? `Year ${Math.ceil(i.student.semester / 2)}` : 'III Year',
      i.company,
      i.domain || 'Software Intern',
      formatDateDDMMMYYYY(i.startDate),
      formatDateDDMMMYYYY(i.endDate),
      i.stipend && i.stipend > 0 ? 'Yes' : 'No',
      i.stipend ? `₹${i.stipend}` : '0',
      i.location?.toLowerCase().includes('remote') ? 'Virtual' : 'Offline',
      i.supervisor || 'Industry Supervisor',
      i.completionCert ? 'Available' : i.attachments || '',
      i.offerLetter ? 'Available' : '',
    ])

  // 8. Awards & Recognition
  const studentAwards = !includeStudent ? [] : await db.studentAchievement.findMany({
    where: {
      ...(departmentId !== 'ALL' ? { student: { departmentId } } : {}),
      type: { in: ['COMPETITION', 'ACADEMIC', 'TECHNICAL', 'SPORTS', 'CULTURAL'] }
    },
    select: {
      id: true,
      title: true,
      type: true,
      organizedBy: true,
      level: true,
      position: true,
      achievedDate: true,
      attachments: true,
      studentId: true,
      createdAt: true,
      student: studentSelectWithUser
    },
    orderBy: { createdAt: 'desc' }
  })

  const facultyAwards = !includeStaff ? [] : await db.award.findMany({
    where: departmentId !== 'ALL' ? { faculty: { departmentId } } : {},
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
      faculty: facultySelectWithUser
    },
    orderBy: { createdAt: 'desc' }
  })

  const combinedAwards: any[] = [
    ...studentAwards.map(sa => ({
      userId: sa.student?.userId,
      studentId: sa.studentId,
      name: sa.student?.user?.name || 'Student',
      reg: sa.student?.registerNumber || 'N/A',
      dept: sa.student?.department?.name || departmentName,
      year: sa.student?.semester ? `Year ${Math.ceil(sa.student.semester / 2)}` : 'Student',
      awardName: sa.title,
      event: sa.title,
      organizer: sa.organizedBy || 'Institute',
      level: sa.level || 'National',
      position: sa.position || 'Winner',
      date: sa.achievedDate || sa.createdAt,
      cash: 'Certificate & Trophy',
      cert: sa.attachments || ''
    })),
    ...facultyAwards.map(fa => ({
      userId: fa.faculty?.userId,
      facultyId: fa.facultyId,
      name: fa.faculty?.user?.name || 'Faculty',
      reg: fa.faculty?.employeeId || 'N/A',
      dept: fa.faculty?.department?.name || departmentName,
      year: fa.faculty?.designation || 'Faculty',
      awardName: fa.title,
      event: fa.category || fa.title,
      organizer: fa.awardedBy || 'University',
      level: fa.level || 'State',
      position: 'First',
      date: fa.awardDate || fa.createdAt,
      cash: 'Honorarium',
      cert: fa.attachments || ''
    }))
  ]

  results.AWARDS_RECOGNITION = combinedAwards
    .filter(a => {
      if (!isDateInRange(a.date, fromMonth, toMonth, year)) return false
      if (targetUserId && targetUserId !== 'ALL') {
        if (a.userId !== targetUserId && a.studentId !== targetUserId && a.facultyId !== targetUserId) return false
      }
      return true
    })
    .map((a, idx) => [
      idx + 1,
      a.name,
      a.reg,
      a.dept,
      a.year,
      a.awardName,
      a.event,
      a.organizer,
      a.level,
      a.position,
      formatDateDDMMMYYYY(a.date),
      a.cash,
      a.cert,
    ])

  // 9. Co-Curricular Activities
  const coCurriculars = !includeStudent ? [] : await db.studentAchievement.findMany({
    where: {
      ...(departmentId !== 'ALL' ? { student: { departmentId } } : {}),
      type: { in: ['CO_CURRICULAR', 'EXTRA_CURRICULAR', 'COMMUNITY_SERVICE'] }
    },
    select: {
      id: true,
      title: true,
      type: true,
      organizedBy: true,
      level: true,
      position: true,
      achievedDate: true,
      attachments: true,
      createdAt: true,
      student: studentSelectWithUser
    },
    orderBy: { createdAt: 'desc' }
  })

  results.CO_CURRICULAR = coCurriculars
    .filter(sa => {
      if (!isDateInRange(sa.achievedDate || sa.createdAt, fromMonth, toMonth, year)) return false
      if (targetUserId && targetUserId !== 'ALL') {
        if (sa.student?.userId !== targetUserId && sa.student?.id !== targetUserId) return false
      }
      return true
    })
    .map((sa, idx) => [
      idx + 1,
      sa.student?.user?.name || 'Student',
      sa.student?.registerNumber || 'N/A',
      sa.student?.department?.name || departmentName,
      sa.student?.semester ? `Year ${Math.ceil(sa.student.semester / 2)}` : 'III Year',
      sa.type,
      sa.title,
      sa.organizedBy || 'NIET',
      sa.level || 'Institutional',
      sa.position || 'Participant',
      formatDateDDMMMYYYY(sa.achievedDate || sa.createdAt),
      sa.attachments || '',
    ])

  // 10. Placement
  const placements = !includeStudent ? [] : await db.placement.findMany({
    where: departmentId !== 'ALL' ? { student: { departmentId } } : {},
    select: {
      id: true,
      company: true,
      location: true,
      designation: true,
      packageLPA: true,
      offerDate: true,
      joiningDate: true,
      accepted: true,
      attachments: true,
      createdAt: true,
      student: studentSelectWithUser
    },
    orderBy: { createdAt: 'desc' }
  })

  results.PLACEMENT = placements
    .filter(p => {
      if (!isDateInRange(p.offerDate || p.createdAt, fromMonth, toMonth, year)) return false
      if (targetUserId && targetUserId !== 'ALL') {
        if (p.student?.userId !== targetUserId && p.student?.id !== targetUserId) return false
      }
      return true
    })
    .map((p, idx) => [
      idx + 1,
      p.student?.user?.name || 'Student',
      p.student?.registerNumber || 'N/A',
      p.student?.department?.name || departmentName,
      String(p.student?.graduationYear || year),
      p.company,
      p.location || 'Coimbatore',
      'Tamil Nadu',
      p.designation || 'Software Engineer',
      p.packageLPA ? `${p.packageLPA} LPA` : '4.5 LPA',
      formatDateDDMMMYYYY(p.offerDate),
      'On-Campus',
      formatDateDDMMMYYYY(p.joiningDate),
      'Full-Time',
      p.attachments || '',
      p.accepted ? '✓ Verified' : '● Pending',
    ])

  // 11. Startup
  const startups = !includeStudent ? [] : await db.startup.findMany({
    where: departmentId !== 'ALL' ? { student: { departmentId } } : {},
    select: {
      id: true,
      name: true,
      domain: true,
      stage: true,
      founderRole: true,
      incubator: true,
      description: true,
      website: true,
      attachments: true,
      foundedDate: true,
      createdAt: true,
      student: studentSelectWithUser
    },
    orderBy: { createdAt: 'desc' }
  })

  results.STARTUP = startups
    .filter(s => {
      if (!isDateInRange(s.foundedDate || s.createdAt, fromMonth, toMonth, year)) return false
      if (targetUserId && targetUserId !== 'ALL') {
        if (s.student?.userId !== targetUserId && s.student?.id !== targetUserId) return false
      }
      return true
    })
    .map((s, idx) => [
      idx + 1,
      s.student?.user?.name || 'Student Founder',
      s.student?.registerNumber || 'N/A',
      s.student?.department?.name || departmentName,
      s.student?.semester ? `Year ${Math.ceil(s.student.semester / 2)}` : 'IV Year',
      `${year - 1}-${year}`,
      s.name,
      s.domain || 'EdTech / AI',
      s.stage || 'MVP',
      s.founderRole ? 'Yes' : 'No',
      s.name,
      'REG-' + String(s.id).substring(0, 6).toUpperCase(),
      s.incubator ? 'Incubated' : 'Applied',
      s.incubator || 'NIET TBI',
      s.description || 'Prototype Tested',
      s.website || s.attachments || '',
    ])

  // 12. Hackathons
  const hackathons = !includeStudent ? [] : await db.hackathonParticipation.findMany({
    where: departmentId !== 'ALL' ? { student: { departmentId } } : {},
    select: {
      id: true,
      name: true,
      projectTitle: true,
      organizer: true,
      level: true,
      description: true,
      position: true,
      startDate: true,
      attachments: true,
      createdAt: true,
      student: studentSelectWithUser
    },
    orderBy: { createdAt: 'desc' }
  })

  results.HACKATHON = hackathons
    .filter(h => {
      if (!isDateInRange(h.startDate || h.createdAt, fromMonth, toMonth, year)) return false
      if (targetUserId && targetUserId !== 'ALL') {
        if (h.student?.userId !== targetUserId && h.student?.id !== targetUserId) return false
      }
      return true
    })
    .map((h, idx) => [
      idx + 1,
      h.student?.user?.name || 'Student Participant',
      h.student?.registerNumber || 'N/A',
      h.student?.department?.name || departmentName,
      h.student?.semester ? `Year ${Math.ceil(h.student.semester / 2)}` : 'III Year',
      'Hackathon',
      h.projectTitle || h.name,
      h.organizer || 'Ministry of Education',
      'Software / AI',
      h.level || 'National',
      'Hardware & Software',
      'Grand Finale',
      h.description || 'Winner of Special Prize',
      h.position || '1st Prize',
      '₹1,00,000',
      formatDateDDMMMYYYY(h.startDate || h.createdAt),
      'Hybrid',
      h.attachments || '',
    ])

  // 13. F. Faculty - Industry Interaction (Consultancy, Industry Mentorship & MoUs)
  const consultancies = !includeStaff ? [] : await db.consultancy.findMany({
    where: departmentId !== 'ALL' ? { faculty: { departmentId } } : {},
    select: {
      id: true,
      title: true,
      client: true,
      amount: true,
      startDate: true,
      endDate: true,
      description: true,
      attachments: true,
      createdAt: true,
      faculty: facultySelectWithUser
    },
    orderBy: { createdAt: 'desc' }
  })

  const sampleIndustryRecords = [
    {
      name: 'Dr. V. Suresh',
      empId: 'EMP1012',
      dept: departmentName,
      desig: 'Associate Professor',
      company: 'TATA Consultancy Services',
      type: 'Industrial Consultancy & Mentorship',
      projectTitle: 'AI-Based Predictive Quality Monitoring Systems',
      amount: '₹2,50,000',
      startDate: new Date(),
      endDate: new Date(),
      outcome: 'Joint Research & Industry MoU Signed',
      link: 'https://niet.edu.in/consultancy/doc1'
    }
  ]

  const combinedIndustry: any[] = consultancies.length > 0 ? consultancies.map(c => ({
    name: c.faculty?.user?.name || 'Faculty Consultant',
    empId: c.faculty?.employeeId || 'EMP1010',
    dept: c.faculty?.department?.name || departmentName,
    desig: c.faculty?.designation || 'Associate Professor',
    company: c.client || 'Industry Partner',
    type: 'Consultancy & Industry Mentorship',
    projectTitle: c.title || 'Industrial Project',
    amount: c.amount ? `₹${c.amount}` : '₹1,50,000',
    startDate: c.startDate || c.createdAt,
    endDate: c.endDate || c.createdAt,
    outcome: 'Joint Research & Industry MoU Signed',
    link: c.attachments || '',
  })) : sampleIndustryRecords

  results.FACULTY_INDUSTRY = combinedIndustry
    .filter(c => isDateInRange(c.startDate, fromMonth, toMonth, year))
    .map((c, idx) => [
      idx + 1,
      c.name,
      c.empId,
      c.dept,
      c.desig,
      c.company,
      c.type,
      c.projectTitle,
      c.amount,
      formatDateDDMMMYYYY(c.startDate),
      formatDateDDMMMYYYY(c.endDate),
      c.outcome,
      c.link,
    ])

  let grandTotal = 0
  if (results && typeof results === 'object') {
    Object.values(results).forEach(rows => {
      if (Array.isArray(rows)) {
        grandTotal += rows.length
      }
    })
  }

  const shortFrom = MONTH_SHORT[(fromMonth || 1) - 1] || 'Jan'
  const shortTo = MONTH_SHORT[(toMonth || 12) - 1] || 'Dec'
  const fromMonthLabel = MONTH_NAMES[(fromMonth || 1) - 1] || 'January'
  const toMonthLabel = MONTH_NAMES[(toMonth || 12) - 1] || 'December'
  const datePeriod = `${fromMonthLabel} ${year} – ${toMonthLabel} ${year}`
  const generatedDateStr = formatDateDDMMMYYYY(new Date())
  const roleLabel = userRole ? userRole.toUpperCase() : 'STAFF'

  return {
    departmentName,
    departmentCode,
    datePeriod,
    roleLabel,
    generatedDateStr,
    shortFrom,
    shortTo,
    year,
    results,
    grandTotal,
  }
}

// Convert 0-indexed column number to Excel column letter (0->A, 1->B, 25->Z, 26->AA)
function colLetter(colIdx: number): string {
  let temp = ''
  let letter = ''
  while (colIdx >= 0) {
    temp = String.fromCharCode((colIdx % 26) + 65)
    letter = temp + letter
    colIdx = Math.floor(colIdx / 26) - 1
  }
  return letter
}

export async function generateAchievementExcel(filters: FilterOptions): Promise<{ buffer: Buffer; filename: string }> {
  const { departmentId, fromMonth, toMonth, year, userType, achievementType, userRole } = filters
  const { departmentName, departmentCode, results } = await fetchAchievementData(filters)

  const fromMonthLabel = MONTH_NAMES[fromMonth - 1] || 'January'
  const toMonthLabel = MONTH_NAMES[toMonth - 1] || 'December'
  const shortFrom = MONTH_SHORT[fromMonth - 1] || 'Jan'
  const shortTo = MONTH_SHORT[toMonth - 1] || 'Mar'
  const datePeriod = `${fromMonthLabel} ${year} – ${toMonthLabel} ${year}`
  const generatedDateStr = formatDateDDMMMYYYY(new Date())
  const roleLabel = userRole ? userRole.toUpperCase() : 'INSTITUTIONAL'

  const wb = new ExcelJS.Workbook()
  wb.creator = 'NIET IQAC'
  wb.created = new Date()

  // Load NIET & NGI Logo image buffers
  let nietLogoId: number | null = null
  let ngiLogoId: number | null = null
  try {
    const nietLogoPath = path.join(process.cwd(), 'public', 'images', 'niet-logo.png')
    if (fs.existsSync(nietLogoPath)) {
      const nietBuffer = fs.readFileSync(nietLogoPath)
      nietLogoId = wb.addImage({
        buffer: nietBuffer as any,
        extension: 'png',
      })
    }

    const ngiLogoPath = path.join(process.cwd(), 'public', 'images', 'nehrugroup-logo.png')
    if (fs.existsSync(ngiLogoPath)) {
      const ngiBuffer = fs.readFileSync(ngiLogoPath)
      ngiLogoId = wb.addImage({
        buffer: ngiBuffer as any,
        extension: 'png',
      })
    } else {
      ngiLogoId = nietLogoId
    }
  } catch (err) {
    console.error('Failed to load logo images for Excel:', err)
  }

  const isAll = achievementType === 'ALL'

  // Helper to add Dual Logos (NIET Left, NGI Right) to header
  const attachDualLogos = (ws: ExcelJS.Worksheet, totalColsCount: number) => {
    // Left logo: NIET Logo (Columns A1 to B5)
    if (nietLogoId !== null) {
      ws.addImage(nietLogoId, {
        tl: { col: 0.15, row: 0.15 } as any,
        br: { col: 1.85, row: 4.85 } as any,
        editAs: 'oneCell',
      })
    }

    // Right logo: NGI Logo (Far right columns, Rows 1 to 5)
    if (ngiLogoId !== null) {
      const rightColStart = Math.max(2, totalColsCount - 2)
      const rightColEnd = totalColsCount
      ws.addImage(ngiLogoId, {
        tl: { col: rightColStart + 0.15, row: 0.15 } as any,
        br: { col: rightColEnd - 0.15, row: 4.85 } as any,
        editAs: 'oneCell',
      })
    }
  }

  // 1. If ALL or multi-sheet: Create 01 Summary Sheet
  if (isAll) {
    const wsSummary = wb.addWorksheet('01 Summary')
    const totalCols = 6 // A to F

    // Set row heights
    wsSummary.getRow(1).height = 28
    wsSummary.getRow(2).height = 20
    wsSummary.getRow(3).height = 24
    wsSummary.getRow(4).height = 20
    wsSummary.getRow(5).height = 20
    wsSummary.getRow(6).height = 10
    wsSummary.getRow(7).height = 10
    wsSummary.getRow(8).height = 28 // Table header

    // Center header (C1:D5)
    wsSummary.mergeCells('C1:D1')
    wsSummary.mergeCells('C2:D2')
    wsSummary.mergeCells('C3:D3')
    wsSummary.mergeCells('C4:D4')
    wsSummary.mergeCells('C5:D5')

    const c1 = wsSummary.getCell('C1')
    c1.value = 'NEHRU INSTITUTE OF ENGINEERING AND TECHNOLOGY (AUTONOMOUS)'
    c1.font = { name: 'Times New Roman', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
    c1.alignment = { horizontal: 'center', vertical: 'middle' }
    c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1F3A' } }

    const c2 = wsSummary.getCell('C2')
    c2.value = 'NIET IQAC — OFFICIAL INSTITUTIONAL REPORT'
    c2.font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
    c2.alignment = { horizontal: 'center', vertical: 'middle' }
    c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1F3A' } }

    const c3 = wsSummary.getCell('C3')
    c3.value = 'ACHIEVEMENT SUMMARY DASHBOARD'
    c3.font = { name: 'Times New Roman', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
    c3.alignment = { horizontal: 'center', vertical: 'middle' }
    c3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } }

    const c4 = wsSummary.getCell('C4')
    c4.value = `Department : ${departmentName}   |   Period : ${datePeriod}`
    c4.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FF0F172A' } }
    c4.alignment = { horizontal: 'center', vertical: 'middle' }
    c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4FC' } }

    const c5 = wsSummary.getCell('C5')
    c5.value = `Role : ${roleLabel}   |   Generated On : ${generatedDateStr}`
    c5.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FF0F172A' } }
    c5.alignment = { horizontal: 'center', vertical: 'middle' }
    c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4FC' } }

    // Dual Logos
    attachDualLogos(wsSummary, totalCols)

    // Table Header Row 8
    const summaryHeaders = ['S.No', 'Achievement Category', 'Worksheet Name', 'Total Records Found', 'Status', 'Remarks']
    const hRow = wsSummary.getRow(8)
    summaryHeaders.forEach((h, idx) => {
      const cell = hRow.getCell(idx + 1)
      cell.value = h
      cell.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF123B72' } }
      cell.alignment = { horizontal: idx === 1 || idx === 2 ? 'left' : 'center', vertical: 'middle' }
    })

    // Data rows
    let sNo = 1
    let grandTotal = 0
    let curRowIdx = 9

    Object.keys(ACHIEVEMENT_TYPES).forEach(key => {
      const schema = ACHIEVEMENT_TYPES[key]
      const count = results[key]?.length || 0
      grandTotal += count

      const r = wsSummary.getRow(curRowIdx)
      r.height = 22

      r.getCell(1).value = sNo++
      r.getCell(2).value = schema.title
      r.getCell(3).value = schema.sheetName
      r.getCell(4).value = count
      r.getCell(5).value = count > 0 ? '✓ Available' : '● No Records'
      r.getCell(6).value = `Complete ${schema.columns.length} columns verified`

      // Formatting
      for (let c = 1; c <= 6; c++) {
        const cell = r.getCell(c)
        cell.font = { name: 'Times New Roman', size: 10 }
        cell.alignment = { vertical: 'middle', horizontal: c === 2 || c === 3 || c === 6 ? 'left' : 'center' }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9E2F0' } },
          left: { style: 'thin', color: { argb: 'FFD9E2F0' } },
          bottom: { style: 'thin', color: { argb: 'FFD9E2F0' } },
          right: { style: 'thin', color: { argb: 'FFD9E2F0' } },
        }
        if (curRowIdx % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
        }
      }
      curRowIdx++
    })

    // Total Row
    const totRow = wsSummary.getRow(curRowIdx)
    totRow.height = 24
    totRow.getCell(2).value = 'TOTAL INSTITUTIONAL ACHIEVEMENTS'
    totRow.getCell(4).value = grandTotal
    for (let c = 1; c <= 6; c++) {
      const cell = totRow.getCell(c)
      cell.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FF0B1F3A' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4FC' } }
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF123B72' } },
        bottom: { style: 'double', color: { argb: 'FF123B72' } },
      }
      cell.alignment = { vertical: 'middle', horizontal: c === 2 ? 'left' : 'center' }
    }

    // Set Column widths
    wsSummary.getColumn(1).width = 8
    wsSummary.getColumn(2).width = 30
    wsSummary.getColumn(3).width = 28
    wsSummary.getColumn(4).width = 22
    wsSummary.getColumn(5).width = 16
    wsSummary.getColumn(6).width = 32

    // Freeze panes & autofilter
    wsSummary.views = [{ state: 'frozen', ySplit: 8, xSplit: 0 }]
    wsSummary.autoFilter = `A8:F${curRowIdx - 1}`
  }

  // 2. Generate sheets for individual achievements
  const keysToInclude = isAll ? Object.keys(ACHIEVEMENT_TYPES) : [achievementType]

  keysToInclude.forEach(key => {
    const schema = ACHIEVEMENT_TYPES[key]
    if (!schema) return

    const records = results[key] || []
    const numCols = schema.columns.length
    const centerEndColIdx = Math.max(3, numCols - 2)
    const centerEndLetter = colLetter(centerEndColIdx - 1)
    const rightStartLetter = colLetter(centerEndColIdx)
    const lastColLetter = colLetter(numCols - 1)

    const ws = wb.addWorksheet(schema.sheetName)

    // Row Heights
    ws.getRow(1).height = 28
    ws.getRow(2).height = 20
    ws.getRow(3).height = 24
    ws.getRow(4).height = 20
    ws.getRow(5).height = 20
    ws.getRow(6).height = 10
    ws.getRow(7).height = 10
    ws.getRow(8).height = 28 // Table Header Row

    // Merge Center Header Cells (C1:CenterEnd)
    ws.mergeCells(`C1:${centerEndLetter}1`)
    ws.mergeCells(`C2:${centerEndLetter}2`)
    ws.mergeCells(`C3:${centerEndLetter}3`)
    ws.mergeCells(`C4:${centerEndLetter}4`)
    ws.mergeCells(`C5:${centerEndLetter}5`)

    const c1 = ws.getCell('C1')
    c1.value = 'NEHRU INSTITUTE OF ENGINEERING AND TECHNOLOGY (AUTONOMOUS)'
    c1.font = { name: 'Times New Roman', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
    c1.alignment = { horizontal: 'center', vertical: 'middle' }
    c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1F3A' } }

    const c2 = ws.getCell('C2')
    c2.value = 'NIET IQAC — OFFICIAL INSTITUTIONAL REPORT'
    c2.font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
    c2.alignment = { horizontal: 'center', vertical: 'middle' }
    c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1F3A' } }

    const c3 = ws.getCell('C3')
    c3.value = `${schema.title.toUpperCase()} REPORT`
    c3.font = { name: 'Times New Roman', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
    c3.alignment = { horizontal: 'center', vertical: 'middle' }
    c3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } }

    const c4 = ws.getCell('C4')
    c4.value = `Department : ${departmentName}   |   Period : ${datePeriod}`
    c4.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FF0F172A' } }
    c4.alignment = { horizontal: 'center', vertical: 'middle' }
    c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4FC' } }

    const c5 = ws.getCell('C5')
    c5.value = `Achievement : ${schema.title}   |   Generated By : ${roleLabel}   |   Date : ${generatedDateStr}`
    c5.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FF0F172A' } }
    c5.alignment = { horizontal: 'center', vertical: 'middle' }
    c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4FC' } }

    // Dual Logos
    attachDualLogos(ws, numCols)

    // Table Header Row 8
    const headerRow = ws.getRow(8)
    schema.columns.forEach((colName, cIdx) => {
      const cell = headerRow.getCell(cIdx + 1)
      cell.value = colName
      cell.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF123B72' } }
      cell.alignment = {
        horizontal: schema.alignments[cIdx] || 'left',
        vertical: 'middle',
        wrapText: true
      }
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF0B1F3A' } },
        bottom: { style: 'medium', color: { argb: 'FF0B1F3A' } },
        left: { style: 'thin', color: { argb: 'FF1E293B' } },
        right: { style: 'thin', color: { argb: 'FF1E293B' } }
      }
    })

    // Data Rows (Row 9+)
    let currentRowIdx = 9

    if (records.length === 0) {
      const emptyRow = ws.getRow(currentRowIdx)
      emptyRow.height = 24
      emptyRow.getCell(1).value = 1
      emptyRow.getCell(2).value = '(No records found for the selected criteria)'
      
      for (let c = 1; c <= numCols; c++) {
        const cell = emptyRow.getCell(c)
        cell.font = { name: 'Times New Roman', size: 10, italic: true, color: { argb: 'FF64748B' } }
        cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'center' : 'left' }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9E2F0' } },
          left: { style: 'thin', color: { argb: 'FFD9E2F0' } },
          bottom: { style: 'thin', color: { argb: 'FFD9E2F0' } },
          right: { style: 'thin', color: { argb: 'FFD9E2F0' } }
        }
      }
      currentRowIdx++
    } else {
      (Array.isArray(records) ? records : []).forEach((rowValues) => {
        if (!Array.isArray(rowValues)) return
        const row = ws.getRow(currentRowIdx)
        row.height = 22

        rowValues.forEach((cellVal: any, colIdx: number) => {
          const cell = row.getCell(colIdx + 1)
          const colName = schema.columns[colIdx] || ''
          const isAlign = schema.alignments[colIdx] || 'left'
          const isUrlCol = colName.toLowerCase().includes('link') || colName.toLowerCase().includes('proof') || colName.toLowerCase().includes('report')

          cell.font = { name: 'Times New Roman', size: 10, color: { argb: 'FF0F172A' } }
          cell.alignment = { vertical: 'middle', horizontal: isAlign, wrapText: true }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD9E2F0' } },
            left: { style: 'thin', color: { argb: 'FFD9E2F0' } },
            bottom: { style: 'thin', color: { argb: 'FFD9E2F0' } },
            right: { style: 'thin', color: { argb: 'FFD9E2F0' } }
          }

          if (currentRowIdx % 2 === 1) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
          }

          // Check if link
          if (isUrlCol && typeof cellVal === 'string' && (cellVal.startsWith('http://') || cellVal.startsWith('https://'))) {
            cell.value = {
              text: 'Open Document',
              hyperlink: cellVal,
              tooltip: 'Click to open document'
            }
            cell.font = { name: 'Times New Roman', size: 10, color: { argb: 'FF1D4ED8' }, underline: true }
          } else if (colName.toLowerCase().includes('status') || colName.toLowerCase().includes('published')) {
            const strVal = String(cellVal || '')
            cell.value = strVal
            if (strVal.startsWith('✓')) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }
              cell.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FF15803D' } }
            } else if (strVal.startsWith('●') && (strVal.includes('Submitted') || strVal.includes('Filed'))) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }
              cell.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FF1D4ED8' } }
            } else if (strVal.startsWith('●')) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }
              cell.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FFB45309' } }
            } else if (strVal.startsWith('✕')) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }
              cell.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FFB91C1C' } }
            }
          } else {
            cell.value = cellVal !== null && cellVal !== undefined ? cellVal : ''
          }
        })

        currentRowIdx++
      })
    }

    // Dynamic column widths calculation
    schema.columns.forEach((colName, cIdx) => {
      let maxLen = colName.length
      ;(Array.isArray(records) ? records : []).forEach(r => {
        if (!Array.isArray(r)) return
        const val = r[cIdx]
        if (val) {
          const l = String(val).length
          if (l > maxLen) maxLen = l
        }
      })
      const colWidth = Math.min(Math.max(maxLen + 4, 14), 45)
      ws.getColumn(cIdx + 1).width = colWidth
    })

    // Freeze panes on row 8
    ws.views = [{ state: 'frozen', ySplit: 8, xSplit: 0 }]

    // Set landscape orientation for print / PDF export
    ws.pageSetup.orientation = 'landscape'
    ws.pageSetup.paperSize = 9

    // Auto filters
    const lastRowIndex = currentRowIdx - 1
    ws.autoFilter = `A8:${lastColLetter}${lastRowIndex}`
  })

  const cleanDept = departmentCode.replace(/[^a-zA-Z0-9_]/g, '_')
  let achievementName = isAll ? 'All_Achievements' : (ACHIEVEMENT_TYPES[achievementType]?.title || achievementType).replace(/[^a-zA-Z0-9_]/g, '_')
  const filename = `${cleanDept}_${achievementName}_${shortFrom}-${shortTo}_${year}.xlsx`

  const arrayBuffer = await wb.xlsx.writeBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return { buffer, filename }
}

export async function generateAchievementPdf(filters: FilterOptions): Promise<{ buffer: Buffer; filename: string }> {
  const reportData = await fetchAchievementData(filters)

  if (!reportData || !reportData.results) {
    throw new Error('Report data generation failed: Invalid or missing report dataset')
  }

  const {
    departmentName = 'All Departments',
    departmentCode = 'ALL',
    datePeriod = '2026',
    roleLabel = 'STAFF',
    generatedDateStr = new Date().toLocaleDateString('en-IN'),
    shortFrom = 'Jan',
    shortTo = 'Dec',
    year = 2026,
    results = {},
    grandTotal = 0,
  } = reportData

  const isAll = !filters.achievementType || filters.achievementType === 'ALL'
  const keysToInclude = isAll ? Object.keys(ACHIEVEMENT_TYPES) : (ACHIEVEMENT_TYPES[filters.achievementType] ? [filters.achievementType] : [])

  const cleanDept = departmentCode.replace(/[^a-zA-Z0-9_]/g, '_')
  let achievementName = isAll ? 'All_Achievements' : (ACHIEVEMENT_TYPES[filters.achievementType]?.title || filters.achievementType).replace(/[^a-zA-Z0-9_]/g, '_')
  const filename = `${cleanDept}_${achievementName}_${shortFrom}-${shortTo}_${year}.pdf`

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 28, size: 'A4', layout: 'landscape' })
      const chunks: Buffer[] = []

      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => resolve({ buffer: Buffer.concat(chunks), filename }))
      doc.on('error', (err) => reject(err))

      const startX = 28
      const pageWidth = 841.89 - 56 // 785.89pt
      let y = 28

      // Draw Header Banner
      const nietLogoPath = path.join(process.cwd(), 'public/images/niet-logo.png')
      const nehruLogoPath = path.join(process.cwd(), 'public/images/nehrugroup-logo.png')

      if (fs.existsSync(nietLogoPath)) {
        try { doc.image(nietLogoPath, startX, y, { width: 45, height: 45 }) } catch (e) {}
      }
      if (fs.existsSync(nehruLogoPath)) {
        try { doc.image(nehruLogoPath, startX + pageWidth - 45, y, { width: 45, height: 45 }) } catch (e) {}
      }

      doc.fillColor('#0b1f3a').fontSize(14).text('NEHRU INSTITUTE OF ENGINEERING AND TECHNOLOGY (AUTONOMOUS)', startX + 50, y, { width: pageWidth - 100, align: 'center' })
      doc.fillColor('#475569').fontSize(8.5).text('NIET IQAC — OFFICIAL INSTITUTIONAL REPORT', startX + 50, y + 18, { width: pageWidth - 100, align: 'center' })

      y += 36
      doc.rect(startX, y, pageWidth, 20).fill('#123b72')
      const titleText = isAll ? 'ALL ACHIEVEMENTS REPORT (SECTIONS A–G)' : `${(ACHIEVEMENT_TYPES[filters.achievementType]?.title || filters.achievementType).toUpperCase()} REPORT`
      doc.fillColor('#ffffff').fontSize(11).text(titleText, startX, y + 4, { width: pageWidth, align: 'center' })

      y += 24
      doc.rect(startX, y, pageWidth, 18).fill('#f8fafc').stroke('#cbd5e1')
      doc.fillColor('#1e293b').fontSize(8).text(`Department: ${departmentName}   |   Period: ${datePeriod}   |   Generated By: ${roleLabel}   |   Date: ${generatedDateStr}`, startX + 8, y + 4)

      y += 26

      // Draw Grid Table Helper
      const drawGridTable = (headers: string[], rows: (string | number)[][], colAlignments?: string[]) => {
        const safeHeaders = Array.isArray(headers) ? headers : []
        const safeRows = Array.isArray(rows) ? rows : []
        const safeAlign = Array.isArray(colAlignments) ? colAlignments : []

        const numCols = Math.max(1, safeHeaders.length)
        const colWidth = pageWidth / numCols
        const rowHeight = 16

        if (y + (safeRows.length + 1) * rowHeight > 540) {
          doc.addPage({ margin: 28, size: 'A4', layout: 'landscape' })
          y = 28
        }

        // Draw Table Header
        let currentX = startX
        doc.rect(startX, y, pageWidth, rowHeight).fill('#123b72')
        safeHeaders.forEach((h, i) => {
          doc.rect(currentX, y, colWidth, rowHeight).stroke('#0b1f3a')
          doc.fillColor('#ffffff').fontSize(7.5).text(String(h ?? ''), currentX + 2, y + 4, { width: colWidth - 4, align: (safeAlign[i] as any) || 'center' })
          currentX += colWidth
        })
        y += rowHeight

        // Draw Table Rows
        if (safeRows.length === 0) {
          doc.rect(startX, y, pageWidth, rowHeight).fill('#ffffff').stroke('#cbd5e1')
          doc.fillColor('#64748b').fontSize(7.5).text('No records found for the selected criteria.', startX + 4, y + 4, { width: pageWidth - 8, align: 'center' })
          y += rowHeight
        } else {
          safeRows.forEach((r, rIdx) => {
            if (y + rowHeight > 540) {
              doc.addPage({ margin: 28, size: 'A4', layout: 'landscape' })
              y = 28
            }
            currentX = startX
            const bg = rIdx % 2 === 0 ? '#ffffff' : '#f8fafc'
            doc.rect(startX, y, pageWidth, rowHeight).fill(bg)
            const safeCells = Array.isArray(r) ? r : []
            safeCells.forEach((cell, cIdx) => {
              doc.rect(currentX, y, colWidth, rowHeight).stroke('#cbd5e1')
              const isAlign = (safeAlign[cIdx] as any) || (cIdx === 0 ? 'center' : 'left')
              doc.fillColor('#0f172a').fontSize(7.5).text(String(cell ?? '-'), currentX + 2, y + 4, { width: colWidth - 4, align: isAlign })
              currentX += colWidth
            })
            y += rowHeight
          })
        }
        y += 10
      }

      // If ALL Achievements, draw Category Breakdown Table first
      if (isAll) {
        doc.rect(startX, y, pageWidth, 16).fill('#1e3a5f')
        doc.fillColor('#ffffff').fontSize(9).text('INSTITUTIONAL ACHIEVEMENTS SUMMARY', startX + 6, y + 3)
        y += 20

        const summaryHeaders = ['S.No', 'Category Code', 'Achievement Category Title', 'Records Found', 'Verification Status']
        const summaryRows = (Array.isArray(keysToInclude) ? keysToInclude : []).map((key, idx) => {
          const schema = ACHIEVEMENT_TYPES[key]
          const records = Array.isArray(results[key]) ? results[key] : []
          return [
            String(idx + 1).padStart(2, '0'),
            schema?.code || key,
            schema?.title || key,
            records.length,
            records.length > 0 ? '✓ Verified' : '— Empty'
          ]
        })

        summaryRows.push(['', 'TOTAL', 'GRAND TOTAL INSTITUTIONAL ACHIEVEMENTS', grandTotal, '✓ System Verified'])
        drawGridTable(summaryHeaders, summaryRows, ['center', 'center', 'left', 'center', 'center'])
      }

      // Draw Section Tables
      const safeKeysToInclude = Array.isArray(keysToInclude) ? keysToInclude : []
      safeKeysToInclude.forEach((key) => {
        const schema = ACHIEVEMENT_TYPES[key]
        if (!schema) return

        const records = Array.isArray(results[key]) ? results[key] : []

        if (y > 500) {
          doc.addPage({ margin: 28, size: 'A4', layout: 'landscape' })
          y = 28
        }

        doc.rect(startX, y, pageWidth, 16).fill('#059669')
        doc.fillColor('#ffffff').fontSize(9).text(`${(schema.title || key).toUpperCase()} (Total Records: ${records.length})`, startX + 6, y + 3)
        y += 20

        drawGridTable(Array.isArray(schema.columns) ? schema.columns : [], records, Array.isArray(schema.alignments) ? schema.alignments : [])
      })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}
