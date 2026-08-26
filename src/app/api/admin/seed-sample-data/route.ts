import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Comprehensive sample data for all 11 IQAC departments
const IQAC_DEPARTMENTS = [
  { name: 'Aeronautical Engineering', code: 'AER', shortName: 'Aero' },
  { name: 'Artificial Intelligence & Data Science', code: 'AI&DS', shortName: 'AI&DS' },
  { name: 'Computer Science and Business Systems', code: 'CSBS', shortName: 'CSBS' },
  { name: 'Computer Science and Engineering', code: 'CSE', shortName: 'CSE' },
  { name: 'Electronics & Communication Engineering', code: 'ECE', shortName: 'ECE' },
  { name: 'Electrical & Electronics Engineering', code: 'EEE', shortName: 'EEE' },
  { name: 'Information Technology', code: 'IT', shortName: 'IT' },
  { name: 'Mechatronics', code: 'MCT', shortName: 'MCT' },
  { name: 'Mechanical Engineering', code: 'MECH', shortName: 'MECH' },
  { name: 'MBA', code: 'MBA', shortName: 'MBA' },
  { name: 'Science & Humanities', code: 'S&H', shortName: 'S&H' },
]

// Indian names for realistic data
const FIRST_NAMES = [
  'Arjun', 'Priya', 'Rahul', 'Ananya', 'Vikram', 'Deepa', 'Karthik', 'Lakshmi',
  'Sanjay', 'Meera', 'Rajesh', 'Kavitha', 'Arun', 'Divya', 'Mohammed', 'Fatima',
  'Thomas', 'Sarah', 'David', 'Rebecca', 'Joseph', 'Maria', 'Daniel', 'Susan',
  'Naveen', 'Pooja', 'Suresh', 'Shalini', 'Venkat', 'Geetha', 'Prakash', 'Revathi',
  'Anil', 'Bhavani', 'Chandru', 'Durga', 'Eswar', 'Fathima', 'Ganesh', 'Harini'
]

const LAST_NAMES = [
  'Kumar', 'Sharma', 'Reddy', 'Patel', 'Nair', 'Menon', 'Iyer', 'Rao',
  'Gupta', 'Singh', 'Joshi', 'Das', 'Pillai', 'Varma', 'Mohan', 'Devi',
  'Abraham', 'Mathew', 'Thomas', 'David', 'Khan', 'Ali', 'Hussain', 'Shaikh'
]

const FACULTY_TITLES = ['Dr.', 'Prof.', 'Dr.']

const DESIGNATIONS = [
  'Assistant Professor',
  'Associate Professor', 
  'Professor',
  'Senior Lecturer',
]

const SPECIALIZATIONS: Record<string, string[]> = {
  'AER': ['Aerodynamics', 'Propulsion Systems', 'Avionics', 'Aircraft Structures'],
  'AI&DS': ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
  'CSBS': ['Network Security', 'Cryptography', 'Ethical Hacking', 'Digital Forensics'],
  'CSE': ['Software Engineering', 'Cloud Computing', 'IoT', 'Web Technologies'],
  'ECE': ['VLSI Design', 'Embedded Systems', 'Signal Processing', 'Communication Systems'],
  'EEE': ['Power Systems', 'Control Systems', 'Renewable Energy', 'Power Electronics'],
  'IT': ['Data Analytics', 'Mobile Computing', 'Enterprise Applications', 'IT Infrastructure'],
  'MCT': ['Robotics', 'Automation', 'Control Systems', 'Mechatronic Systems'],
  'MECH': ['Thermal Engineering', 'Manufacturing', 'Automotive Engineering', 'CAD/CAM'],
  'MBA': ['Finance', 'Marketing', 'HR Management', 'Operations Management'],
  'S&H': ['Applied Mathematics', 'Physics', 'Chemistry', 'English Communication'],
}

const ACTIVITY_TYPES = ['Workshop', 'Seminar', 'Conference', 'Symposium', 'FDP', 'Hackathon', 'Guest Lecture', 'Industrial Visit']

