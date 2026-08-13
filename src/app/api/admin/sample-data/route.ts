import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample Data for IQAC Portal - Comprehensive Achievement Data
export async function POST(request: NextRequest) {
  try {
    // Check for force refresh parameter
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('force') === 'true'
    
    // Check if sample data already exists
    const existingAchievements = await prisma.studentAchievement.count()
    if (existingAchievements > 10 && !forceRefresh) {
      return NextResponse.json({ 
        success: true, 
        message: `Sample data already exists (${existingAchievements} achievements found). Use ?force=true to refresh.`,
        data: { existing: true }
      })
    }
    
    // If force refresh, delete existing sample data first
    if (forceRefresh && existingAchievements > 0) {
      console.log('Force refreshing sample data...')
      await prisma.studentAchievement.deleteMany({})
      await prisma.placement.deleteMany({})
      await prisma.internship.deleteMany({})
      await prisma.studentCertification.deleteMany({})
      await prisma.activity.deleteMany({
        where: { title: { contains: 'Sample' } }
      })
    }

    // Get all students and departments
    const students = await prisma.student.findMany({
      include: {
        user: { select: { name: true } },
        department: { select: { name: true, code: true } }
      }
    })

    const departments = await prisma.department.findMany()
    
    if (students.length === 0) {
      // Create minimal sample data first
      await createMinimalSampleData(departments)
      return NextResponse.json({ 
        success: true, 
        message: 'Created base sample data. Please run again to populate achievements.',
        data: { created: true }
      })
    }

    // Create Sample Achievements across all categories
    const achievements = generateSampleAchievements(students)
    
    // Insert achievements in batches
    const createdAchievements = []
    for (const achievement of achievements) {
      try {
        const created = await prisma.studentAchievement.create({
          data: achievement
        })
        createdAchievements.push(created)
      } catch (e) {
        // Skip duplicates or errors
      }
    }

    // Create Sample Placements
    const placements = generateSamplePlacements(students)
    for (const placement of placements) {
      try {
        await prisma.placement.create({ data: placement })
      } catch (e) {}
    }

    // Create Sample Internships
    const internships = generateSampleInternships(students)
    for (const internship of internships) {
      try {
        await prisma.internship.create({ data: internship })
      } catch (e) {}
    }

    // Create Sample Certifications
    const certifications = generateSampleCertifications(students)
    for (const cert of certifications) {
      try {
        await prisma.studentCertification.create({ data: cert })
      } catch (e) {}
    }

    // Create Sample Events/Activities
    const activities = generateSampleActivities(departments)
    for (const activity of activities) {
      try {
        await prisma.activity.create({ data: activity })
      } catch (e) {}
    }

    // Create Sample Research Papers
    const researchPapers = generateSampleResearch(departments)
    for (const paper of researchPapers) {
      try {
        await prisma.research.create({ data: paper })
      } catch (e) {}
    }

    // Create Sample Faculty Awards
    const facultyList = await prisma.faculty.findMany({
      include: { user: { select: { name: true } }, department: { select: { id: true } } }
    })
    const awards = generateSampleFacultyAwards(facultyList)
    for (const award of awards) {
      try {
        await prisma.award.create({ data: award })
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      message: `Successfully populated sample data`,
      data: {
        achievements: createdAchievements.length,
        placements: placements.length,
        internships: internships.length,
        certifications: certifications.length,
        activities: activities.length,
        researchPapers: researchPapers.length,
        facultyAwards: awards.length
      }
    })

  } catch (error) {
    console.error('Sample data error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create sample data' },
      { status: 500 }
    )
  }
}

async function createMinimalSampleData(departments: any[]) {
  // Create sample users and students for each department
  const deptNames = ['Computer Science and Engineering', 'Electronics & Communication Engineering', 
                     'Mechanical Engineering', 'Information Technology', 'Artificial Intelligence & Data Science']
  
  for (let d = 0; d < Math.min(5, departments.length); d++) {
    const dept = departments.find(dep => deptNames.includes(dep.name)) || departments[d]
    if (!dept) continue
    
    for (let i = 1; i <= 5; i++) {
      const email = `student${d}${i}@niet.ac.in`
      try {
        const user = await prisma.user.create({
          data: {
            email,
            password: 'sample123',
            name: `Student ${String.fromCharCode(65+d)}${i}`,
            role: 'STUDENT',
            departmentId: dept.id
          }
        })
        
        await prisma.student.create({
          data: {
            registerNumber: `${dept.code || 'DEPT'}2024${String(i).padStart(3, '0')}`,
            userId: user.id,
            departmentId: dept.id,
            batch: '2024-2025',
            semester: 5,
            section: 'A',
            admissionYear: 2024,
            approvalStatus: 'APPROVED'
          }
        })
      } catch (e) {}
    }
  }
}

