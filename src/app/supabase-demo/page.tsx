import { db } from '@/lib/db'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Database, ShieldCheck, Server, Globe, AlertCircle, RefreshCw, CheckCircle2, Cpu } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SupabaseStatusPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let isConnected = false
  let dbError: string | null = null
  let latencyMs = 0
  let userCount = 0
  let deptCount = 0

  const startTime = Date.now()
  try {
    await db.$queryRaw`SELECT 1`
    latencyMs = Date.now() - startTime
    userCount = await db.user.count()
    deptCount = await db.department.count()
    isConnected = true
  } catch (err: any) {
    dbError = err?.message || 'Failed to query database'
  }

  const isVercel = !!process.env.VERCEL
  const dbUrl = process.env.DATABASE_URL || ''
  const isPostgresUrl = dbUrl.includes('supabase') || dbUrl.includes('postgres')

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <Database className="w-7 h-7 text-cyan-400" />
              Supabase Connection Verification
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              NIET IQAC Enterprise Portal — Database & API Status Diagnostic
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Supabase Connected
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  Disconnected
                </>
              )}
            </span>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Database Engine</span>
              <Server className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {isPostgresUrl ? 'Supabase PostgreSQL' : 'Local SQLite Fallback'}
            </div>
            <div className="text-xs text-slate-400 truncate">
              Project: <code className="text-cyan-300">ukxcwzcnwoqzcjrprxca</code>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Query Latency</span>
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {isConnected ? `${latencyMs} ms` : 'N/A'}
            </div>
            <div className="text-xs text-slate-400">
              Region: <code className="text-emerald-300">ap-southeast-2</code>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Environment</span>
              <Globe className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {isVercel ? 'Vercel Production' : 'Local Development'}
            </div>
            <div className="text-xs text-slate-400">
              Endpoint: <span className="text-purple-300">https://ukxcwzcnwoqzcjrprxca.supabase.co</span>
            </div>
          </div>
        </div>

        {/* Database Query Stats */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Live Database Record Counts (Prisma → Supabase)
          </h2>
          {isConnected ? (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
                <span className="text-xs text-slate-400 font-semibold block">Total Users</span>
                <span className="text-2xl font-black text-cyan-400">{userCount}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
                <span className="text-xs text-slate-400 font-semibold block">Departments</span>
                <span className="text-2xl font-black text-emerald-400">{deptCount}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm space-y-1">
              <p className="font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Connection Error:
              </p>
              <code className="text-xs font-mono block p-2 rounded bg-slate-950 text-rose-200 overflow-x-auto">
                {dbError}
              </code>
            </div>
          )}
        </div>

        {/* Vercel Environment Variable Checklist */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-400" />
            How to Connect Supabase on Vercel Production
          </h2>
          <p className="text-xs text-slate-400">
            To ensure Vercel production connects directly to your Supabase PostgreSQL database, add these Environment Variables in your Vercel Project Settings:
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 font-bold">1. DATABASE_URL (Session Pooler - Port 5432)</div>
              <code className="text-cyan-300 break-all">
                postgresql://postgres.ukxcwzcnwoqzcjrprxca:[YOUR_PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres
              </code>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 font-bold">2. DIRECT_URL (Direct Connection - Port 5432)</div>
              <code className="text-emerald-300 break-all">
                postgresql://postgres.ukxcwzcnwoqzcjrprxca:[YOUR_PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres
              </code>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 font-bold">3. NEXT_PUBLIC_SUPABASE_URL</div>
              <code className="text-purple-300 break-all">
                https://ukxcwzcnwoqzcjrprxca.supabase.co
              </code>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 font-bold">4. NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
              <code className="text-amber-300 break-all">
                sb_publishable_mGzWIE5opqNvUVUAZKaA8g_fyMwTrnK
              </code>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <Link
            href="/api/health/db"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Open Raw Health Check API (/api/health/db)
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs transition-all"
          >
            Return to Dashboard
          </Link>
        </div>

      </div>
    </div>
  )
}
