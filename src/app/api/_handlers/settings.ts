import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const settings = await db.setting.findMany({
      orderBy: { category: 'asc' },
    })

    // Convert to key-value object
    const settingsMap: Record<string, string> = {}
    settings.forEach((s) => {
      settingsMap[s.key] = s.value
    })

    return NextResponse.json({ success: true, settings: settingsMap })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { key, value, category, description } = data

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Key and Value are required' },
        { status: 400 }
      )
    }

    const setting = await db.setting.upsert({
      where: { key },
      update: { value, category, description, updatedAt: new Date() },
      create: { key, value, category: category || 'GENERAL', description },
    })

    return NextResponse.json({ success: true, setting })
  } catch (error) {
    console.error('Error saving setting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save setting' },
      { status: 500 }
    )
  }
}
