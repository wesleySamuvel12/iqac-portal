import { db } from '@/lib/db'
import { UserRole, ActivityType, ResearchType, AchievementType, PatentStatus, BookType, ProjectType, ProjectStatus, ConsultancyStatus, ApprovalStage, ApprovalStatus, NotificationType, DocumentCategory, EntityType } from '@prisma/client'

const DEPARTMENTS = [
  { name: 'Computer Science and Engineering', code: 'CSE', vision: 'To be a center of excellence in computer science education and research', mission: 'To produce competent computer science professionals with ethical values' },
  { name: 'Artificial Intelligence & Data Science', code: 'AI&DS', vision: 'To excel in AI and Data Science education and innovation', mission: 'To nurture future leaders in AI and Data Science' },
  { name: 'Information Technology', code: 'IT', vision: 'To be a premier department for IT education', mission: 'To produce industry-ready IT professionals' },
  { name: 'Electronics & Communication Engineering', code: 'ECE', vision: 'Excellence in Electronics and Communication engineering', mission: 'To produce skilled ECE professionals' },
  { name: 'Electrical & Electronics Engineering', code: 'EEE', vision: 'Leadership in Electrical Engineering education', mission: 'To develop competent electrical engineers' },
  { name: 'Mechanical Engineering', code: 'MECH', vision: 'Excellence in Mechanical Engineering', mission: 'To produce innovative mechanical engineers' },
  { name: 'Civil Engineering', code: 'CIVIL', vision: 'Leadership in Civil Engineering', mission: 'To develop skilled civil engineers' },
  { name: 'Mathematics', code: 'MATHS', vision: 'Excellence in Mathematical Sciences', mission: 'To promote mathematical thinking and applications' },
  { name: 'Physics', code: 'PHY', vision: 'Excellence in Physics education and research', mission: 'To advance physics knowledge' },
  { name: 'Chemistry', code: 'CHEM', vision: 'Excellence in Chemical Sciences', mission: 'To promote chemistry education and research' },
  { name: 'English', code: 'ENG', vision: 'Excellence in Language and Communication', mission: 'To enhance communication skills' },
  { name: 'MBA', code: 'MBA', vision: 'Center of excellence in Management Education', mission: 'To develop business leaders' },
  { name: 'MCA', code: 'MCA', vision: 'Excellence in Computer Applications', mission: 'To produce skilled IT professionals' },
  { name: 'Biotechnology', code: 'BIO', vision: 'Excellence in Biotechnology', mission: 'To advance biotech knowledge' },
  { name: 'Agricultural Engineering', code: 'AGRI', vision: 'Excellence in Agricultural Engineering', mission: 'To develop agricultural innovators' },
  { name: 'Biomedical Engineering', code: 'BME', vision: 'Excellence in Biomedical Engineering', mission: 'To produce biomedical engineers' },
  { name: 'Robotics & Automation', code: 'R&A', vision: 'Leadership in Robotics and Automation', mission: 'To produce robotics specialists' },
  { name: 'Mechatronics', code: 'MECHT', vision: 'Excellence in Mechatronics', mission: 'To develop mechatronics engineers' },
  { name: 'Cyber Security', code: 'CYBER', vision: 'Center of Excellence in Cyber Security', mission: 'To produce cyber security experts' },
  { name: 'Data Science', code: 'DS', vision: 'Excellence in Data Science', mission: 'To produce data science professionals' },
]