function generateSampleAchievements(students: any[]) {
  const sportsAchievements = [
    { title: 'State Level Cricket Tournament', level: 'State Level', position: '1st Prize', organizedBy: 'Tamil Nadu Sports Authority' },
    { title: 'National Athletics Meet', level: 'National Level', position: '2nd Prize', organizedBy: 'AIU' },
    { title: 'Inter-College Football Championship', level: 'State Level', position: '1st Prize', organizedBy: 'Anna University' },
    { title: 'District Level Badminton Tournament', level: 'State Level', position: '3rd Prize', organizedBy: 'Coimbatore District' },
    { title: 'National Level Swimming Competition', level: 'National Level', position: 'Participation', organizedBy: 'SFI' },
  ]
  
  const culturalAchievements = [
    { title: 'Inter-College Dance Competition', level: 'State Level', position: '1st Prize', organizedBy: 'Cultural Forum' },
    { title: 'National Level Music Festival', level: 'National Level', position: '2nd Prize', organizedBy: 'Spic Macay' },
    { title: 'Drama Festival - Best Actor', level: 'State Level', position: 'Best Performer', organizedBy: 'Tamil Nadu Arts' },
    { title: 'Youth Festival - Painting', level: 'National Level', position: '3rd Prize', organizedBy: 'MOE' },
  ]
  
  const technicalAchievements = [
    { title: 'Smart India Hackathon Finalist', level: 'National Level', position: 'Finalist', organizedBy: 'MHRD' },
    { title: 'Project Expo Innovation Award', level: 'State Level', position: '1st Prize', organizedBy: 'IIT Madras' },
    { title: 'Coding Contest Winner', level: 'National Level', position: '1st Prize', organizedBy: 'HackerRank' },
    { title: 'Robotics Competition Runner-up', level: 'State Level', position: '2nd Prize', organizedBy: 'NIT Trichy' },
    { title: 'Web Development Challenge', level: 'International Level', position: 'Participation', organizedBy: 'Google' },
  ]
  
  const academicAchievements = [
    { title: 'University Rank Holder - 8th Rank', level: 'State Level', position: '8th Rank', organizedBy: 'Anna University' },
    { title: 'NPTEL Topper - Gold Medal', level: 'National Level', position: 'Gold Medal', organizedBy: 'IIT Madras/NPTEL' },
    { title: 'Semester Topper - 9.5 CGPA', level: 'Institution Level', position: '1st Position', organizedBy: 'NIET' },
    { title: 'Best Project Award - Final Year', level: 'State Level', position: '1st Prize', organizedBy: 'AU' },
  ]

  const allAchievements = [
    ...sportsAchievements.map(a => ({ ...a, type: 'SPORTS' as const })),
    ...culturalAchievements.map(a => ({ ...a, type: 'CULTURAL' as const })),
    ...technicalAchievements.map(a => ({ ...a, type: 'TECHNICAL' as const })),
    ...academicAchievements.map(a => ({ ...a, type: 'ACADEMIC' as const })),
  ]

  // Distribute achievements among students
  const result = []
  let achievementIndex = 0
  
  for (let i = 0; i < Math.min(students.length, 25); i++) {
    const student = students[i]
    
    // Add 1-2 achievements per student
    const numAchievements = (i % 3) + 1
    for (let j = 0; j < numAchievements && achievementIndex < allAchievements.length * 2; j++) {
      const ach = allAchievements[achievementIndex % allAchievements.length]
      
      result.push({
        title: ach.title,
        type: ach.type,
        description: `Outstanding performance in ${ach.title.toLowerCase()} representing NIET at ${ach.level.toLowerCase()}`,
        // Use dates between August 2025 and August 2026 for current reporting period
        achievedDate: new Date(2025, Math.floor((achievementIndex % 13) + 0), Math.floor(Math.random() * 28) + 1),
        level: ach.level,
        position: ach.position,
        organizedBy: ach.organizedBy,
        studentId: student.id,
        approvalStatus: 'APPROVED'
      })
      achievementIndex++
    }
  }
  
  return result
}