const ACTIVITY_TITLES: Record<string, string[]> = {
  'AER': ['Drone Technology Workshop', 'Aerodynamics Symposium', 'Aviation Safety Seminar', 'Aircraft Design Hackathon'],
  'AI&DS': ['Machine Learning Bootcamp', 'AI Ethics Conference', 'Data Science Symposium', 'Deep Learning Workshop'],
  'CSBS': ['Cybersecurity Workshop', 'Ethical Hacking Competition', 'Network Security Seminar', 'CTF Challenge'],
  'CSE': ['Full Stack Development Bootcamp', 'Cloud Computing Workshop', 'Open Source Symposium', 'Coding Contest'],
  'ECE': ['IoT Workshop', 'VLSI Design Seminar', 'Embedded Systems Hackathon', '5G Technology Conference'],
  'EEE': ['Smart Grid Workshop', 'Renable Energy Seminar', 'Electric Vehicle Symposium', 'Power Systems Conference'],
  'IT': ['Big Data Analytics Workshop', 'DevOps Bootcamp', 'Blockchain Seminar', 'Cloud Security Symposium'],
  'MCT': ['Robotics Workshop', 'Automation Expo', 'Industry 4.0 Seminar', 'Robo Competition'],
  'MECH': ['CAD/CAM Workshop', 'Thermal Engineering Seminar', '3D Printing Symposium', 'Design Competition'],
  'MBA': ['Entrepreneurship Summit', 'Marketing Strategy Workshop', 'Finance Analysis Seminar', 'Business Plan Contest'],
  'S&H': ['Research Methodology Workshop', 'Technical Writing Seminar', 'Innovation Symposium', 'Science Exhibition'],
}

const RESEARCH_TOPICS: Record<string, string[]> = {
  'AER': ['UAV Design Optimization', 'Composite Materials in Aviation', 'Turbine Efficiency Improvement'],
  'AI&DS': ['Transformer Architectures', 'Federated Learning', 'Explainable AI', 'GANs for Image Synthesis'],
  'CSBS': ['Post-Quantum Cryptography', 'Zero-Trust Architecture', 'AI-Powered Threat Detection'],
  'CSE': ['Microservices Architecture', 'Edge Computing', 'Quantum Computing Algorithms'],
  'ECE': ['6G Communication', 'Biomedical Signal Processing', 'Autonomous Vehicle Sensors'],
  'EEE': ['Smart Grid Optimization', 'EV Battery Technology', 'Solar Cell Efficiency'],
  'IT': ['Blockchain Scalability', 'Serverless Computing', 'Real-time Data Processing'],
  'MCT': ['Swarm Robotics', 'Collaborative Robots', 'Predictive Maintenance AI'],
  'MECH': ['Additive Manufacturing', 'CFD Simulation', 'Sustainable Materials'],
  'MBA': ['Consumer Behavior Analytics', 'Sustainable Business Models', 'FinTech Innovation'],
  'S&H': ['Nanomaterial Research', 'Environmental Chemistry', 'Computational Linguistics'],
}

const COMPANIES = [
  'TCS', 'Infosys', 'Wipro', 'HCL Tech', 'Tech Mahindra', 'Cognizant', 'Accenture',
  'Microsoft', 'Google', 'Amazon', 'IBM', 'Capgemini', 'Mphasis', 'LTI Mindtree',
  'Zoho', 'Freshworks', 'Oracle', 'SAP', 'Cisco', 'Intel', 'NVIDIA', 'Qualcomm'
]

function getRandomName(): string {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  return `${first} ${last}`
}

function getRandomFacultyName(title: boolean = true): string {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  return title ? `${FACULTY_TITLES[Math.floor(Math.random() * FACULTY_TITLES.length)]} ${first} ${last}` : `${first} ${last}`
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((min + Math.random() * (max - min)).toFixed(decimals))
}

