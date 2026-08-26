import { NextRequest, NextResponse } from 'next/server'
import { fetchAchievementData, ACHIEVEMENT_TYPES, FilterOptions } from '@/lib/reports/achievement-report-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      departmentId = 'ALL',
      fromMonth = 1,
      toMonth = 12,
      year = 2026,
      userType = 'BOTH',
      targetUserId = 'ALL',
      achievementType = 'ALL',
      userRole = 'STAFF',
      currentUserId = '',
    } = body

    const filters: FilterOptions = {
      departmentId,
      fromMonth: Number(fromMonth),
      toMonth: Number(toMonth),
      year: Number(year),
      userType,
      targetUserId,
      achievementType,
      userRole,
      currentUserId,
    }

    const { departmentName, results } = await fetchAchievementData(filters)

    // Calculate achievement counts
    const achievementCounts: Record<string, number> = {}
    let totalRecordsFound = 0

    Object.keys(ACHIEVEMENT_TYPES).forEach(key => {
      const count = results[key]?.length || 0
      achievementCounts[key] = count
      totalRecordsFound += count
    })

    const isAll = achievementType === 'ALL'
    let columns: string[] = []
    let previewRows: any[][] = []
    let columnCount = 0
    let recordsFound = 0

    if (isAll) {
      columns = ['S.No', 'Achievement Category', 'Sheet Name', 'Total Records Found']
      columnCount = columns.length
      recordsFound = totalRecordsFound

      let sNo = 1
      Object.keys(ACHIEVEMENT_TYPES).forEach(key => {
        const schema = ACHIEVEMENT_TYPES[key]
        const count = results[key]?.length || 0
        previewRows.push([sNo++, schema.title, schema.sheetName, count])
      })
    } else {
      const schema = ACHIEVEMENT_TYPES[achievementType]
      if (schema) {
        columns = schema.columns
        columnCount = schema.columns.length
        const matched = results[achievementType] || []
        recordsFound = matched.length
        previewRows = matched.slice(0, 10) // First 10 records preview
      }
    }

    return NextResponse.json({
      success: true,
      departmentName,
      recordsFound,
      columnCount,
      columns,
      previewRows,
      achievementCounts,
      totalRecordsFound,
    })
  } catch (error: any) {
    console.error('Error generating report preview:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate preview: ' + error.message },
      { status: 500 }
    )
  }
}
