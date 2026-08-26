// ============ NIET IQAC AUTOMATIC MONTHLY REPORTING & PERIOD LOCK SERVICE ============

export interface ReportingPeriod {
  year: number
  month: number
  monthLabel: string
  status: 'OPEN' | 'CLOSED'
  isCurrentMonth: boolean
  isPreviousMonth: boolean
  isReopenedByAdmin?: boolean
}

export interface AuditLogEntry {
  id: string
  action: 'REOPEN_PERIOD' | 'CLOSE_PERIOD'
  user: string
  role: string
  date: string
  time: string
  reportingMonth: string
  reason: string
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Persistent storage keys
const REOPENED_PERIODS_KEY = 'niet_iqac_reopened_periods'
const AUDIT_LOGS_KEY = 'niet_iqac_audit_logs'

/**
 * Gets current server date information
 */
export function getCurrentServerDate(): { year: number; month: number; day: number; monthName: string } {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // 1-indexed (1 = Jan, 8 = Aug)
    day: now.getDate(),
    monthName: MONTH_NAMES[now.getMonth()],
  }
}

/**
 * Gets previous month information based on current server date
 */
export function getPreviousServerMonth(): { year: number; month: number; monthName: string; label: string } {
  const { year, month } = getCurrentServerDate()
  let prevMonth = month - 1
  let prevYear = year
  if (prevMonth === 0) {
    prevMonth = 12
    prevYear = year - 1
  }
  const monthName = MONTH_NAMES[prevMonth - 1]
  return {
    year: prevYear,
    month: prevMonth,
    monthName,
    label: `${monthName} ${prevYear}`,
  }
}

/**
 * Retrieves list of period keys reopened by Admin (e.g. ["2026-07"])
 */
export function getReopenedPeriods(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(REOPENED_PERIODS_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    return []
  }
}

/**
 * Saves reopened period keys to storage
 */
export function saveReopenedPeriods(periods: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(REOPENED_PERIODS_KEY, JSON.stringify(periods))
  } catch (e) {
    console.error('Failed to save reopened periods', e)
  }
}

/**
 * Retrieves audit log entries
 */
export function getAuditLogs(): AuditLogEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(AUDIT_LOGS_KEY)
    return data ? JSON.parse(data) : [
      {
        id: 'audit-1',
        action: 'CLOSE_PERIOD',
        user: 'System Automated Scheduler',
        role: 'SYSTEM',
        date: new Date().toLocaleDateString('en-IN'),
        time: '00:00:01',
        reportingMonth: getPreviousServerMonth().label,
        reason: 'Automatic month transition closure'
      }
    ]
  } catch (e) {
    return []
  }
}

/**
 * Adds a new entry to the audit log
 */
export function logAuditAction(entry: Omit<AuditLogEntry, 'id'>) {
  const logs = getAuditLogs()
  const newLog: AuditLogEntry = {
    ...entry,
    id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
  }
  const updatedLogs = [newLog, ...logs]
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updatedLogs))
    } catch (e) {
      console.error('Failed to log audit action', e)
    }
  }
  return updatedLogs
}

/**
 * Checks if a specific month & year reporting period is CLOSED.
 * Current month is OPEN by default.
 * Previous and older months are CLOSED by default, unless explicitly reopened by Admin.
 */
export function isPeriodClosed(year: number, month: number): boolean {
  const current = getCurrentServerDate()
  
  // Current month is OPEN
  if (year === current.year && month === current.month) {
    return false
  }

  // Check if Admin has explicitly reopened this period
  const periodKey = `${year}-${String(month).padStart(2, '0')}`
  const reopened = getReopenedPeriods()
  if (reopened.includes(periodKey)) {
    return false
  }

  // Future months are OPEN for draft entries, past months are CLOSED
  if (year > current.year || (year === current.year && month > current.month)) {
    return false
  }

  return true
}

/**
 * Checks if an achievement record date falls within a closed reporting period.
 */
export function checkAchievementDateLock(dateInput: string | Date | undefined | null): { 
  locked: boolean 
  error?: string 
  monthLabel?: string 
} {
  if (!dateInput) return { locked: false }
  
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return { locked: false }
  
  const recordYear = d.getFullYear()
  const recordMonth = d.getMonth() + 1
  const monthName = MONTH_NAMES[d.getMonth()]
  const monthLabel = `${monthName} ${recordYear}`
  
  const locked = isPeriodClosed(recordYear, recordMonth)
  
  if (locked) {
    return {
      locked: true,
      monthLabel,
      error: `This reporting period (${monthLabel}) is closed. The achievement can no longer be modified.`
    }
  }
  
  return { locked: false, monthLabel }
}

/**
 * Admin action to reopen a closed reporting period
 */
export function reopenReportingPeriod(year: number, month: number, adminUser: { name: string; email: string; role: string }, reason: string) {
  const periodKey = `${year}-${String(month).padStart(2, '0')}`
  const reopened = getReopenedPeriods()
  if (!reopened.includes(periodKey)) {
    saveReopenedPeriods([...reopened, periodKey])
  }

  const monthName = MONTH_NAMES[month - 1]
  const monthLabel = `${monthName} ${year}`
  const now = new Date()

  logAuditAction({
    action: 'REOPEN_PERIOD',
    user: adminUser.name || adminUser.email || 'Admin',
    role: adminUser.role || 'ADMIN',
    date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    reportingMonth: monthLabel,
    reason: reason || 'Correction requested by IQAC'
  })
}

/**
 * Admin action to re-close a reopened reporting period
 */
export function closeReportingPeriod(year: number, month: number, adminUser: { name: string; email: string; role: string }, reason?: string) {
  const periodKey = `${year}-${String(month).padStart(2, '0')}`
  const reopened = getReopenedPeriods()
  saveReopenedPeriods(reopened.filter(k => k !== periodKey))

  const monthName = MONTH_NAMES[month - 1]
  const monthLabel = `${monthName} ${year}`
  const now = new Date()

  logAuditAction({
    action: 'CLOSE_PERIOD',
    user: adminUser.name || adminUser.email || 'Admin',
    role: adminUser.role || 'ADMIN',
    date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    reportingMonth: monthLabel,
    reason: reason || 'Reporting period closed'
  })
}

/**
 * Returns list of recent monthly reporting periods with lock statuses
 */
export function getMonthlyReportingHistory(limitCount: number = 6): ReportingPeriod[] {
  const current = getCurrentServerDate()
  const reopened = getReopenedPeriods()
  const history: ReportingPeriod[] = []

  let curY = current.year
  let curM = current.month

  for (let i = 0; i < limitCount; i++) {
    const monthName = MONTH_NAMES[curM - 1]
    const periodKey = `${curY}-${String(curM).padStart(2, '0')}`
    const isCurrentMonth = (i === 0)
    const isPreviousMonth = (i === 1)
    const isReopened = reopened.includes(periodKey)
    const status = (isCurrentMonth || isReopened) ? 'OPEN' : 'CLOSED'

    history.push({
      year: curY,
      month: curM,
      monthLabel: `${monthName} ${curY}`,
      status,
      isCurrentMonth,
      isPreviousMonth,
      isReopenedByAdmin: isReopened
    })

    curM--
    if (curM === 0) {
      curM = 12
      curY--
    }
  }

  return history
}