async function seed() {
  console.log('🌱 Starting database seeding...')

  // Create Institution
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

  // Create Departments
  const createdDepartments = []
  for (const dept of DEPARTMENTS) {
    const existing = await db.department.findUnique({ where: { code: dept.code } })
    if (!existing) {
      const created = await db.department.create({
        data: dept,
      })
      createdDepartments.push(created)
      console.log(`✅ Department created: ${dept.name}`)
    } else {
      createdDepartments.push(existing)
    }
  }

  // Create Admin User
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
    console.log('✅ Admin user created: admin@niet.ac.in / admin123')
  }

  // Create HOD, Staff, and Student users for each department
  for (const dept of createdDepartments) {
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

      // Create Faculty profile for HOD
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
      console.log(`✅ HOD created for ${dept.name}: ${hodEmail} / hod123`)
    }

    // Update department HOD
    await db.department.update({
      where: { id: dept.id },
      data: { hodId: hodUser?.id || existingHOD?.id },
    })

    // Staff Users (2 per department)
    for (let i = 1; i <= 2; i++) {
      const staffEmail = `staff_${dept.code.toLowerCase()}${i}@niet.ac.in`
      const existingStaff = await db.user.findUnique({ where: { email: staffEmail } })
      if (!existingStaff) {
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
      }
    }
    console.log(`✅ Staff created for ${dept.name}`)

    // Student Users (5 per department)
    for (let i = 1; i <= 5; i++) {
      const studentEmail = `student_${dept.code.toLowerCase()}${i}@niet.ac.in`
      const existingStudent = await db.user.findUnique({ where: { email: studentEmail } })
      if (!existingStudent) {
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
      }
    }
    console.log(`✅ Students created for ${dept.name}`)

    // Sample Activities for each department
    const sampleActivities = [
      { title: 'National Level Technical Symposium', type: 'EVENT', status: 'COMPLETED', participants: 500 },
      { title: 'Workshop on Emerging Technologies', type: 'WORKSHOP', status: 'PLANNED', participants: 100 },
      { title: 'Faculty Development Program', type: 'FDP', status: 'ONGOING', participants: 50 },
      { title: 'Industrial Visit to Tech Park', type: 'INDUSTRIAL_VISIT', status: 'COMPLETED', participants: 60 },
      { title: 'Guest Lecture by Industry Expert', type: 'GUEST_LECTURE', status: 'COMPLETED', participants: 150 },
    ]

    for (const activity of sampleActivities) {
      const existingActivity = await db.activity.findFirst({
        where: { title: activity.title, departmentId: dept.id },
      })
      if (!existingActivity) {
        await db.activity.create({
          data: {
            ...activity,
            description: `Sample ${activity.type} for ${dept.name}`,
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            venue: 'Main Auditorium',
            organizer: dept.name,
            departmentId: dept.id,
            approvalStatus: 'APPROVED',
          },
        })
      }
    }

    // Sample Research for each department
    const sampleResearch = [
      { title: 'Machine Learning Applications in Healthcare', type: 'JOURNAL', status: 'PUBLISHED', impactFactor: 3.5 },
      { title: 'IoT-Based Smart Agriculture System', type: 'CONFERENCE', status: 'PUBLISHED', impactFactor: null },
      { title: 'Deep Learning for Image Classification', type: 'JOURNAL', status: 'UNDER_REVIEW', impactFactor: null },
    ]

    for (const research of sampleResearch) {
      const existingResearch = await db.research.findFirst({
        where: { title: research.title, departmentId: dept.id },
      })
      if (!existingResearch) {
        await db.research.create({
          data: {
            ...research,
            description: `Research publication from ${dept.name}`,
            authors: JSON.stringify([`Dr. ${dept.code}`, 'Co-Author']),
            publishDate: new Date(),
            indexedIn: research.impactFactor ? 'Scopus' : null,
            citations: Math.floor(Math.random() * 50),
            departmentId: dept.id,
            approvalStatus: 'APPROVED',
          },
        })
      }
    }
  }

  // Create Settings
  const defaultSettings = [
    { key: 'institution_name', value: 'Nehru Institute of Engineering and Technology', category: 'INSTITUTION', description: 'Name of the institution' },
    { key: 'academic_year', value: '2024-2025', category: 'ACADEMIC', description: 'Current academic year' },
    { key: 'semester', value: 'Odd', category: 'ACADEMIC', description: 'Current semester' },
    { key: 'feedback_enabled', value: 'true', category: 'FEEDBACK', description: 'Enable feedback system' },
    { key: 'anonymous_feedback', value: 'true', category: 'FEEDBACK', description: 'Allow anonymous feedback' },
    { key: 'session_timeout', value: '30', category: 'SECURITY', description: 'Session timeout in minutes' },
    { key: 'max_file_size', value: '10485760', category: 'UPLOAD', description: 'Max file size in bytes (10MB)' },
  ]

  for (const setting of defaultSettings) {
    const existing = await db.setting.findUnique({ where: { key: setting.key } })
    if (!existing) {
      await db.setting.create({ data: setting })
    }
  }
  console.log('✅ Settings created')

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📋 Login Credentials:')
  console.log('─────────────────────────────────────')
  console.log('Admin:   admin@niet.ac.in / admin123')
  console.log('HODs:    hod_[deptcode]@niet.ac.in / hod123')
  console.log('Staff:   staff_[deptcode][1-2]@niet.ac.in / staff123')
  console.log('Students: student_[deptcode][1-5]@niet.ac.in / student123')
  console.log('─────────────────────────────────────')
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
