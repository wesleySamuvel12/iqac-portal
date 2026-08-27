import { NextRequest, NextResponse } from 'next/server'
import { generateAchievementExcel, generateAchievementPdf, FilterOptions } from '@/lib/reports/achievement-report-service'

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
      format = 'excel',
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

    if (String(format).toLowerCase() === 'pdf') {
      const { buffer, filename } = await generateAchievementPdf(filters)
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    const { buffer, filename } = await generateAchievementExcel(filters)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('[Achievement Report Download Error]', {
      stage: 'API Download Route',
      message: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      { success: false, error: 'Failed to generate report: ' + error.message },
      { status: 500 }
    )
  }
}
