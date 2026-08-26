import { NextRequest, NextResponse } from 'next/server'
import { generateAchievementExcel, FilterOptions } from '@/lib/reports/achievement-report-service'

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

    const { buffer, filename } = await generateAchievementExcel(filters)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Error downloading achievement report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to download Excel: ' + error.message },
      { status: 500 }
    )
  }
}
