import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL
  if (envUrl && (envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://') || envUrl.startsWith('mysql://'))) {
    return envUrl
  }

  const localDbPath = path.resolve(process.cwd(), 'db/custom.db')
  const devDbPath = path.resolve(process.cwd(), 'prisma/dev.db')
  const tmpDbPath = '/tmp/custom.db'

  if (process.env.VERCEL) {
    try {
      const tmpDir = path.dirname(tmpDbPath)
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true })
      }

      if (fs.existsSync(localDbPath)) {
        if (!fs.existsSync(tmpDbPath)) {
          fs.copyFileSync(localDbPath, tmpDbPath)
        }
        return `file:${tmpDbPath}`
      }
      if (fs.existsSync(devDbPath)) {
        if (!fs.existsSync(tmpDbPath)) {
          fs.copyFileSync(devDbPath, tmpDbPath)
        }
        return `file:${tmpDbPath}`
      }
    } catch (e) {
      console.warn('Could not copy sqlite database to /tmp:', e)
    }
  }

  if (fs.existsSync(localDbPath)) {
    return `file:${localDbPath}`
  }
  if (fs.existsSync(devDbPath)) {
    return `file:${devDbPath}`
  }

  return `file:${localDbPath}`
}

declare global {
  var prismaGlobal: PrismaClient | undefined
}

export const db =
  globalThis.prismaGlobal ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = db
}