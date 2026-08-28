import { PrismaClient } from '@prisma/client'

declare global {
  var prismaGlobal: PrismaClient | undefined
}

function getSanitizedDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || ''
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    return url
  }
  // Safe fallback to Supabase PostgreSQL production cluster if env var is unconfigured or SQLite on Vercel
  return 'postgresql://postgres.ukxcwzcnwoqzcjrprxca:WESlEY--1234wes@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres'
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

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = db
}