import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { seedDatabase } from '@/lib/seed'
import * as fs from 'fs'
import * as path from 'path'

// GET /api/admin/database - Return comprehensive database information
export async function GET() {
  try {
    const startTime = Date.now()

    // Get counts for all major tables in parallel
    const [
      departmentCount,
      facultyCount,
      studentCount,
      activityCount,
      researchCount,
      userCount,
      notificationCount,
      approvalCount,
      auditLogCount,
      feedbackCount,
      documentCount,
      settingCount,
      batchCount,
      institutionCount,
      // Faculty-related tables
      certificationCount,
      awardCount,
      patentCount,
      bookCount,
      projectCount,
      consultancyCount,
      fdpProgramCount,
      // Student-related tables
      studentAchievementCount,
      studentCertificationCount,
      internshipCount,
      placementCount,
      npCourseCount,
      hackathonParticipationCount,
      startupCount,
      // Activity relations
      facultyActivityCount,
      studentActivityCount,
      researchPublicationCount,
    ] = await Promise.all([
      db.department.count(),
      db.faculty.count(),
      db.student.count(),
      db.activity.count(),
      db.research.count(),
      db.user.count(),
      db.notification.count(),
      db.approval.count(),
      db.auditLog.count(),
      db.feedback.count(),
      db.document.count(),
      db.setting.count(),
      db.batch.count(),
      db.institution.count(),
      // Faculty-related
      db.certification.count(),
      db.award.count(),
      db.patent.count(),
      db.book.count(),
      db.project.count(),
      db.consultancy.count(),
      db.fDPProgram.count(),
      // Student-related
      db.studentAchievement.count(),
      db.studentCertification.count(),
      db.internship.count(),
      db.placement.count(),
      db.nPCourse.count(),
      db.hackathonParticipation.count(),
      db.startup.count(),
      // Relations
      db.facultyActivity.count(),
      db.studentActivity.count(),
      db.researchPublication.count(),
    ])

    // Calculate total records
    const totalRecords =
      departmentCount +
      facultyCount +
      studentCount +
      activityCount +
      researchCount +
      userCount +
      notificationCount +
      approvalCount +
      auditLogCount +
      feedbackCount +
      documentCount +
      settingCount +
      batchCount +
      institutionCount +
      certificationCount +
      awardCount +
      patentCount +
      bookCount +
      projectCount +
      consultancyCount +
      fdpProgramCount +
      studentAchievementCount +
      studentCertificationCount +
      internshipCount +
      placementCount +
      npCourseCount +
      hackathonParticipationCount +
      startupCount +
      facultyActivityCount +
      studentActivityCount +
      researchPublicationCount

    // Get database file size (SQLite)
    let dbSizeBytes = 0
    let dbSizeFormatted = 'Unknown'
    try {
      const dbPath = path.join(process.cwd(), 'db', 'custom.db')
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath)
        dbSizeBytes = stats.size
        dbSizeFormatted = formatFileSize(stats.size)
      }
    } catch {
      // Ignore file system errors
    }

    // Get recent activity timestamps
    const [latestUser, latestActivity, latestResearch, latestAuditLog] = await Promise.all([
      db.user.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true, name: true } }),
      db.activity.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true, title: true } }),
      db.research.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true, title: true } }),
      db.auditLog.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true, action: true } }),
    ])

    // Get users by role breakdown
    const [adminCount, hodCount, staffCount, studentRoleCount] = await Promise.all([
      db.user.count({ where: { role: 'ADMIN' } }),
      db.user.count({ where: { role: 'HOD' } }),
      db.user.count({ where: { role: 'STAFF' } }),
      db.user.count({ where: { role: 'STUDENT' } }),
    ])

    // Get active vs inactive users
    const [activeUsers, inactiveUsers] = await Promise.all([
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { isActive: false } }),
    ])

    // Get pending approvals count
    const pendingApprovals = await db.approval.count({
      where: { status: 'PENDING' },
    })

    // Get unread notifications count
    const unreadNotifications = await db.notification.count({
      where: { isRead: false },
    })

    // Determine database health status
    const queryTime = Date.now() - startTime
    const healthStatus = determineHealthStatus(
      queryTime,
      dbSizeBytes,
      totalRecords,
      activeUsers,
      inactiveUsers
    )

    // Build table info array
    const tables = [
      { name: 'Department', model: 'Department', count: departmentCount, category: 'Core' },
      { name: 'User', model: 'User', count: userCount, category: 'Core' },
      { name: 'Faculty', model: 'Faculty', count: facultyCount, category: 'Core' },
      { name: 'Student', model: 'Student', count: studentCount, category: 'Core' },
      { name: 'Batch', model: 'Batch', count: batchCount, category: 'Core' },
      { name: 'Institution', model: 'Institution', count: institutionCount, category: 'Core' },
      { name: 'Activity', model: 'Activity', count: activityCount, category: 'Activities' },
      { name: 'FacultyActivity', model: 'FacultyActivity', count: facultyActivityCount, category: 'Activities' },
      { name: 'StudentActivity', model: 'StudentActivity', count: studentActivityCount, category: 'Activities' },
      { name: 'Research', model: 'Research', count: researchCount, category: 'Research' },
      { name: 'ResearchPublication', model: 'ResearchPublication', count: researchPublicationCount, category: 'Research' },
      { name: 'Certification', model: 'Certification', count: certificationCount, category: 'Faculty' },
      { name: 'Award', model: 'Award', count: awardCount, category: 'Faculty' },
      { name: 'Patent', model: 'Patent', count: patentCount, category: 'Faculty' },
      { name: 'Book', model: 'Book', count: bookCount, category: 'Faculty' },
      { name: 'Project', model: 'Project', count: projectCount, category: 'Faculty' },
      { name: 'Consultancy', model: 'Consultancy', count: consultancyCount, category: 'Faculty' },
      { name: 'FDPProgram', model: 'FDPProgram', count: fdpProgramCount, category: 'Faculty' },
      { name: 'StudentAchievement', model: 'StudentAchievement', count: studentAchievementCount, category: 'Student' },
      { name: 'StudentCertification', model: 'StudentCertification', count: studentCertificationCount, category: 'Student' },
      { name: 'Internship', model: 'Internship', count: internshipCount, category: 'Student' },
      { name: 'Placement', model: 'Placement', count: placementCount, category: 'Student' },
      { name: 'NPCourse', model: 'NPCourse', count: npCourseCount, category: 'Student' },
      { name: 'HackathonParticipation', model: 'HackathonParticipation', count: hackathonParticipationCount, category: 'Student' },
      { name: 'Startup', model: 'Startup', count: startupCount, category: 'Student' },
      { name: 'Approval', model: 'Approval', count: approvalCount, category: 'System' },
      { name: 'Notification', model: 'Notification', count: notificationCount, category: 'System' },
      { name: 'AuditLog', model: 'AuditLog', count: auditLogCount, category: 'System' },
      { name: 'Feedback', model: 'Feedback', count: feedbackCount, category: 'System' },
      { name: 'Document', model: 'Document', count: documentCount, category: 'System' },
      { name: 'Setting', model: 'Setting', count: settingCount, category: 'System' },
    ]

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalTables: tables.length,
          totalRecords,
          dbSize: {
            bytes: dbSizeBytes,
            formatted: dbSizeFormatted,
          },
          queryTimeMs: queryTime,
          timestamp: new Date().toISOString(),
        },
        health: healthStatus,
        tables,
        usersByRole: {
          admin: adminCount,
          hod: hodCount,
          staff: staffCount,
          student: studentRoleCount,
          total: userCount,
        },
        userStatus: {
          active: activeUsers,
          inactive: inactiveUsers,
        },
        pendingItems: {
          approvals: pendingApprovals,
          notifications: unreadNotifications,
        },
        recentActivity: {
          latestUser: latestUser ? { at: latestUser.createdAt, name: latestUser.name } : null,
          latestActivity: latestActivity ? { at: latestActivity.createdAt, title: latestActivity.title } : null,
          latestResearch: latestResearch ? { at: latestResearch.createdAt, title: latestResearch.title } : null,
          latestAuditLog: latestAuditLog ? { at: latestAuditLog.createdAt, action: latestAuditLog.action } : null,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching database info:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch database information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/database - Database operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body as { action: string }

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'backup': {
        return await handleBackup()
      }

      case 'seed': {
        return await handleSeed()
      }

      case 'stats': {
        return await handleStatsRefresh()
      }

      case 'cleanup': {
        return await handleCleanup()
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in database operation:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform database operation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Action Handlers

async function handleBackup() {
  try {
    const dbPath = path.join(process.cwd(), 'db', 'custom.db')
    const backupDir = path.join(process.cwd(), 'db', 'backups')
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFilename = `backup-${timestamp}.db`
    const backupPath = path.join(backupDir, backupFilename)

    // Copy database file
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath)
      
      // Get backup file size
      const stats = fs.statSync(backupPath)
      
      // List existing backups
      const existingBackups = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('backup-') && f.endsWith('.db'))
        .sort()
        .reverse()

      return NextResponse.json({
        success: true,
        data: {
          message: 'Database backup created successfully',
          backupFile: backupFilename,
          backupPath: backupPath,
          size: formatFileSize(stats.size),
          createdAt: new Date().toISOString(),
          totalBackups: existingBackups.length,
          recentBackups: existingBackups.slice(0, 5),
        },
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Database file not found',
      }, { status: 404 })
    }
  } catch (error) {
    console.error('Backup failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create backup',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleSeed() {
  try {
    // Check if database already has data
    const existingData = await db.user.count()
    
    if (existingData > 0) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'Database already contains data. Seeding skipped.',
          existingRecords: existingData,
          seeded: false,
        },
      })
    }

    // Run seed function
    const result = await seedDatabase()
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Database seeded successfully',
        ...result,
        seeded: true,
      },
    })
  } catch (error) {
    console.error('Seeding failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to seed database',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleStatsRefresh() {
  try {
    // Force refresh of statistics by running ANALYZE (for SQLite)
    // This helps optimize query planning
    try {
      await db.$executeRaw`ANALYZE`
    } catch {
      // ANALYZE might not be available in all SQLite configurations
      // This is non-critical, so we continue
    }

    // Get fresh counts
    const [
      userCount,
      departmentCount,
      facultyCount,
      studentCount,
      activityCount,
      researchCount,
    ] = await Promise.all([
      db.user.count(),
      db.department.count(),
      db.faculty.count(),
      db.student.count(),
      db.activity.count(),
      db.research.count(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        message: 'Statistics refreshed successfully',
        refreshedAt: new Date().toISOString(),
        quickStats: {
          users: userCount,
          departments: departmentCount,
          faculty: facultyCount,
          students: studentCount,
          activities: activityCount,
          research: researchCount,
        },
      },
    })
  } catch (error) {
    console.error('Stats refresh failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleCleanup() {
  try {
    const cleanupResults = {
      orphanedFacultyActivities: 0,
      orphanedStudentActivities: 0,
      orphanedResearchPublications: 0,
      orphanedNotifications: 0,
      orphanedAuditLogs: 0,
      totalRemoved: 0,
    }

    // Clean up orphaned FacultyActivity records (faculty or activity doesn't exist)
    const orphanedFacultyActivities = await db.facultyActivity.findMany({
      where: {
        OR: [
          { faculty: null },
          { activity: null },
        ],
      },
      select: { id: true },
    })
    
    if (orphanedFacultyActivities.length > 0) {
      await db.facultyActivity.deleteMany({
        where: {
          id: { in: orphanedFacultyActivities.map(fa => fa.id) },
        },
      })
      cleanupResults.orphanedFacultyActivities = orphanedFacultyActivities.length
      cleanupResults.totalRemoved += orphanedFacultyActivities.length
    }

    // Clean up orphaned StudentActivity records
    const orphanedStudentActivities = await db.studentActivity.findMany({
      where: {
        OR: [
          { student: null },
          { activity: null },
        ],
      },
      select: { id: true },
    })
    
    if (orphanedStudentActivities.length > 0) {
      await db.studentActivity.deleteMany({
        where: {
          id: { in: orphanedStudentActivities.map(sa => sa.id) },
        },
      })
      cleanupResults.orphanedStudentActivities = orphanedStudentActivities.length
      cleanupResults.totalRemoved += orphanedStudentActivities.length
    }

    // Clean up orphaned ResearchPublication records
    const orphanedResearchPublications = await db.researchPublication.findMany({
      where: {
        OR: [
          { research: null },
          { faculty: null },
        ],
      },
      select: { id: true },
    })
    
    if (orphanedResearchPublications.length > 0) {
      await db.researchPublication.deleteMany({
        where: {
          id: { in: orphanedResearchPublications.map(rp => rp.id) },
        },
      })
      cleanupResults.orphanedResearchPublications = orphanedResearchPublications.length
      cleanupResults.totalRemoved += orphanedResearchPublications.length
    }

    // Clean up orphaned Notification records (user doesn't exist)
    const orphanedNotifications = await db.notification.findMany({
      where: { user: null },
      select: { id: true },
    })
    
    if (orphanedNotifications.length > 0) {
      await db.notification.deleteMany({
        where: {
          id: { in: orphanedNotifications.map(n => n.id) },
        },
      })
      cleanupResults.orphanedNotifications = orphanedNotifications.length
      cleanupResults.totalRemoved += orphanedNotifications.length
    }

    // Clean up orphaned AuditLog records (user doesn't exist)
    const orphanedAuditLogs = await db.auditLog.findMany({
      where: { user: null },
      select: { id: true },
    })
    
    if (orphanedAuditLogs.length > 0) {
      await db.auditLog.deleteMany({
        where: {
          id: { in: orphanedAuditLogs.map(al => al.id) },
        },
      })
      cleanupResults.orphanedAuditLogs = orphanedAuditLogs.length
      cleanupResults.totalRemoved += orphanedAuditLogs.length
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Database cleanup completed',
        cleanedAt: new Date().toISOString(),
        results: cleanupResults,
      },
    })
  } catch (error) {
    console.error('Cleanup failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to cleanup database',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

// Helper Functions

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function determineHealthStatus(
  queryTime: number,
  dbSizeBytes: number,
  totalRecords: number,
  activeUsers: number,
  _inactiveUsers: number
): {
  status: 'healthy' | 'warning' | 'critical'
  message: string
  details: Record<string, unknown>
} {
  const issues: string[] = []
  const warnings: string[] = []

  // Check query performance
  if (queryTime > 5000) {
    issues.push('Slow query performance detected')
  } else if (queryTime > 2000) {
    warnings.push('Query performance could be better')
  }

  // Check database size
  if (dbSizeBytes > 500 * 1024 * 1024) { // > 500MB
    issues.push('Database size is very large')
  } else if (dbSizeBytes > 100 * 1024 * 1024) { // > 100MB
    warnings.push('Database size is growing large')
  }

  // Check for empty database
  if (totalRecords === 0) {
    issues.push('Database appears to be empty')
  }

  // Check user activity
  if (activeUsers === 0 && totalRecords > 0) {
    warnings.push('No active users found')
  }

  // Determine overall status
  let status: 'healthy' | 'warning' | 'critical' = 'healthy'
  let message = 'Database is operating normally'

  if (issues.length > 0) {
    status = 'critical'
    message = `Critical issues detected: ${issues.join(', ')}`
  } else if (warnings.length > 0) {
    status = 'warning'
    message = `Warnings: ${warnings.join(', ')}`
  }

  return {
    status,
    message,
    details: {
      queryTimeMs: queryTime,
      dbSizeMB: Math.round(dbSizeBytes / (1024 * 1024) * 100) / 100,
      totalRecords,
      activeUsers,
      issues,
      warnings,
    },
  }
}
