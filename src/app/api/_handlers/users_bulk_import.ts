import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth-helpers'
import { UserRole } from '@prisma/client'

// POST /api/users/bulk-import - Bulk CSV Import with Department & Role Lock
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      rows,
      targetRole = 'STUDENT',
      callerRole = 'ADMIN',
      callerDeptId,
      callerName,
      callerId
    } = body

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No user data rows provided for import' },
        { status: 400 }
      )
    }

    // Permission enforcement
    let enforcedRole: UserRole = targetRole as UserRole
    let enforcedDeptId: string | null = null

    if (callerRole === 'HOD') {
      if (targetRole !== 'STAFF' && targetRole !== 'STUDENT') {
        return NextResponse.json(
          { success: false, error: 'HOD can only import Staff or Student credentials' },
          { status: 403 }
        )
      }
      enforcedDeptId = callerDeptId
    } else if (callerRole === 'STAFF') {
      if (targetRole !== 'STUDENT') {
        return NextResponse.json(
          { success: false, error: 'Staff can only import Student credentials' },
          { status: 403 }
        )
      }
      enforcedDeptId = callerDeptId
    } else if (callerRole === 'ADMIN') {
      enforcedDeptId = body.departmentId || null
    }

    const createdByLabel = callerName || (callerRole === 'ADMIN' ? 'Admin' : callerRole === 'HOD' ? 'HOD' : 'Staff')

    const createdUsers: any[] = []
    const skippedRows: any[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const name = (row.name || row.Name || '').trim()
      const email = (row.email || row.Email || '').trim().toLowerCase()
      const rawPassword = (row.password || row.Password || 'Niet@2026!').trim()
      const staffId = (row.staff_id || row.staffId || row.employeeId || '').trim()
      const regNo = (row.register_no || row.registerNo || row.registerNumber || '').trim()
      const rowDeptId = (callerRole === 'ADMIN' && row.departmentId) ? row.departmentId : enforcedDeptId

      if (!email || !name) {
        skippedRows.push({ row: i + 1, email, reason: 'Missing required name or email' })
        continue
      }

      // Check duplicate user
      const existingUser = await db.user.findUnique({ where: { email } })
      if (existingUser) {
        skippedRows.push({ row: i + 1, email, reason: 'Account with this email already exists' })
        continue
      }

      const hashedPassword = await hashPassword(rawPassword)

      try {
        await db.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              name,
              email,
              password: hashedPassword,
              role: enforcedRole,
              departmentId: rowDeptId,
              isActive: true,
              status: 'ACTIVE',
              mustChangePassword: true,
              createdBy: createdByLabel,
              createdByRole: callerRole,
              createdById: callerId || null,
            }
          })

          if (enforcedRole === 'STAFF') {
            const empCode = staffId || `EMP${Date.now().toString().slice(-6)}${i}`
            const existingFaculty = await tx.faculty.findUnique({ where: { employeeId: empCode } })
            if (existingFaculty) {
              await tx.faculty.update({
                where: { id: existingFaculty.id },
                data: { userId: newUser.id }
              })
            } else if (rowDeptId) {
              await tx.faculty.create({
                data: {
                  employeeId: empCode,
                  userId: newUser.id,
                  departmentId: rowDeptId,
                  designation: 'Assistant Professor'
                }
              })
            }
          } else if (enforcedRole === 'STUDENT') {
            const regCode = regNo || `REG${Date.now().toString().slice(-6)}${i}`
            const existingStudent = await tx.student.findUnique({ where: { registerNumber: regCode } })
            if (existingStudent) {
              await tx.student.update({
                where: { id: existingStudent.id },
                data: { userId: newUser.id }
              })
            } else if (rowDeptId) {
              await tx.student.create({
                data: {
                  registerNumber: regCode,
                  userId: newUser.id,
                  departmentId: rowDeptId,
                  semester: row.semester ? parseInt(row.semester) : 1,
                  section: row.section || 'A'
                }
              })
            }
          }

          createdUsers.push({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role })
        }, {
          timeout: 15000,
          maxWait: 10000,
        })
      } catch (err: any) {
        skippedRows.push({ row: i + 1, email, reason: err.message || 'Database creation error' })
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: createdUsers.length,
      skippedCount: skippedRows.length,
      createdUsers,
      skippedRows
    })
  } catch (error: any) {
    console.error('Error in bulk import:', error)
    return NextResponse.json({ success: false, error: error.message || 'Import failed' }, { status: 500 })
  }
}
