import { db } from '@/lib/db'

const DEPARTMENTS = [
  { name: 'Aeronautical Engineering', code: 'AERO', vision: 'To excel in Aeronautical Engineering education and research', mission: 'To produce skilled aeronautical engineers' },
  { name: 'Artificial Intelligence & Data Science', code: 'AI&DS', vision: 'To excel in AI and Data Science education and innovation', mission: 'To nurture future leaders in AI and Data Science' },
  { name: 'Computer Science and Business Systems', code: 'CSBS', vision: 'Center of excellence in Computer Science and Business Systems', mission: 'To produce industry-ready CSBS professionals' },
  { name: 'Computer Science and Engineering', code: 'CSE', vision: 'To be a center of excellence in computer science education and research', mission: 'To produce competent computer science professionals with ethical values' },
  { name: 'Electronics & Communication Engineering', code: 'ECE', vision: 'Excellence in Electronics and Communication engineering', mission: 'To produce skilled ECE professionals' },
  { name: 'Electrical & Electronics Engineering', code: 'EEE', vision: 'Leadership in Electrical Engineering education', mission: 'To develop competent electrical engineers' },
  { name: 'Information Technology', code: 'IT', vision: 'To be a premier department for IT education', mission: 'To produce industry-ready IT professionals' },
  { name: 'Mechatronics Engineering', code: 'MCT', vision: 'Excellence in Mechatronics Engineering', mission: 'To develop mechatronics engineers' },
  { name: 'Mechanical Engineering', code: 'MECH', vision: 'Excellence in Mechanical Engineering', mission: 'To produce innovative mechanical engineers' },
  { name: 'MBA', code: 'MBA', vision: 'Center of excellence in Management Education', mission: 'To develop business leaders' },
  { name: 'Science & Humanities', code: 'S&H', vision: 'Excellence in Science and Humanities education', mission: 'To promote fundamental scientific and humanistic thinking' },
]

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...')
  const results = { departments: 0, users: 0, activities: 0, research: 0, errors: [] as string[] }

  try {
    // Create Institution
    try {
      const existingInstitution = await db.institution.findFirst()
      if (!existingInstitution) {
        await db.institution.create({
          data: {
            name: 'Nehru Institute of Engineering and Technology',
            shortName: 'NIET',
            address: 'Thirumalayampalayam Road',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            pincode: '641105',
            country: 'India',
            phone: '+91-422-2653111',
            email: 'info@niet.ac.in',
            website: 'https://www.niet.ac.in',
            establishedYear: 2001,
            type: 'Autonomous',
            affiliation: 'Anna University',
            currentAcademicYear: '2024-2025',
            currentSemester: 'Odd',
          },
        })
        console.log('✅ Institution created')
      }
    } catch (e) {
      results.errors.push(`Institution: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }

    // Create Departments
    const createdDepartments: any[] = []
    for (const dept of DEPARTMENTS) {
      try {
        const existing = await db.department.findUnique({ where: { code: dept.code } })
        if (!existing) {
          const created = await db.department.create({ data: dept })
          createdDepartments.push(created)
          results.departments++
        } else {
          createdDepartments.push(existing)
        }
      } catch (e) {
        results.errors.push(`Department ${dept.code}: ${e instanceof Error ? e.message : 'Unknown error'}`)
      }
    }
    console.log(`✅ Departments processed: ${createdDepartments.length}`)

    // Create Admin User
    try {
      const existingAdmin = await db.user.findUnique({ where: { email: 'admin@niet.ac.in' } })
      if (!existingAdmin) {
        await db.user.create({
          data: {
            email: 'admin@niet.ac.in',
            password: 'admin123',
            name: 'System Administrator',
            role: 'ADMIN',
            phone: '+91-9876543210',
            isActive: true,
          },
        })
        results.users++
        console.log('✅ Admin user created')
      }
    } catch (e) {
      results.errors.push(`Admin user: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }

    // Create HOD, Staff, and Student users for each department
    for (const dept of createdDepartments) {
      try {
        // HOD User
        const hodEmail = `hod_${dept.code.toLowerCase()}@niet.ac.in`
        const existingHOD = await db.user.findUnique({ where: { email: hodEmail } })
        let hodUser = existingHOD
        if (!existingHOD) {
          hodUser = await db.user.create({
            data: {
              email: hodEmail,
              password: 'hod123',
              name: `Dr. ${dept.code} HOD`,
              role: 'HOD',
              departmentId: dept.id,
              isActive: true,
            },
          })

          try {
            await db.faculty.create({
              data: {
                employeeId: `HOD${dept.code}`,
                userId: hodUser.id,
                departmentId: dept.id,
                designation: 'Professor & Head of Department',
                qualification: 'Ph.D.',
                specialization: `${dept.name} Specialization`,
                experience: 15,
                dateOfJoining: new Date('2010-01-15'),
                isHOD: true,
              },
            })
          } catch (_) {}
          results.users++
        }

        // Update department HOD
        try {
          await db.department.update({
            where: { id: dept.id },
            data: { hodId: hodUser?.id || existingHOD?.id },
          })
        } catch (_) {}

        // Staff Users (2 per department)
        for (let i = 1; i <= 2; i++) {
          const staffEmail = `staff_${dept.code.toLowerCase()}${i}@niet.ac.in`
          const existingStaff = await db.user.findUnique({ where: { email: staffEmail } })
          if (!existingStaff) {
            try {
              const staffUser = await db.user.create({
                data: {
                  email: staffEmail,
                  password: 'staff123',
                  name: `${dept.code} Staff ${i}`,
                  role: 'STAFF',
                  departmentId: dept.id,
                  isActive: true,
                },
              })

              try {
                await db.faculty.create({
                  data: {
                    employeeId: `STF${dept.code}${i}`,
                    userId: staffUser.id,
                    departmentId: dept.id,
                    designation: i === 1 ? 'Assistant Professor' : 'Associate Professor',
                    qualification: i === 1 ? 'M.Tech., Ph.D. (Pursuing)' : 'Ph.D.',
                    specialization: `${dept.name} Research Area`,
                    experience: 5 + i * 2,
                    dateOfJoining: new Date(`${2015 + i}-06-01`),
                  },
                })
              } catch (_) {}
              results.users++
            } catch (_) {}
          }
        }

        // Student Users (3 per department - reduced from 5 for speed)
        for (let i = 1; i <= 3; i++) {
          const studentEmail = `student_${dept.code.toLowerCase()}${i}@niet.ac.in`
          const existingStudent = await db.user.findUnique({ where: { email: studentEmail } })
          if (!existingStudent) {
            try {
              const studentUser = await db.user.create({
                data: {
                  email: studentEmail,
                  password: 'student123',
                  name: `${dept.code} Student ${i}`,
                  role: 'STUDENT',
                  departmentId: dept.id,
                  isActive: true,
                },
              })

              try {
                await db.student.create({
                  data: {
                    registerNumber: `${dept.code}${String(2024000 + i).padStart(7, '0')}`,
                    userId: studentUser.id,
                    departmentId: dept.id,
                    semester: (i % 8) + 1,
                    section: ['A', 'B'][i % 2],
                    batch: '2024-2028',
                    cgpa: parseFloat((7.5 + Math.random() * 2).toFixed(2)),
                    admissionYear: 2024,
                  },
                })
              } catch (_) {}
              results.users++
            } catch (_) {}
          }
        }

        // Sample Activities (2 per department)
        const sampleActivities = [
          { title: `${dept.name} - Technical Symposium`, type: 'EVENT', status: 'COMPLETED', participants: 500 },
          { title: `${dept.name} - Workshop`, type: 'WORKSHOP', status: 'PLANNED', participants: 100 },
        ]

        for (const activity of sampleActivities) {
          try {
            await db.activity.create({
              data: {
                ...(activity as any),
                description: `Sample activity for ${dept.name}`,
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                venue: 'Main Auditorium',
                organizer: dept.name,
                departmentId: dept.id,
                approvalStatus: 'APPROVED',
              },
            })
            results.activities++
          } catch (_) {}
        }

        // Sample Research (1 per department)
        try {
          await db.research.create({
            data: {
              title: `Research Publication from ${dept.name}`,
              type: 'JOURNAL',
              status: 'PUBLISHED',
              description: `Research publication from ${dept.name}`,
              authors: JSON.stringify([`Dr. ${dept.code}`, 'Co-Author']),
              publishDate: new Date(),
              indexedIn: 'Scopus',
              citations: Math.floor(Math.random() * 50),
              impactFactor: 3.5,
              departmentId: dept.id,
              approvalStatus: 'APPROVED',
            },
          })
          results.research++
        } catch (_) {}

      } catch (e) {
        results.errors.push(`Department processing ${dept.code}: ${e instanceof Error ? e.message : 'Unknown error'}`)
      }
    }

    // Create Settings
    const defaultSettings = [
      { key: 'institution_name', value: 'Nehru Institute of Engineering and Technology', category: 'INSTITUTION', description: 'Name of the institution' },
      { key: 'academic_year', value: '2024-2025', category: 'ACADEMIC', description: 'Current academic year' },
      { key: 'semester', value: 'Odd', category: 'ACADEMIC', description: 'Current semester' },
    ]

    for (const setting of defaultSettings) {
      try {
        const existing = await db.setting.findUnique({ where: { key: setting.key } })
        if (!existing) {
          await db.setting.create({ data: setting })
        }
      } catch (_) {}
    }

    console.log('\n🎉 Database seeding completed!')
    console.log(`📊 Results: ${results.departments} departments, ${results.users} users, ${results.activities} activities, ${results.research} research papers`)
    if (results.errors.length > 0) {
      console.log(`⚠️ ${results.errors.length} errors (non-critical):`)
      results.errors.slice(0, 5).forEach(e => console.log(`   - ${e}`))
    }
    
    return { success: true, ...results }
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}