function generateSamplePlacements(students: any[]) {
  const companies = [
    { company: 'TCS', packageLPA: 4.5, designation: 'System Engineer' },
    { company: 'Infosys', packageLPA: 4.2, designation: 'Systems Engineer' },
    { company: 'Wipro', packageLPA: 4.0, designation: 'Project Engineer' },
    { company: 'Cognizant', packageLPA: 5.0, designation: 'Programmer Analyst' },
    { company: 'HCL Technologies', packageLPA: 4.5, designation: 'Software Engineer' },
    { company: 'Tech Mahindra', packageLPA: 4.2, designation: 'Associate Engineer' },
    { company: 'Amazon', packageLPA: 12.0, designation: 'SDE-I' },
    { company: 'Microsoft', packageLPA: 18.0, designation: 'Software Engineer' },
    { company: 'Google', packageLPA: 24.0, designation: 'Software Engineer' },
    { company: 'Accenture', packageLPA: 4.8, designation: 'Application Developer' },
  ]
  
  return students.slice(0, 15).map((student, idx) => ({
    company: companies[idx % companies.length].company,
    location: ['Chennai', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Pune'][idx % 5],
    designation: companies[idx % companies.length].designation,
    packageLPA: companies[idx % companies.length].packageLPA,
    // Dates between Aug 2025 and Aug 2026
    offerDate: new Date(2025, (idx % 12) + 1, 15),
    studentId: student.id,
    accepted: true,
    joined: idx < 10,
    approvalStatus: 'APPROVED'
  }))
}

function generateSampleInternships(students: any[]) {
  const internships = [
    { company: 'Microsoft Research', domain: 'Machine Learning', stipend: 50000 },
    { company: 'Google Summer of Code', domain: 'Open Source Development', stipend: 30000 },
    { company: 'Amazon AWS', domain: 'Cloud Computing', stipend: 40000 },
    { company: 'TCS Innovation Lab', domain: 'IoT', stipend: 15000 },
    { company: 'Infosys R&D', domain: 'Data Analytics', stipend: 18000 },
    { company: 'Wipro Digital', domain: 'Full Stack Development', stipend: 16000 },
    { company: 'Zoho Corporation', domain: 'Product Development', stipend: 20000 },
    { company: 'Freshworks', domain: 'SaaS Development', stipend: 25000 },
  ]
  
  return students.slice(0, 12).map((student, idx) => ({
    company: internships[idx % internships.length].company,
    domain: internships[idx % internships.length].domain,
    stipend: internships[idx % internships.length].stipend,
    // Dates between Aug 2025 and Aug 2026
    startDate: new Date(2025, (idx % 10) + 1, 1),
    endDate: new Date(2025, ((idx % 10) + 3) % 12 + 1, 28),
    offerLetter: true,
    completionCert: idx < 8,
    description: `Internship project in ${internships[idx % internships.length].domain}`,
    studentId: student.id,
    approvalStatus: 'APPROVED'
  }))
}

function generateSampleCertifications(students: any[]) {
  const certs = [
    { title: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services' },
    { title: 'Google Cloud Professional', issuer: 'Google Cloud' },
    { title: 'Microsoft Azure Fundamentals', issuer: 'Microsoft' },
    { title: 'Python Programming Certificate', issuer: 'Coursera' },
    { title: 'Machine Learning Specialization', issuer: 'Stanford/Coursera' },
    { title: 'Full Stack Web Development', issuer: 'freeCodeCamp' },
    { title: 'Cybersecurity Fundamentals', issuer: 'Cisco' },
    { title: 'Data Science Professional', issuer: 'IBM' },
    { title: 'Java SE 11 Developer', issuer: 'Oracle' },
    { title: 'Project Management Professional', issuer: 'PMI' },
  ]
  
  return students.slice(0, 20).map((student, idx) => ({
    title: certs[idx % certs.length].title,
    issuer: certs[idx % certs.length].issuer,
    // Dates between Aug 2025 and Aug 2026
    issuedDate: new Date(2025, (idx % 12) + 1, 15),
    studentId: student.id,
    approvalStatus: 'APPROVED'
  }))
}

function generateSampleActivities(departments: any[]) {
  const events = [
    { title: 'National Conference on AI & ML', type: 'CONFERENCE', participants: 250 },
    { title: 'Workshop on Cloud Computing', type: 'WORKSHOP', participants: 100 },
    { title: 'Hackathon 2025', type: 'HACKATHON', participants: 50 },
    { title: 'FDP on Research Methodology', type: 'FDP', participants: 60 },
    { title: 'Technical Symposium - TechnoFest', type: 'SYMPOSIUM', participants: 300 },
    { title: 'Seminar on Cyber Security', type: 'SEMINAR', participants: 150 },
    { title: 'Industry Expert Talk - Data Science', type: 'SEMINAR', participants: 120 },
    { title: 'Workshop on IoT Applications', type: 'WORKSHOP', participants: 80 },
    { title: 'National Level Paper Presentation', type: 'CONFERENCE', participants: 200 },
    { title: 'Coding Bootcamp', type: 'WORKSHOP', participants: 90 },
  ]
  
  return events.map((event, idx) => ({
    title: event.title,
    type: event.type,
    description: `A ${event.type.toLowerCase()} conducted by the department with industry experts`,
    // Dates between Aug 2025 and Aug 2026
    startDate: new Date(2025, (idx % 10) + 1, 10 + (idx % 15)),
    endDate: new Date(2025, (idx % 10) + 1, 12 + (idx % 15)),
    venue: 'NIET Main Auditorium',
    organizer: departments[idx % departments.length]?.name || 'NIET',
    participants: event.participants,
    outcome: `Successful completion with ${event.participants} participants`,
    status: 'COMPLETED',
    departmentId: departments[idx % departments.length]?.id || departments[0]?.id,
    approvalStatus: 'APPROVED'
  }))
}

function generateSampleResearch(departments: any[]) {
  const papers = [
    { title: 'Deep Learning Approaches for Medical Image Analysis', type: 'JOURNAL', publication: 'IEEE Transactions', impactFactor: 4.5 },
    { title: 'IoT-Based Smart Agriculture System', type: 'CONFERENCE_PAPER', publication: 'ICICT', impactFactor: null },
    { title: 'Blockchain for Secure Healthcare Records', type: 'JOURNAL', publication: 'Springer', impactFactor: 3.8 },
    { title: 'Renewable Energy Integration in Smart Grids', type: 'JOURNAL', publication: 'Elsevier', impactFactor: 5.2 },
    { title: 'Machine Learning for Fraud Detection', type: 'CONFERENCE_PAPER', publication: 'ICML', impactFactor: null },
    { title: 'Autonomous Navigation using Computer Vision', type: 'JOURNAL', publication: 'ACM Computing', impactFactor: 4.1 },
    { title: 'Natural Language Processing for Tamil Language', type: 'CONFERENCE_PAPER', publication: 'ICON', impactFactor: null },
    { title: 'Cyber-Physical Systems for Industry 4.0', type: 'JOURNAL', publication: 'IEEE Access', impactFactor: 3.9 },
  ]
  
  return papers.map((paper, idx) => ({
    title: paper.title,
    type: paper.type,
    description: `Research publication on ${paper.title.toLowerCase()}`,
    authors: 'Dr. A, Dr. B, Student C',
    publication: paper.publication,
    publisher: paper.publication.includes('IEEE') ? 'IEEE' : 'Elsevier',
    // Dates between Aug 2025 and Aug 2026
    publishDate: new Date(2025, (idx % 10) + 1, 20),
    indexedIn: 'Scopus',
    impactFactor: paper.impactFactor,
    citations: Math.floor(Math.random() * 20),
    departmentId: departments[idx % departments.length]?.id || departments[0]?.id,
    status: 'PUBLISHED',
    approvalStatus: 'APPROVED'
  }))
}

function generateSampleFacultyAwards(faculty: any[]) {
  const awards = [
    { title: 'Best Teacher Award', category: 'Teaching', level: 'State Level' },
    { title: 'Outstanding Researcher Award', category: 'Research', level: 'National Level' },
    { title: 'Innovation Excellence Award', category: 'Innovation', level: 'International Level' },
    { title: 'Best Mentor Award', category: 'Mentoring', level: 'Institution Level' },
    { title: 'Industry Collaboration Award', category: 'Industry', level: 'State Level' },
  ]
  
  return faculty.slice(0, 10).map((f, idx) => ({
    title: awards[idx % awards.length].title,
    awardedBy: awards[idx % awards.length].category.includes('National') ? 'AICTE' : 
              awards[idx % awards.length].category.includes('International') ? 'IEEE' : 'NIET',
    category: awards[idx % awards.length].category,
    level: awards[idx % awards.length].level,
    description: `Recognized for excellence in ${awards[idx % awards.length].category.toLowerCase()}`,
    awardDate: new Date(2025, (idx % 6) + 1, 15),
    facultyId: f.id
  }))
}

// GET endpoint to check sample data status
export async function GET() {
  try {
    const [achievements, placements, internships, certifications, activities, research] = await Promise.all([
      prisma.studentAchievement.count(),
      prisma.placement.count(),
      prisma.internship.count(),
      prisma.studentCertification.count(),
      prisma.activity.count(),
      prisma.research.count()
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        achievements,
        placements,
        internships,
        certifications,
        activities,
        research,
        hasSampleData: achievements > 10 || placements > 5
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sample data status' },
      { status: 500 }
    )
  }
}
