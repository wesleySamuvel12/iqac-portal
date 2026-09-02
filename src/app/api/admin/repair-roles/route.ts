import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  return repairStaffRoles()
}

export async function POST() {
  return repairStaffRoles()
}

async function repairStaffRoles() {
  try {
    const repairedAccounts: string[] = []

    // 1. Find all Faculty whose linked user has role = 'STUDENT' or non-staff role
    const misconfiguredFacultyUsers = await db.faculty.findMany({
      where: {
        userId: { not: null },
        user: {
          role: { notIn: ['STAFF', 'HOD', 'ADMIN', 'SUPER_ADMIN'] }
        }
      },
      include: { user: true }
    })

    for (const faculty of misconfiguredFacultyUsers) {
      if (faculty.user) {
        const targetRole = faculty.isHOD ? 'HOD' : 'STAFF'
        await db.user.update({
          where: { id: faculty.user.id },
          data: { role: targetRole }
        })
        repairedAccounts.push(`${faculty.user.email} (${faculty.employeeId}) -> ${targetRole}`)
      }
    }

    // 2. Also repair Faculty without userId link where User exists with matching email
    const unlinkedFaculty = await db.faculty.findMany({
      where: { userId: null }
    })

    for (const f of unlinkedFaculty) {
      if (f.email) {
        const matchingUser = await db.user.findFirst({
          where: { email: { equals: f.email, mode: 'insensitive' } }
        })
        if (matchingUser) {
          const targetRole = f.isHOD ? 'HOD' : 'STAFF'
          await db.$transaction([
            db.user.update({
              where: { id: matchingUser.id },
              data: { role: targetRole }
            }),
            db.faculty.update({
              where: { id: f.id },
              data: { userId: matchingUser.id }
            })
          ])
          repairedAccounts.push(`Linked & Repaired: ${f.email} -> ${targetRole}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully repaired ${repairedAccounts.length} staff account(s)`,
      repairedCount: repairedAccounts.length,
      repairedAccounts
    })
  } catch (error: any) {
    console.error('Error repairing roles:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
