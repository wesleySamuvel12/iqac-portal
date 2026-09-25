import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const faculty = await db.faculty.findFirst()
    console.log('Faculty:', faculty?.id)
    
    if (faculty) {
      const patent = await db.patent.create({
        data: {
          title: 'Test Patent for NIET',
          patentNumber: `TEST${Date.now()}`,
          facultyId: faculty.id,
          status: 'FILED',
          country: 'India',
        }
      })
      return NextResponse.json({ success: true, patent })
    }
    
    return NextResponse.json({ success: false, error: 'No faculty found' })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}