export async function POST() {
  try {
    console.log('🚀 Starting comprehensive sample data seeding...')
    const results = {
      departments: 0,
      students: 0,
      faculty: 0,
      activities: 0,
      research: 0,
      achievements: 0,
      placements: 0,
      certifications: 0,
      patents: 0,
      projects: 0,
      internships: 0,
      awards: 0,
    }

    // Get or find the 11 IQAC departments (use existing or create new)
    const departments: any[] = []
    
    for (const dept of IQAC_DEPARTMENTS) {
      // Try to find by code first, then by name
      let department = await db.department.findUnique({ where: { code: dept.code } })
      
      if (!department) {
        // Try to find by name (case insensitive)
        const allDepts = await db.department.findMany()
        department = allDepts.find(d => 
          d.code === dept.code || 
          d.name.toLowerCase().includes(dept.name.toLowerCase()) ||
          dept.name.toLowerCase().includes(d.name.toLowerCase()) ||
          d.code?.toLowerCase() === dept.code.toLowerCase()
        )
      }
      
      // If still not found and it's AER (Aeronautical), try alternative codes
      if (!department && dept.code === 'AER') {
        department = await db.department.findFirst({
          where: { name: { contains: 'Aero' } }
        })
      }
      
      if (!department) {
        // Create only if absolutely not found
        try {
          department = await db.department.create({
            data: {
              name: dept.name,
              code: dept.code,
              description: `Department of ${dept.name}`,
              vision: `To be a center of excellence in ${dept.name}`,
              mission: `To produce competent professionals in ${dept.name}`,
              establishedYear: 2001 + IQAC_DEPARTMENTS.indexOf(dept),
              isActive: true,
            }
          })
          results.departments++
        } catch (e) {
          console.log(`   ⚠️ Could not create department ${dept.code}: ${e instanceof Error ? e.message : e}`)
          continue
        }
      }
      departments.push({ ...department, ...dept })
    }

    console.log(`✅ Found/Created ${departments.length} departments`)

    // Process each department
    for (const deptInfo of departments) {
      const deptId = deptInfo.id
      const code = deptInfo.code
      
      console.log(`\n📁 Processing ${code} (${deptInfo.name})...`)

      // ==================== STUDENTS ====================
      const studentCount = randomInt(25, 40)
      
      for (let i = 1; i <= studentCount; i++) {
        const regNum = `${code}${String(2024000 + i).padStart(7, '0')}`
        const email = `student_${code.toLowerCase()}${i}@niet.ac.in`
        
        try {
          let user = await db.user.findUnique({ where: { email } })
          
          if (!user) {
            user = await db.user.create({
              data: {
                email,
                password: 'student123',
                name: getRandomName(),
                role: 'STUDENT',
                departmentId: deptId,
                phone: `+91-${randomInt(7000000000, 9999999999)}`,
                isActive: true,
              }
            })
          }

          const existingStudent = await db.student.findUnique({ where: { registerNumber: regNum } })
          
          if (!existingStudent) {
            await db.student.create({
              data: {
                registerNumber: regNum,
                userId: user.id,
                departmentId: deptId,
                semester: ((i - 1) % 8) + 1,
                section: ['A', 'B', 'C'][i % 3],
                batch: ['2021-2025', '2022-2026', '2023-2027', '2024-2028'][i % 4],
                cgpa: randomFloat(6.0, 9.8),
                admissionYear: [2021, 2022, 2023, 2024][i % 4],
                graduationYear: [2025, 2026, 2027, 2028][i % 4],
              }
            })
            results.students++
          }
        } catch (e) {}
      }
      console.log(`   👨‍🎓 Added ${studentCount} students`)

      // ==================== FACULTY ====================
      const facultyCount = randomInt(10, 15)
      
      for (let i = 1; i <= facultyCount; i++) {
        const empId = `${code}${String(i).padStart(3, '0')}`
        const email = i === 1 
          ? `hod_${code.toLowerCase()}@niet.ac.in`
          : `faculty_${code.toLowerCase()}${i}@niet.ac.in`
        
        const isHOD = i === 1
        const specialization = SPECIALIZATIONS[code]?.[i % (SPECIALIZATIONS[code]?.length || 4)] || 'General'
        
        try {
          let user = await db.user.findUnique({ where: { email } })
          
          if (!user) {
            user = await db.user.create({
              data: {
                email,
                password: isHOD ? 'hod123' : 'staff123',
                name: getRandomFacultyName(),
                role: isHOD ? 'HOD' : 'STAFF',
                departmentId: deptId,
                phone: `+91-${randomInt(7000000000, 9999999999)}`,
                isActive: true,
              }
            })
          }

          const existingFaculty = await db.faculty.findUnique({ where: { employeeId: empId } })
          
          if (!existingFaculty) {
            await db.faculty.create({
              data: {
                employeeId: empId,
                userId: user.id,
                departmentId: deptId,
                designation: isHOD ? 'Professor & HOD' : DESIGNATIONS[i % DESIGNATIONS.length],
                qualification: i <= 3 ? 'Ph.D.' : (i <= 7 ? 'M.Tech., Ph.D. (Pursuing)' : 'M.E./M.Tech.'),
                specialization,
                experience: isHOD ? randomInt(15, 25) : randomInt(2, 18),
                dateOfJoining: new Date(2010 + (i % 14), (i % 12), 15),
                isHOD,
                approvalStatus: 'APPROVED',
              }
            })
            
            if (isHOD) {
              await db.department.update({
                where: { id: deptId },
                data: { hodId: user.id }
              })
            }
            
            results.faculty++
          }
        } catch (e) {}
      }
      console.log(`   👨‍🏫 Added ${facultyCount} faculty members`)

      // ==================== ACTIVITIES/EVENTS ====================
      const activityCount = randomInt(8, 12)
      const activityTitles = ACTIVITY_TITLES[code] || ['Technical Event', 'Workshop', 'Seminar']
      
      for (let i = 0; i < activityCount; i++) {
        const title = activityTitles[i % activityTitles.length] + (i >= activityTitles.length ? ` ${Math.ceil(i / activityTitles.length)}` : '')
        const type = ACTIVITY_TYPES[i % ACTIVITY_TYPES.length]
        const startDate = randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31))
        
        try {
          await db.activity.create({
            data: {
              title,
              type,
              description: `A comprehensive ${type.toLowerCase()} organized by the Department of ${deptInfo.name}. This event focuses on latest trends and technologies.`,
              startDate,
              endDate: new Date(startDate.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000),
              venue: ['Main Auditorium', 'Seminar Hall A', 'Conference Room', 'Smart Classroom', 'Online'][i % 5],
              organizer: deptInfo.name,
              participants: randomInt(50, 500),
              outcome: `Successfully conducted with ${randomInt(80, 100)}% positive feedback`,
              status: startDate < new Date() ? 'COMPLETED' : 'PLANNED',
              departmentId: deptId,
              conductedBy: `Dept of ${deptInfo.name}`,
              approvalStatus: 'APPROVED',
              approvedBy: 'System Administrator',
              approvedAt: new Date(),
            }
          })
          results.activities++
        } catch (e) {}
      }
      console.log(`   📅 Added ${activityCount} activities`)

      // ==================== RESEARCH PUBLICATIONS ====================
      const researchCount = randomInt(5, 10)
      const topics = RESEARCH_TOPICS[code] || ['Research Topic']
      
      for (let i = 0; i < researchCount; i++) {
        const topic = topics[i % topics.length]
        const pubTypes = ['JOURNAL', 'CONFERENCE', 'BOOK_CHAPTER']
        const type = pubTypes[i % pubTypes.length]
        
        try {
          await db.research.create({
            data: {
              title: `${topic}: A Comprehensive Study`,
              type,
              description: `Research publication on ${topic} from Department of ${deptInfo.name}`,
              authors: JSON.stringify([getRandomFacultyName(), getRandomFacultyName(false)].filter(Boolean)),
              publication: type === 'JOURNAL' ? 'International Journal of Engineering' : (type === 'CONFERENCE' ? 'IEEE International Conference' : 'Springer Book Series'),
              publisher: ['Elsevier', 'Springer', 'IEEE', 'Taylor & Francis', 'Wiley'][i % 5],
              doi: `10.1000/${code.toLowerCase()}-${i + 1}`,
              issn: 'XXXX-XXXX',
              volume: String(randomInt(1, 20)),
              issue: String(randomInt(1, 4)),
              pages: `${randomInt(1, 50)}-${randomInt(51, 150)}`,
              publishDate: randomDate(new Date(2023, 0, 1), new Date(2025, 0, 1)),
              indexedIn: ['Scopus', 'Web of Science', 'UGC Care', 'Both'][i % 4],
              impactFactor: randomFloat(1.5, 8.5),
              citations: randomInt(0, 100),
              url: `https://doi.org/10.1000/${code.toLowerCase()}-${i + 1}`,
              departmentId: deptId,
              status: 'PUBLISHED',
              approvalStatus: 'APPROVED',
            }
          })
          results.research++
        } catch (e) {}
      }
      console.log(`   📰 Added ${researchCount} research publications`)

      // ==================== PATENTS ====================
      const patentCount = randomInt(1, 3)
      
      for (let i = 0; i < patentCount; i++) {
        try {
          const faculties = await db.faculty.findMany({ where: { departmentId: deptId }, take: 5 })
          if (faculties.length > 0) {
            const faculty = faculties[i % faculties.length]
            const topic = topics[i % topics.length] || 'Innovation'
            
            await db.patent.create({
              data: {
                title: `Novel Approach to ${topic}`,
                patentNumber: `IN${2024}${String(randomInt(10000, 99999))}`,
                inventors: JSON.stringify([getRandomFacultyName(), getRandomFacultyName(false)]),
                filingDate: randomDate(new Date(2022, 0, 1), new Date(2024, 0, 1)),
                publishDate: randomDate(new Date(2023, 0, 1), new Date(2024, 6, 1)),
                grantDate: Math.random() > 0.5 ? randomDate(new Date(2024, 0, 1), new Date()) : null,
                status: ['FILED', 'PUBLISHED', 'GRANTED'][i % 3] as any,
                country: 'India',
                category: 'Product Patent',
                description: `A novel invention related to ${topic}`,
                facultyId: faculty.id,
              }
            })
            results.patents++
          }
        } catch (e) {
          // Silently skip patent errors
        }
      }
      console.log(`   📋 Added ${patentCount} patents`)

      // ==================== PROJECTS ====================
      const projectCount = randomInt(3, 6)
      
      for (let i = 0; i < projectCount; i++) {
        try {
          const faculties = await db.faculty.findMany({ where: { departmentId: deptId }, take: 5 })
          if (faculties.length > 0) {
            const topic = topics[i % topics.length] || 'Project'
            
            await db.project.create({
              data: {
                title: `${topic} Based System`,
                type: Math.random() > 0.5 ? 'SPONSORED' : 'SELF_FINANCED',
                description: `Development of an innovative system for ${topic.toLowerCase()}`,
                principalInvestigator: getRandomFacultyName(),
                coInvestigators: JSON.stringify([getRandomFacultyName(false)]),
                fundingAgency: Math.random() > 0.5 ? ['SERB', 'AICTE', 'ISRO', 'DRDO'][i % 4] : null,
                amount: Math.random() > 0.5 ? randomInt(500000, 5000000) : null,
                startDate: randomDate(new Date(2023, 0, 1), new Date(2024, 6, 1)),
                endDate: randomDate(new Date(2024, 6, 1), new Date(2026, 0, 1)),
                status: ['ONGOING', 'COMPLETED'][i % 2],
                outcomes: `Expected outcomes include publications and prototypes`,
                facultyId: faculties[i % faculties.length].id,
              }
            })
            results.projects++
          }
        } catch (e) {}
      }
      console.log(`   🔬 Added ${projectCount} projects`)

      // ==================== STUDENT ACHIEVEMENTS ====================
      const achievementCount = randomInt(5, 10)
      const achievementTypes = ['SPORTS', 'CULTURAL', 'TECHNICAL', 'ACADEMIC', 'PROJECT', 'COMPETITION', 'OTHER']
      const achievementLevels = ['Institution Level', 'State Level', 'National Level', 'International Level']
      
      for (let i = 0; i < achievementCount; i++) {
        try {
          const students = await db.student.findMany({ where: { departmentId: deptId }, take: 20 })
          if (students.length > 0) {
            const student = students[i % students.length]
            const type = achievementTypes[i % achievementTypes.length]
            const level = achievementLevels[Math.min(i, 3)]
            
            await db.studentAchievement.create({
              data: {
                title: `${type} Excellence Award`,
                type: type as any,
                description: `Achieved excellence in ${type} at ${level} competition`,
                achievedDate: randomDate(new Date(2024, 0, 1), new Date()),
                level,
                position: ['First Prize', 'Second Prize', 'Winner', 'Participant'][i % 4],
                organizedBy: ['NIET', 'Anna University', 'IEEE', 'ISTE'][i % 4],
                studentId: student.id,
                approvalStatus: 'APPROVED',
              }
            })
            results.achievements++
          }
        } catch (e) {}
      }
      console.log(`   🏆 Added ${achievementCount} achievements`)

      // ==================== PLACEMENTS ====================
      const placementCount = randomInt(10, 20)
      
      for (let i = 0; i < placementCount; i++) {
        try {
          const students = await db.student.findMany({ where: { departmentId: deptId }, take: 30 })
          if (students.length > 0) {
            const student = students[i % students.length]
            const company = COMPANIES[i % COMPANIES.length]
            
            await db.placement.create({
              data: {
                company,
                location: ['Chennai', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Pune', 'Remote'][i % 6],
                designation: ['Software Engineer', 'Analyst', 'Developer', 'Consultant', 'Engineer', 'Associate'][i % 6],
                packageLPA: randomFloat(3.5, 45.0),
                offerDate: randomDate(new Date(2024, 0, 1), new Date()),
                joiningDate: Math.random() > 0.5 ? randomDate(new Date(2024, 6, 1), new Date(2025, 0, 1)) : null,
                accepted: true,
                joined: Math.random() > 0.3,
                description: `Placement offer from ${company}`,
                studentId: student.id,
                approvalStatus: 'APPROVED',
              }
            })
            results.placements++
          }
        } catch (e) {}
      }
      console.log(`   💼 Added ${placementCount} placements`)

      // ==================== CERTIFICATIONS ====================
      const certificationCount = randomInt(8, 15)
      const certProviders = ['NPTEL', 'Coursera', 'edX', 'Udemy', 'Microsoft', 'Google', 'AWS', 'Cisco', 'IBM', 'SAP']
      const certNames: Record<string, string[]> = {
        'AER': ['CATIA Certification', 'ANSYS Professional', 'Aerospace Engineering'],
        'AI&DS': ['TensorFlow Developer', 'AWS ML Specialty', 'Deep Learning Specialization'],
        'CSBS': ['CEH', 'CompTIA Security+', 'CISSP Associate'],
        'CSE': ['AWS Solutions Architect', 'Java Certification', 'Full Stack Development'],
        'ECE': ['VLSI CAD', 'Embedded Systems', 'MATLAB Professional'],
        'EEE': ['AutoCAD Electrical', 'PLC Programming', 'SCADA Systems'],
        'IT': ['Azure Administrator', 'DevOps Engineer', 'Big Data Professional'],
        'MCT': ['ROS Certification', 'Arduino Expert', 'PLC & SCADA'],
        'MECH': ['SolidWorks Professional', 'AutoCAD Expert', 'CAM Certification'],
        'MBA': ['PMP', 'Six Sigma', 'Digital Marketing'],
        'S&H': ['Research Methodology', 'Technical Writing', 'Data Analysis'],
      }
      
      for (let i = 0; i < certificationCount; i++) {
        try {
          const faculties = await db.faculty.findMany({ where: { departmentId: deptId }, take: 15 })
          if (faculties.length > 0) {
            const faculty = faculties[i % faculties.length]
            const certs = certNames[code] || ['Professional Certification']
            const certName = certs[i % certs.length]
            
            await db.certification.create({
              data: {
                title: certName,
                issuer: certProviders[i % certProviders.length],
                certificateNumber: `CERT-${code}-${randomInt(10000, 99999)}`,
                issuedDate: randomDate(new Date(2023, 0, 1), new Date()),
                validUntil: Math.random() > 0.3 ? randomDate(new Date(2026, 0, 1), new Date(2030, 0, 1)) : null,
                credentialUrl: `https://verify.certs/${code.toLowerCase()}/${i + 1}`,
                facultyId: faculty.id,
                approvalStatus: 'APPROVED',
              }
            })
            results.certifications++
          }
        } catch (e) {}
      }
      console.log(`   📜 Added ${certificationCount} certifications`)

      // ==================== INTERNSHIPS ====================
      const internshipCount = randomInt(8, 15)
      
      for (let i = 0; i < internshipCount; i++) {
        try {
          const students = await db.student.findMany({ where: { departmentId: deptId }, take: 30 })
          if (students.length > 0) {
            const student = students[i % students.length]
            const company = COMPANIES[(i + 5) % COMPANIES.length]
            
            await db.internship.create({
              data: {
                company,
                location: ['Chennai', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Pune', 'Remote'][i % 6],
                domain: ['Development', 'Testing', 'Analytics', 'Design', 'Research', 'Support'][i % 6],
                startDate: randomDate(new Date(2024, 0, 1), new Date(2024, 6, 1)),
                endDate: randomDate(new Date(2024, 6, 1), new Date(2025, 0, 1)),
                stipend: Math.random() > 0.3 ? randomInt(5000, 50000) : null,
                offerLetter: true,
                completionCert: true,
                description: `Internship at ${company}`,
                studentId: student.id,
                supervisor: getRandomFacultyName(),
                supervisorEmail: `supervisor@${company.toLowerCase().replace(/\s/g, '')}.com`,
                approvalStatus: 'APPROVED',
              }
            })
            results.internships++
          }
        } catch (e) {}
      }
      console.log(`   🏢 Added ${internshipCount} internships`)

      // ==================== AWARDS (Faculty Awards) ====================
      const awardCount = randomInt(3, 6)
      const awardCategories = ['Teaching Excellence', 'Research Publication', 'Best Project Guide', 'Innovation', 'Community Service']
      
      for (let i = 0; i < awardCount; i++) {
        try {
          const faculties = await db.faculty.findMany({ where: { departmentId: deptId }, take: 10 })
          if (faculties.length > 0) {
            const faculty = faculties[i % faculties.length]
            
            await db.award.create({
              data: {
                title: `${awardCategories[i % awardCategories.length]} Award`,
                awardedBy: ['NIET', 'Anna University', 'IEI', 'ISTE', 'AICTE'][i % 5],
                awardDate: randomDate(new Date(2023, 0, 1), new Date()),
                category: awardCategories[i % awardCategories.length],
                level: ['Institution', 'State', 'National'][i % 3],
                description: `Recognized for excellence in ${awardCategories[i % awardCategories.length].toLowerCase()}`,
                facultyId: faculty.id,
              }
            })
            results.awards++
          }
        } catch (e) {}
      }
      console.log(`   🎖️ Added ${awardCount} awards`)
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 SAMPLE DATA SEEDING COMPLETED!')
    console.log('='.repeat(60))
    console.log(`
📊 SUMMARY:
───────────────────────────────────────────────
📁 Departments:     ${results.departments}
👨‍🎓 Students:        ${results.students}
👨‍🏫 Faculty:         ${results.faculty}
📅 Activities:       ${results.activities}
📰 Research Papers:  ${results.research}
📋 Patents:          ${results.patents}
🔬 Projects:         ${results.projects}
🏆 Achievements:     ${results.achievements}
💼 Placements:       ${results.placements}
📜 Certifications:   ${results.certifications}
🏢 Internships:      ${results.internships}
🎖️ Awards:           ${results.awards}
───────────────────────────────────────────────
✨ Total Records:    ${Object.values(results).reduce((a, b) => a + b, 0)}
    `)

    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully!',
      data: results
    })

  } catch (error) {
    console.error('❌ Error seeding sample data:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
