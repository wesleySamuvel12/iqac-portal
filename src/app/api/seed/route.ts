import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

// POST /api/seed - Seed the database with initial data
export async function POST() {
  try {
    await seedDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully'
    });
  } catch (error) {
    console.error('Seed error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to seed database'
    }, { status: 500 });
  }
}

// GET /api/seed - Check seed status
export async function GET() {
  try {
    const { db } = await import('@/lib/db');
    
    const [userCount, deptCount] = await Promise.all([
      db.user.count(),
      db.department.count()
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        userCount,
        departmentCount: deptCount,
        isSeeded: userCount > 0 && deptCount > 0
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check seed status'
    }, { status: 500 });
  }
}
