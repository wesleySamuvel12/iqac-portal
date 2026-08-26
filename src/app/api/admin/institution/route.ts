import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET institution settings
export async function GET() {
  try {
    // Get or create institution record
    let institution = await db.institution.findFirst()
    
    if (!institution) {
      institution = await db.institution.create({
        data: {
          name: 'Nehru Institute of Engineering and Technology',
          shortName: 'NIET',
          address: 'Coimbatore, Tamil Nadu',
          state: 'Tamil Nadu',
          country: 'India',
          type: 'Autonomous Institution',
        },
      })
    }

    // Get all system settings grouped by category
    const settings = await db.setting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    })

    // Group settings by category
    const settingsByCategory: Record<string, Array<{ key: string; value: string; description?: string }>> = {}
    settings.forEach((s) => {
      if (!settingsByCategory[s.category]) {
        settingsByCategory[s.category] = []
      }
      settingsByCategory[s.category].push({
        key: s.key,
        value: s.value,
        description: s.description || undefined,
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        institution,
        settings: settingsByCategory,
      },
    })
  } catch (error) {
    console.error('Error fetching institution settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch institution settings' },
      { status: 500 }
    )
  }
}

// POST - Update institution settings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { section, ...updates } = data

    if (section === 'institution') {
      // Update institution info
      let institution = await db.institution.findFirst()
      
      if (institution) {
        institution = await db.institution.update({
          where: { id: institution.id },
          data: updates,
        })
      } else {
        institution = await db.institution.create({
          data: {
            name: updates.name || 'Nehru Institute of Engineering and Technology',
            ...updates,
          },
        })
      }

      return NextResponse.json({ success: true, institution })
    }

    if (section === 'settings') {
      // Update multiple settings at once
      const results = []
      for (const [key, value] of Object.entries(updates)) {
        const setting = await db.setting.upsert({
          where: { key },
          update: { 
            value: typeof value === 'string' ? value : JSON.stringify(value),
            updatedAt: new Date() 
          },
          create: {
            key,
            value: typeof value === 'string' ? value : JSON.stringify(value),
            category: inferCategory(key),
            description: generateDescription(key),
          },
        })
        results.push(setting)
      }

      return NextResponse.json({ success: true, settings: results })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid section specified' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating institution settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update institution settings' },
      { status: 500 }
    )
  }
}

function inferCategory(key: string): string {
  if (key.startsWith('domain_') || key.startsWith('url_') || key.startsWith('site_')) return 'DOMAIN'
  if (key.startsWith('db_') || key.startsWith('database_') || key.startsWith('sql_')) return 'DATABASE'
  if (key.startsWith('ip_') || key.startsWith('server_') || key.startsWith('host_')) return 'NETWORK'
  if (key.startsWith('email_') || key.startsWith('smtp_') || key.startsWith('mail_')) return 'EMAIL'
  if (key.startsWith('academic_') || key.startsWith('semester_')) return 'ACADEMIC'
  if (key.startsWith('notification_') || key.startsWith('alert_')) return 'NOTIFICATION'
  if (key.startsWith('security_') || key.startsWith('auth_') || key.startsWith('password_')) return 'SECURITY'
  if (key.startsWith('upload_') || key.startsWith('file_') || key.startsWith('storage_')) return 'STORAGE'
  return 'GENERAL'
}

function generateDescription(key: string): string {
  const descriptions: Record<string, string> = {
    domain_primary: 'Primary domain for the application',
    domain_alias: 'Alternative domain aliases (comma-separated)',
    domain_ssl: 'SSL certificate status',
    database_host: 'Database server hostname or IP',
    database_port: 'Database server port',
    database_name: 'Database name',
    database_type: 'Database type (SQLite, PostgreSQL, MySQL)',
    ip_whitelist: 'Allowed IP addresses for admin access (comma-separated)',
    ip_api_rate_limit: 'API rate limit per minute per IP',
    email_from: 'Default sender email address',
    email_smtp_host: 'SMTP server hostname',
    email_smtp_port: 'SMTP server port',
    academic_current_year: 'Current academic year (e.g., 2024-25)',
    academic_current_semester: 'Current semester (Odd/Even)',
    site_maintenance: 'Maintenance mode status',
    security_session_timeout: 'Session timeout in minutes',
    security_max_login_attempts: 'Maximum login attempts before lockout',
    upload_max_file_size: 'Maximum file upload size in MB',
  }
  return descriptions[key] || `Setting for ${key.replace(/_/g, ' ')}`
}
