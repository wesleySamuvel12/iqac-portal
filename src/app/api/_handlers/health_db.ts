import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const startTime = Date.now()
  try {
    // Test Prisma PostgreSQL query latency
    await db.$queryRaw`SELECT 1`
    const latencyMs = Date.now() - startTime

    // Fetch user and department counts from Supabase database
    const userCount = await db.user.count()
    const deptCount = await db.department.count()

    const dbUrl = process.env.DATABASE_URL || ''
    const isSupabase = dbUrl.includes('supabase') || dbUrl.includes('postgres')

    return NextResponse.json({
      status: 'connected',
      database: isSupabase ? 'Supabase PostgreSQL' : 'Local Database',
      endpoint: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not Set',
      projectRef: 'ukxcwzcnwoqzcjrprxca',
      region: 'ap-southeast-2',
      latencyMs: `${latencyMs}ms`,
      stats: {
        users: userCount,
        departments: deptCount,
      },
      environment: process.env.VERCEL ? 'Vercel Production / Preview' : 'Development Server',
      timestamp: new Date().toISOString(),
    }, { status: 200 })
  } catch (error: any) {
    const latencyMs = Date.now() - startTime
    return NextResponse.json({
      status: 'disconnected',
      error: error?.message || 'Database connection failed',
      databaseUrlConfigured: !!process.env.DATABASE_URL,
      environment: process.env.VERCEL ? 'Vercel Production / Preview' : 'Development Server',
      latencyMs: `${latencyMs}ms`,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
