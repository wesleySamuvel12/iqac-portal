import { PrismaClient } from '@prisma/client'

declare global {
  var prismaGlobal: PrismaClient | undefined
}

function getSanitizedDatabaseUrl(): string {
  let url = process.env.DATABASE_URL || ''
  if (!url || !url.startsWith('postgres')) {
    url = 'postgresql://postgres.ukxcwzcnwoqzcjrprxca:WESlEY--1234wes@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5&pool_timeout=20'
  }

  // Transform direct host (db.ref.supabase.co) to Transaction Pooler host (aws-0-ap-southeast-2.pooler.supabase.com)
  if (url.includes('.supabase.co') || url.includes('.supabase.com')) {
    url = url.replace(/db\.[a-z0-9]+\.supabase\.co:5432/, 'aws-0-ap-southeast-2.pooler.supabase.com:6543')
    url = url.replace(/db\.[a-z0-9]+\.supabase\.co/, 'aws-0-ap-southeast-2.pooler.supabase.com')
    // Convert Port 5432 (Session mode limit 15 connections) to Port 6543 (Transaction pooler mode for Serverless)
    url = url.replace(':5432', ':6543')
  }

  // Ensure PgBouncer transaction mode flags for serverless environments
  if (!url.includes('pgbouncer=true')) {
    url += url.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true'
  }

  // Set pool configuration suitable for serverless lambda instances:
  // Use a healthy connection_limit=5 and pool_timeout=20 seconds instead of restrictive connection_limit=1
  if (!url.includes('connection_limit=')) {
    url += '&connection_limit=5'
  } else {
    url = url.replace(/connection_limit=1(?!\d)/, 'connection_limit=5')
  }

  if (!url.includes('pool_timeout=')) {
    url += '&pool_timeout=20'
  }

  return url
}

export const db =
  globalThis.prismaGlobal ??
  new PrismaClient({
    datasources: {
      db: {
        url: getSanitizedDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Retain singleton Prisma instance globally across serverless lambdas
globalThis.prismaGlobal = db