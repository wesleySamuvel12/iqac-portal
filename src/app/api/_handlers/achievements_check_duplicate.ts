import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  isSpecialCategory,
  getCanonicalCategoryLabel,
  normalizeTitle,
  computeCategorySerialNumbers,
} from '@/lib/achievements-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, title, userId, departmentId, localRecords = [] } = body

    if (!category || !title) {
      return NextResponse.json({ success: false, isDuplicate: false, error: 'Category and Title are required' }, { status: 400 })
    }

    // Special logic ONLY applies to Journal Publication, Conference Publication, and Patent
    if (!isSpecialCategory(category)) {
      return NextResponse.json({
        success: true,
        isDuplicate: false,
      })
    }

    const canonicalLabel = getCanonicalCategoryLabel(category)
    const normInput = normalizeTitle(title)

    // Gather existing records from database for this category
    let dbRecords: Array<{ id: string; title: string; createdAt: Date }> = []

    if (canonicalLabel === 'Journal Publication') {
      const journalRes = await db.research.findMany({
        where: {
          type: 'JOURNAL',
          ...(departmentId && departmentId !== 'ALL' ? { departmentId } : {}),
        },
        select: { id: true, title: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      })
      dbRecords = journalRes
    } else if (canonicalLabel === 'Conference Publication') {
      const confRes = await db.research.findMany({
        where: {
          type: 'CONFERENCE',
          ...(departmentId && departmentId !== 'ALL' ? { departmentId } : {}),
        },
        select: { id: true, title: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      })
      dbRecords = confRes
    } else if (canonicalLabel === 'Patent') {
      const patentRes = await db.patent.findMany({
        where: departmentId && departmentId !== 'ALL' ? { faculty: { departmentId } } : {},
        select: { id: true, title: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      })
      dbRecords = patentRes
    }

    // Combine with any client localRecords passed in request
    const allRecords: Array<{ id: string | number; title: string; createdAt?: any }> = [
      ...dbRecords,
      ...localRecords.filter((lr: any) => getCanonicalCategoryLabel(lr.category || lr.type || lr.typeName) === canonicalLabel),
    ]

    // Compute serial numbers for all existing records in chronological order
    const { titleToSerial, distinctCount } = computeCategorySerialNumbers(allRecords)

    if (titleToSerial[normInput]) {
      const existingSerial = titleToSerial[normInput]
      return NextResponse.json({
        success: true,
        isDuplicate: true,
        category: canonicalLabel,
        title: title.trim(),
        serialNo: existingSerial,
      })
    }

    // Not a duplicate: Next serial number
    const nextSerial = String(distinctCount + 1).padStart(2, '0')
    return NextResponse.json({
      success: true,
      isDuplicate: false,
      category: canonicalLabel,
      serialNo: nextSerial,
    })
  } catch (error: any) {
    console.error('Error checking duplicate achievement title:', error)
    return NextResponse.json(
      { success: false, isDuplicate: false, error: error.message || 'Failed to check duplicate title' },
      { status: 500 }
    )
  }
}
