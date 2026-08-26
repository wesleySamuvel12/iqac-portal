import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateTempPassword } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileType, ids } = body

    if (!profileType || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'profileType and an array of ids are required' }, { status: 400 })
    }

    const createdAccounts: any[] = []
    const errors: string[] = []

    if (profileType === 'STUDENT') {
      const students = await db.student.findMany({
        where: { id: { in: ids } },
        include: { user: true }
      })

      for (const student of students) {
        if (student.userId && student.user) {
          createdAccounts.push({
            studentId: student.id,
            registerNumber: student.registerNumber,
            email: student.user.email,
            alreadyExisted: true,
          })
          continue
        }

        const email = student.email || `${student.registerNumber.toLowerCase()}@niet.ac.in`
        const name = student.name || `Student ${student.registerNumber}`
        const tempPassword = '12345678'
        const hashedPassword = await hashPassword(tempPassword)

        try {
          const user = await db.user.upsert({
            where: { email },
            update: {
              name,
              departmentId: student.departmentId,
              role: 'STUDENT',
              isActive: true,
              status: 'ACTIVE',
            },
            create: {
              email,
              password: hashedPassword,
              name,
              role: 'STUDENT',
              departmentId: student.departmentId,
              isActive: true,
              status: 'ACTIVE',
              mustChangePassword: true,
            }
          })

          await db.student.update({
            where: { id: student.id },
            data: { userId: user.id, email }
          })

          createdAccounts.push({
            studentId: student.id,
            registerNumber: student.registerNumber,
            name,
            email,
            tempPassword,
            loginAccess: true,
          })
        } catch (err: any) {
          console.error(`Failed to enable login for student ${student.registerNumber}:`, err)
          errors.push(`RegNo ${student.registerNumber}: ${err.message || 'Failed'}`)
        }
      }
    } else if (profileType === 'FACULTY') {
      const facultyList = await db.faculty.findMany({
        where: { id: { in: ids } },
        include: { user: true }
      })

      for (const faculty of facultyList) {
        if (faculty.userId && faculty.user) {
          createdAccounts.push({
            facultyId: faculty.id,
            employeeId: faculty.employeeId,
            email: faculty.user.email,
            alreadyExisted: true,
          })
          continue
        }

        const email = faculty.email || `${faculty.employeeId.toLowerCase()}@niet.ac.in`
        const name = faculty.name || `Staff ${faculty.employeeId}`
        const tempPassword = generateTempPassword()
        const hashedPassword = await hashPassword(tempPassword)

        try {
          const user = await db.user.upsert({
            where: { email },
            update: {
              name,
              departmentId: faculty.departmentId,
              role: faculty.isHOD ? 'HOD' : 'STAFF',
              isActive: true,
              status: 'ACTIVE',
            },
            create: {
              email,
              password: hashedPassword,
              name,
              role: faculty.isHOD ? 'HOD' : 'STAFF',
              departmentId: faculty.departmentId,
              isActive: true,
              status: 'ACTIVE',
              mustChangePassword: true,
            }
          })

          await db.faculty.update({
            where: { id: faculty.id },
            data: { userId: user.id, email }
          })

          createdAccounts.push({
            facultyId: faculty.id,
            employeeId: faculty.employeeId,
            name,
            email,
            tempPassword,
            loginAccess: true,
          })
        } catch (err: any) {
          console.error(`Failed to enable login for faculty ${faculty.employeeId}:`, err)
          errors.push(`EmpID ${faculty.employeeId}: ${err.message || 'Failed'}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: createdAccounts.length,
      createdAccounts,
      errors,
    })
  } catch (error: any) {
    console.error('Error enabling login access:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to enable login access' }, { status: 500 })
  }
}
