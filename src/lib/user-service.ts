import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth-helpers'
import { UserRole } from '@prisma/client'

export interface CreateUserOptions {
  name: string
  email: string
  password?: string
  role?: string | UserRole
  departmentId?: string | null
  phone?: string | null
  registerNumber?: string | null
  employeeId?: string | null
  designation?: string | null
  qualification?: string | null
  semester?: number | string | null
  section?: string | null
  batch?: string | null
  createLoginAccess?: boolean
  mustChangePassword?: boolean
  createdBy?: string | null
  createdByRole?: string | null
  createdById?: string | null
}

export async function createOrUpdateUserAccount(options: CreateUserOptions) {
  const {
    name,
    email,
    password,
    role = 'STUDENT',
    departmentId,
    phone,
    registerNumber,
    employeeId,
    designation,
    qualification,
    semester,
    section,
    batch,
    createLoginAccess = true,
    mustChangePassword = false,
    createdBy,
    createdByRole,
    createdById,
  } = options

  if (!name || !email) {
    throw new Error('Name and email are required')
  }

  const normalizedEmail = email.trim().toLowerCase()
  const normalizedName = name.trim()

  let targetRole: UserRole
  if (role) {
    targetRole = (role as string).toUpperCase() as UserRole
  } else if (employeeId || designation) {
    targetRole = 'STAFF'
  } else {
    targetRole = 'STUDENT'
  }

  // Hash password outside of transaction to prevent CPU-heavy bcrypt operations from causing Prisma transaction timeouts
  let hashedPassword = ''
  let finalRawPassword = ''
  if (createLoginAccess) {
    if (password && password.trim().length > 0) {
      finalRawPassword = password.trim()
    } else {
      switch (targetRole) {
        case 'HOD': finalRawPassword = 'hod123'; break
        case 'STAFF': finalRawPassword = 'staff123'; break
        case 'STUDENT': finalRawPassword = 'student123'; break
        case 'ADMIN': finalRawPassword = 'admin123'; break
        default: finalRawPassword = '12345678'; break
      }
    }
    hashedPassword = await hashPassword(finalRawPassword)
  }

  return await db.$transaction(async (tx) => {
    let userId: string | null = null
    let user: any = null

    // 1. Resolve departmentId safely to a valid Department primary key cuid (supports cuid and code like 'CSE')
    let validDeptId: string | null = null
    if (departmentId && departmentId !== 'ALL' && departmentId !== 'none' && departmentId !== 'null') {
      const existingDept = await tx.department.findFirst({
        where: {
          OR: [
            { id: departmentId },
            { code: departmentId }
          ]
        },
        select: { id: true }
      })
      if (existingDept) {
        validDeptId = existingDept.id
      }
    }

    // Fallback for Student/Staff/HOD roles if no valid departmentId was passed
    if (!validDeptId && (targetRole === 'STUDENT' || targetRole === 'STAFF' || targetRole === 'HOD')) {
      const firstDept = await tx.department.findFirst({ select: { id: true } })
      if (firstDept) {
        validDeptId = firstDept.id
      }
    }

    // If login access is requested, create or update central User record
    if (createLoginAccess) {
      // Upsert User
      user = await tx.user.upsert({
        where: { email: normalizedEmail },
        update: {
          name: normalizedName,
          phone: phone || undefined,
          role: targetRole,
          departmentId: validDeptId || undefined,
          isActive: true,
          status: 'ACTIVE',
          password: hashedPassword,
          ...(mustChangePassword !== undefined ? { mustChangePassword: !!mustChangePassword } : {}),
        },
        create: {
          name: normalizedName,
          email: normalizedEmail,
          password: hashedPassword,
          role: targetRole,
          departmentId: validDeptId || null,
          phone: phone || null,
          isActive: true,
          status: 'ACTIVE',
          mustChangePassword: mustChangePassword !== undefined ? !!mustChangePassword : true,
          createdBy: createdBy || null,
          createdByRole: createdByRole || null,
          createdById: createdById || null,
        },
        include: { department: true }
      })
      userId = user.id
    }

    // Link or Create Profile (Faculty or Student)
    let profile: any = null

    if (targetRole === 'STUDENT') {
      const regNo = registerNumber
        ? registerNumber.trim()
        : `REG${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`

      const existingStudent = await tx.student.findFirst({
        where: {
          OR: [
            { registerNumber: regNo },
            { email: normalizedEmail }
          ]
        }
      })

      if (existingStudent) {
        profile = await tx.student.update({
          where: { id: existingStudent.id },
          data: {
            name: normalizedName,
            email: normalizedEmail,
            phone: phone || undefined,
            ...(userId ? { userId } : {}),
            departmentId: validDeptId || existingStudent.departmentId,
            semester: semester ? parseInt(String(semester)) : existingStudent.semester,
            section: section || existingStudent.section,
            batch: batch || existingStudent.batch,
          },
          include: {
            user: { select: { id: true, email: true, name: true, role: true, status: true } },
            department: { select: { id: true, name: true, code: true } }
          }
        })
      } else {
        if (!validDeptId) {
          throw new Error('Department is required for Student creation')
        }
        profile = await tx.student.create({
          data: {
            registerNumber: regNo,
            name: normalizedName,
            email: normalizedEmail,
            phone: phone || null,
            userId: userId || null,
            departmentId: validDeptId,
            semester: semester ? parseInt(String(semester)) : 1,
            section: section || 'A',
            batch: batch || null,
          },
          include: {
            user: { select: { id: true, email: true, name: true, role: true, status: true } },
            department: { select: { id: true, name: true, code: true } }
          }
        })
      }
    } else if (targetRole === 'STAFF' || targetRole === 'HOD' || targetRole === 'ADMIN' || targetRole === 'SUPER_ADMIN') {
      if (validDeptId || targetRole === 'STAFF' || targetRole === 'HOD') {
        const empId = employeeId
          ? employeeId.trim()
          : `EMP${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`

        const existingFaculty = await tx.faculty.findFirst({
          where: {
            OR: [
              { employeeId: empId },
              { email: normalizedEmail }
            ]
          }
        })

        if (existingFaculty) {
          profile = await tx.faculty.update({
            where: { id: existingFaculty.id },
            data: {
              name: normalizedName,
              email: normalizedEmail,
              phone: phone || undefined,
              ...(userId ? { userId } : {}),
              departmentId: validDeptId || existingFaculty.departmentId,
              designation: designation || existingFaculty.designation,
              qualification: qualification || existingFaculty.qualification,
              isHOD: targetRole === 'HOD',
            },
            include: {
              user: { select: { id: true, email: true, name: true, role: true, status: true } },
              department: { select: { id: true, name: true, code: true } }
            }
          })
        } else if (validDeptId) {
          profile = await tx.faculty.create({
            data: {
              employeeId: empId,
              name: normalizedName,
              email: normalizedEmail,
              phone: phone || null,
              userId: userId || null,
              departmentId: validDeptId,
              designation: designation || (targetRole === 'HOD' ? 'Head of Department' : 'Assistant Professor'),
              qualification: qualification || null,
              isHOD: targetRole === 'HOD',
            },
            include: {
              user: { select: { id: true, email: true, name: true, role: true, status: true } },
              department: { select: { id: true, name: true, code: true } }
            }
          })
        }
      }
    }

    return {
      user,
      profile,
      loginAccess: Boolean(userId),
      rawPassword: finalRawPassword
    }
  }, {
    timeout: 15000,
    maxWait: 10000,
  })

  // Audit Log outside transaction using standalone db client (Pattern B)
  if (result.user) {
    try {
      await db.auditLog.create({
        data: {
          userId: result.user.id,
          action: 'CREATE_OR_UPDATE_USER',
          entityType: 'USER',
          entityId: result.user.id,
          newValue: JSON.stringify({
            role: result.user.role,
            email: result.user.email,
            createLoginAccess,
            createdBy: createdBy || 'System'
          })
        }
      })
    } catch (auditErr) {
      console.warn('Non-critical audit log creation skipped:', auditErr)
    }
  }

  return result
}
