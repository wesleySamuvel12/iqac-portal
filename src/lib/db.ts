import { PrismaClient } from '@prisma/client'
import path from 'path'

const dbPath = path.resolve(process.cwd(), 'db/custom.db')

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL
  if (envUrl && !envUrl.startsWith('file:.')) {
    return envUrl
  }
  return `file:${dbPath}`
}

export const db = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
})