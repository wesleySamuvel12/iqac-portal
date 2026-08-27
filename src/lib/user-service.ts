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
  const targetRole = (role as string).toUpperCase() as UserRole

  return await db.$transaction(async (tx) => {
    let userId: string | null = null
    let user: any = null

    // If login access is requested, create or update central User record
    if (createLoginAccess) {
      const rawPassword = password && password.trim() ? password.trim() : '12345678'
      const hashedPassword = await hashPassword(rawPassword)

      // Upsert User
      user = await tx.user.upsert({
        where: { email: normalizedEmail },
        update: {
          name: normalizedName,
          phone: phone || undefined,
          role: targetRole,
          departmentId: departmentId || undefined,
          isActive: true,
          status: 'ACTIVE',
          ...(password ? { password: hashedPassword } : {}),
        },
        create: {
          name: normalizedName,
          email: normalizedEmail,
          password: hashedPassword,
          role: targetRole,
          departmentId: departmentId || undefined,
          phone: phone || null,
          isActive: true,
          status: 'ACTIVE',
          mustChangePassword: !!mustChangePassword,
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
            departmentId: departmentId || existingStudent.departmentId,
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
        if (!departmentId) {
          throw new Error('Department is required for Student creation')
        }
        profile = await tx.student.create({
          data: {
            registerNumber: regNo,
            name: normalizedName,
            email: normalizedEmail,
            phone: phone || null,
            userId: userId || null,
            departmentId,
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
      if (departmentId || targetRole === 'STAFF' || targetRole === 'HOD') {
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
              departmentId: departmentId || existingFaculty.departmentId,
              designation: designation || existingFaculty.designation,
              qualification: qualification || existingFaculty.qualification,
              isHOD: targetRole === 'HOD',
            },
            include: {
              user: { select: { id: true, email: true, name: true, role: true, status: true } },
              department: { select: { id: true, name: true, code: true } }
            }
          })
        } else if (departmentId) {
          profile = await tx.faculty.create({
            data: {
              employeeId: empId,
              name: normalizedName,
              email: normalizedEmail,
              phone: phone || null,
              userId: userId || null,
              departmentId,
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

    // Audit log
    if (user) {
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE_OR_UPDATE_USER',
          entityType: 'USER',
          entityId: user.id,
          newValue: JSON.stringify({
            role: user.role,
            email: user.email,
            createLoginAccess,
            createdBy: createdBy || 'System'
          })
        }
      })
    }

    return {
      user,
      profile,
      loginAccess: Boolean(userId),
    }
  })
}
