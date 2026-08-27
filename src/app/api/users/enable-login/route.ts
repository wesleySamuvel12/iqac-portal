import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateTempPassword } from '@/lib/auth-helpers'
import { createOrUpdateUserAccount } from '@/lib/user-service'

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

        try {
          const res = await createOrUpdateUserAccount({
            name,
            email,
            password: tempPassword,
            role: 'STUDENT',
            departmentId: student.departmentId,
            phone: student.phone,
            registerNumber: student.registerNumber,
            semester: student.semester,
            section: student.section,
            batch: student.batch,
            createLoginAccess: true,
            mustChangePassword: true,
            createdBy: 'Enable Login Action'
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

        try {
          const res = await createOrUpdateUserAccount({
            name,
            email,
            password: tempPassword,
            role: faculty.isHOD ? 'HOD' : 'STAFF',
            departmentId: faculty.departmentId,
            phone: faculty.phone,
            employeeId: faculty.employeeId,
            designation: faculty.designation,
            qualification: faculty.qualification,
            createLoginAccess: true,
            mustChangePassword: true,
            createdBy: 'Enable Login Action'
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

