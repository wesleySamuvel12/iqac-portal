// Safe Prisma Select Definitions for Student and Faculty Models
// Prevents Prisma from selecting non-existent table columns on SQLite

export const studentSelectWithUser = {
  select: {
    id: true,
    registerNumber: true,
    rollNumber: true,
    userId: true,
    departmentId: true,
    batchId: true,
    semester: true,
    section: true,
    batch: true,
    cgpa: true,
    admissionYear: true,
    graduationYear: true,
    photo: true,
    approvalStatus: true,
    createdAt: true,
    updatedAt: true,
    user: {
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        status: true,
        departmentId: true,
      }
    },
    department: {
      select: {
        id: true,
        name: true,
        code: true,
      }
    }
  }
}

export const facultySelectWithUser = {
  select: {
    id: true,
    employeeId: true,
    userId: true,
    departmentId: true,
    designation: true,
    qualification: true,
    specialization: true,
    experience: true,
    dateOfJoining: true,
    researchArea: true,
    photo: true,
    isHOD: true,
    approvalStatus: true,
    createdAt: true,
    updatedAt: true,
    user: {
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        status: true,
        departmentId: true,
      }
    },
    department: {
      select: {
        id: true,
        name: true,
        code: true,
      }
    }
  }
}
