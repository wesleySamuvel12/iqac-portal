import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Sample Data Seeding API for IQAC Portal
// This adds realistic achievement data for all 11 departments

const DEPARTMENTS = [
  'Aeronautical Engineering',
  'Artificial Intelligence & Data Science',
  'Computer Science and Engineering',
  'Cyber Security',
  'Electrical & Electronics Engineering',
  'Electronics & Communication Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Mechatronics',
  'MBA',
  'Science & Humanities'
]

// Sample student names
const STUDENT_NAMES = [
  'Arjun Kumar', 'Priya Sharma', 'Rahul Venkatesh', 'Sneha Rajan', 'Karthik Iyer',
  'Divya Narayanan', 'Sanjay Krishnan', 'Ananya Reddy', 'Vishnu Prasad', 'Meera Srinivasan',
  'Aditya Balaji', 'Kavya Chandran', 'Harsh Patel', 'Nisha Gupta', 'Ravi Shankar',
  'Pooja Menon', 'Arun Das', 'Lakshmi Nair', 'Deepak Joshi', 'Rekha Verma',
  'Manoj Babu', 'Swathi Devi', 'Gautham Raja', 'Bhavani Kumari', 'Prakash Rao',
  'Shalini Iyer', 'Vijay Mohan', 'Geetha Subramanian', 'Naveen Kumar', 'Radha Lakshmi'
]

// Sample faculty names
const FACULTY_NAMES = [
  'Dr. R. Ramamoorthy', 'Dr. K. Lakshmi', 'Prof. S. Suresh', 'Dr. M. Divya',
  'Prof. A. Arunachalam', 'Dr. P. Priya', 'Prof. V. Venkatraman', 'Dr. N. Nandhini',
  'Prof. T. Thangadurai', 'Dr. B. Bhuvana', 'Prof. C. Chandrasekar', 'Dr. G. Gayathri'
]

// Achievement titles by category
const SPORTS_ACHIEVEMENTS = [
  'Gold Medal in State Level Cricket Tournament',
  'Silver Medal in Inter-College Athletics - 100m Sprint',
  'Bronze in Zonal Badminton Championship',
  'First Prize in District Level Football League',
  'Best Player Award - Tamil Nadu Volleyball',
  'Gold in National Level Chess Competition',
  'Silver in Inter-University Kabaddi Tournament',
  'Bronze in State Swimming Championship',
  'Winner - College Annual Sports Day',
  'Participated in Khelo India University Games'
]

const CULTURAL_ACHIEVEMENTS = [
  'First Prize in Inter-College Classical Dance',
  'Best Singer - Cultural Fest "TechnoCult"',
  'Second Prize in Drama Competition at Anna University',
  'Winner - Debate Competition at National Level',
  'Best Actor Award - Theater Festival',
  'First Prize in Classical Music (Carnatic)',
  'Winner - Photography Contest "Lens 2024"',
  'Participated in Youth Parliament',
  'Best Organizer - Department Cultural Events',
  'Silver in Rangoli Competition at State Level'
]

const TECHNICAL_ACHIEVEMENTS = [
  'Winner - Smart India Hackathon 2024',
  'First Prize in Project Expo "InnovateX"',
  'Best Paper Presentation at IEEE Conference',
  'Winner - Coding Competition CodeStorm',
  'Second Prize in RoboRace Competition',
  'Certified AWS Solutions Architect',
  'Google Summer of Code Participant',
  'Hackathon Winner - TCS HackQuest',
  'Best Final Year Project Award',
  'Microsoft Learn Student Ambassador'
]

const ACADEMIC_ACHIEVEMENTS = [
  'University Rank Holder - Top 10',
  'Department Topper - Semester 6',
  'NPTEL Certification with Elite Badge',
  'Gold Medalist - Academic Excellence',
  'Best Outgoing Student Award',
  'Dean\'s List - Academic Excellence',
  '100% Attendance Award',
  'Subject Topper - Data Structures',
  'Scholarship Merit Award',
  'GPA 9.5+ Academic Excellence'
]

const RESEARCH_TITLES = [
  'Machine Learning Approaches for Disease Prediction',
  'IoT-Based Smart Agriculture Monitoring System',
  'Renewable Energy Integration in Smart Grids',
  'Cybersecurity Framework for Cloud Computing',
  'AI-Powered Traffic Management System',
  'Blockchain for Supply Chain Transparency',
  'Deep Learning for Medical Image Analysis',
  'Sustainable Materials for Construction',
  '5G Network Optimization Techniques',
  'Autonomous Navigation for UAV Systems'
]

const JOURNAL_NAMES = [
  'IEEE Transactions on Neural Networks',
  'Springer Journal of AI Research',
  'Elsevier - Expert Systems with Applications',
  'Scopus Indexed - ICTACT Journal',
  'UGC Care Listed - Indian Journal of CS',
  'Web of Science - Applied Intelligence',
  'Springer - Multimedia Tools and Applications',
  'IET - Software journal',
  'ACM Computing Surveys',
  'Taylor & Francis - Intelligent Automation'
]

const COMPANY_NAMES = [
  'TCS (Tata Consultancy Services)', 'Infosys', 'Wipro Technologies', 'Cognizant',
  'HCL Technologies', 'Tech Mahindra', 'Mphasis', 'LTIMindtree',
  'Zoho Corporation', 'Freshworks', 'Amazon', 'Microsoft',
  'Google', 'IBM India', 'Accenture', 'Capgemini',
  'TCS Digital', 'Infosys Power Programs', 'Zoho Corp', 'Fidelity'
]

const EVENT_TITLES: Record<string, string[]> = {
  WORKSHOP: [
    'Workshop on Machine Learning and Deep Learning',
    'Hands-on Workshop on Cloud Computing (AWS/Azure)',
    'Workshop on Cybersecurity and Ethical Hacking',
    'Full Stack Web Development Workshop',
    'Workshop on IoT and Embedded Systems',
    'Data Science with Python Workshop',
    'Workshop on Robotics and Automation',
    'Blockchain Technology Workshop',
    'Workshop on DevOps Practices',
    'AI/ML Industry Applications Workshop'
  ],
  SEMINAR: [
    'Seminar on Latest Trends in AI/ML',
    'Industry-Academia Interaction Seminar',
    'Seminar on Research Methodology',
    'Career Guidance Seminar by Industry Experts',
    'Seminar on Entrepreneurship and Startups',
    'Emerging Technologies Seminar Series',
    'Seminar on Intellectual Property Rights',
    'Research Publication Ethics Seminar',
    'Seminar on Soft Skills Development',
    'Industry Trends in IT Sector Seminar'
  ],
  GUEST_LECTURE: [
    'Guest Lecture by Distinguished Alumnus from Google',
    'Expert Talk on 5G Technologies',
    'Guest Lecture on Quantum Computing Basics',
    'Industry Expert Session on Product Development',
    'Guest Lecture by IIT Professor on Research',
    'Session on Career Planning by HR Leaders',
    'Guest Lecture on Innovation and Design Thinking',
    'Expert Talk on Data Privacy and Security',
    'Guest Lecture on Sustainable Technology',
    'Industry Leader Session on Leadership'
  ],
  FDP: [
    'Faculty Development Program on Outcome Based Education',
    'FDP on Research Paper Writing and Publications',
    'FDP on Advanced Teaching Methodologies',
    'Faculty Development on AI Tools in Education',
    'FDP on NAAC Accreditation Process',
    'Workshop on Patent Filing and IPR',
    'FDP on Curriculum Development',
    'Faculty Training on LMS Platforms',
    'FDP on Student Mentoring Techniques',
    'Research Grant Proposal Writing FDP'
  ],
  HACKATHON: [
    'Smart India Hackathon - Internal Selection',
    '24-Hour Codeathon Event',
    'AI/ML Hackathon Challenge',
    'Blockchain Hackathon',
    'IoT Innovation Hackathon',
    'Cybersecurity Capture The Flag',
    'Mobile App Development Hackathon',
    'Data Analytics Hackathon',
    'Social Impact Hackathon',
    'Open Source Contribution Hackathon'
  ],
  CONFERENCE: [
    'International Conference on Computational Intelligence',
    'National Conference on Emerging Technologies',
    'IEEE International Conference on Communication Systems',
    'Conference on Sustainable Engineering',
    'National Technical Symposium',
    'International Conference on Data Science',
    'Conference on Women in Engineering',
    'National Conference on Recent Innovations',
    'International Conference on Smart Systems',
    'Technical Conference on Future Technologies'
  ],
  INDUSTRIAL_VISIT: [
    'Industrial Visit to ISRO Trivandrum',
    'Visit to Tata Motors Plant',
    'IT Company Visit - Infosys Chennai',
    'Visit to BHEL Hyderabad',
    'Industrial Visit to Ashok Leyland',
    'Software Park Visit - Tidel Park',
    'Manufacturing Unit Visit',
    'Visit to Nuclear Power Corporation',
    'IT Infrastructure Visit - Amazon AWS',
    'Startup Ecosystem Visit - T-Hub'
  ]
}

function randomDate(startYear: number, endYear: number): Date {
  const start = new Date(startYear, 0, 1)
  const end = new Date(endYear, 11, 31)
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function recentDate(): Date {
  // Generate dates within last 12 months for current reporting period
  const now = new Date()
  const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  return new Date(twelveMonthsAgo.getTime() + Math.random() * (now.getTime() - twelveMonthsAgo.getTime()))
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function POST(request: NextRequest) {
  try {
    // Get query params for force seeding
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'
    
    // Check if data already exists
    const existingAchievements = await db.studentAchievement.count()
    const existingActivities = await db.activity.count()
    const existingPlacements = await db.placement.count()
    const existingInternships = await db.internship.count()
    const existingResearch = await db.research.count()
    
    // Only check for existing data if not forcing
    if (!force && (existingAchievements > 50 || existingActivities > 20)) {
      return NextResponse.json({
        success: true,
        message: `Sample data already exists (${existingAchievements} achievements, ${existingActivities} activities). Use ?force=true to re-seed.`,
        stats: { existingAchievements, existingActivities, existingPlacements, existingInternships, existingResearch }
      })
    }
    
    // If force is true and there's data, delete existing sample data first
    if (force && (existingAchievements > 0 || existingActivities > 0)) {
      console.log('Force mode: Clearing existing data...')
      try {
        await db.studentAchievement.deleteMany({})
        await db.nPCourse.deleteMany({})
        await db.hackathonParticipation.deleteMany({})
        await db.startup.deleteMany({})
        await db.studentCertification.deleteMany({})
        await db.placement.deleteMany({})
        await db.internship.deleteMany({})
        await db.patent.deleteMany({})
        await db.book.deleteMany({})
        await db.project.deleteMany({})
        await db.consultancy.deleteMany({})
        await db.certification.deleteMany({})
        await db.award.deleteMany({})
        await db.researchPublication.deleteMany({})
        await db.research.deleteMany({})
        await db.activity.deleteMany({})
        console.log('Existing data cleared')
      } catch (e) {
        console.log('Error clearing data:', e)
      }
    }

    // Get all departments
    const departments = await db.department.findMany({
      where: { isActive: true }
    })

    if (departments.length === 0) {
      return NextResponse.json({ success: false, error: 'No departments found' }, { status: 400 })
    }

    // Get all students and faculty
    const students = await db.student.findMany({
      include: { user: true, department: true }
    })
    const facultyList = await db.faculty.findMany({
      include: { user: true, department: true }
    })

    console.log(`Found ${students.length} students and ${facultyList.length} faculty`)

    let createdAchievements = 0
    let createdActivities = 0
    let createdPlacements = 0
    let createdInternships = 0
    let createdResearch = 0
    let createdPatents = 0
    let createdAwards = 0
    let createdCertifications = 0

    // ========== STUDENT ACHIEVEMENTS ==========
    if (students.length > 0) {
      const achievementTypes = ['SPORTS', 'CULTURAL', 'TECHNICAL', 'ACADEMIC']
      const levels = ['State Level', 'National Level', 'International Level', 'Institution Level', 'District Level', 'Zonal Level']

      for (const student of students) {
        // Add 1-3 achievements per student
        const numAchievements = randomInt(1, 3)
        
        for (let i = 0; i < numAchievements; i++) {
          const type = randomItem(achievementTypes)
          let title: string
          
          switch (type) {
            case 'SPORTS':
              title = randomItem(SPORTS_ACHIEVEMENTS)
              break
            case 'CULTURAL':
              title = randomItem(CULTURAL_ACHIEVEMENTS)
              break
            case 'TECHNICAL':
              title = randomItem(TECHNICAL_ACHIEVEMENTS)
              break
            default:
              title = randomItem(ACADEMIC_ACHIEVEMENTS)
          }

          try {
            await db.studentAchievement.create({
              data: {
                title,
                type: type as any,
                description: `${title} achieved by ${student.user?.name || 'Student'} from ${student.department?.name || 'department'} during academic year 2024-2025`,
                achievedDate: recentDate(),
                level: randomItem(levels),
                position: ['First Prize', 'Second Prize', 'Third Prize', 'Winner', 'Participant', 'Gold Medalist'][randomInt(0, 5)],
                organizedBy: ['Anna University', 'IEEE Student Branch', 'ISTE', 'NBA', 'Institution', 'Professional Body'][randomInt(0, 5)],
                studentId: student.id,
                approvalStatus: randomItem(['APPROVED', 'VERIFIED', 'PENDING'] as any),
                createdAt: recentDate()
              }
            })
            createdAchievements++
          } catch (e) {
            // Skip duplicates
          }
        }
      }
    }

    // ========== ACTIVITIES/EVENTS ==========
    for (const dept of departments) {
      const activityTypes = ['WORKSHOP', 'SEMINAR', 'GUEST_LECTURE', 'FDP', 'HACKATHON', 'CONFERENCE', 'INDUSTRIAL_VISIT']
      
      // Create 2-4 activities per department
      const numActivities = randomInt(2, 4)
      
      for (let i = 0; i < numActivities; i++) {
        const type = randomItem(activityTypes) as any
        const eventTitles = EVENT_TITLES[type] || EVENT_TITLES.WORKSHOP
        const title = randomItem(eventTitles)

        try {
          await db.activity.create({
            data: {
              title,
              type,
              description: `A comprehensive ${type.toLowerCase()} organized by ${dept.name} department focusing on current industry trends and practical applications.`,
              startDate: recentDate(),
              endDate: new Date(new Date().getTime() + randomInt(1, 3) * 86400000),
              venue: ['Seminar Hall A', 'Conference Room', 'Auditorium', 'Lab Complex', 'Online via Zoom', 'Smart Classroom'][randomInt(0, 5)],
              organizer: dept.name,
              participants: randomInt(30, 200),
              outcome: `Successfully conducted with positive feedback from ${randomInt(80, 100)}% participants`,
              status: 'COMPLETED',
              departmentId: dept.id,
              conductedBy: randomItem(FACULTY_NAMES),
              approvalStatus: 'APPROVED',
              createdAt: recentDate()
            }
          })
          createdActivities++
        } catch (e) {
          // Skip errors
        }
      }
    }

    // ========== PLACEMENTS ==========
    if (students.length > 0) {
      const finalYearStudents = students.filter(s => 
        s.year === 4 || s.semester >= 7 || Math.random() > 0.7
      )

      for (const student of finalYearStudents.slice(0, Math.min(finalYearStudents.length, 25))) {
        if (Math.random() > 0.3) { // 70% placement rate
          try {
            await db.placement.create({
              data: {
                company: randomItem(COMPANY_NAMES),
                location: ['Chennai', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Pune', 'Mumbai', 'Remote'][randomInt(0, 6)],
                designation: ['Software Engineer', 'Systems Engineer', 'Associate Consultant', 'Developer', 'Analyst', 'Graduate Trainee'][randomInt(0, 5)],
                packageLPA: parseFloat((randomInt(35, 120) / 10).toFixed(1)),
                offerDate: recentDate(),
                joiningDate: randomDate(2025, 2026),
                accepted: Math.random() > 0.2,
                joined: Math.random() > 0.5,
                description: `Campus placement offer through T&P Cell`,
                studentId: student.id,
                approvalStatus: 'APPROVED',
                createdAt: recentDate()
              }
            })
            createdPlacements++
          } catch (e) {}
        }
      }
    }

    // ========== INTERNSHIPS ==========
    if (students.length > 0) {
      for (const student of students.slice(0, Math.min(students.length, 30))) {
        if (Math.random() > 0.4) { // 60% internship rate
          try {
            await db.internship.create({
              data: {
                company: randomItem([...COMPANY_NAMES, 'Start-up Tech', 'Local IT Firm', 'Research Lab']),
                location: ['Chennai', 'Bangalore', 'Coimbatore', 'Hyderabad', 'Remote', 'Work from Home'][randomInt(0, 5)],
                domain: ['Software Development', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'Testing', 'Web Development', 'Mobile Apps', 'AI/ML'][randomInt(0, 7)],
                startDate: recentDate(),
                endDate: new Date(new Date().getTime() + randomInt(30, 180) * 86400000),
                stipend: parseFloat((randomInt(5, 50) * 1000).toString()),
                offerLetter: Math.random() > 0.3,
                completionCert: Math.random() > 0.4,
                description: `Industry internship as part of curriculum`,
                studentId: student.id,
                approvalStatus: randomItem(['APPROVED', 'VERIFIED'] as any),
                createdAt: recentDate()
              }
            })
            createdInternships++
          } catch (e) {}
        }
      }
    }

    // ========== RESEARCH PUBLICATIONS ==========
    for (const dept of departments) {
      const deptFaculty = facultyList.filter(f => f.departmentId === dept.id)
      
      // Create 1-3 research papers per department
      const numPapers = randomInt(1, 3)
      
      for (let i = 0; i < numPapers && deptFaculty.length > 0; i++) {
        const faculty = randomItem(deptFaculty)
        const isJournal = Math.random() > 0.4
        
        try {
          await db.research.create({
            data: {
              title: randomItem(RESEARCH_TITLES),
              type: isJournal ? 'JOURNAL' : 'CONFERENCE',
              description: `Research publication from ${dept.name} department focusing on cutting-edge technology applications.`,
              authors: faculty?.user?.name || 'Faculty Member',
              publication: randomItem(JOURNAL_NAMES),
              publisher: isJournal ? 'Elsevier/Springer/IEEE' : 'IEEE/Springer/ACM',
              doi: `10.${randomInt(1000, 9999)}/${randomItem(['abcd', 'xyz', 'test', 'demo'])}.${randomInt(1000, 9999)}`,
              publishDate: recentDate(),
              indexedIn: isJournal ? 'Scopus, Web of Science' : 'IEEE Xplore, Scopus',
              impactFactor: isJournal ? parseFloat((randomInt(20, 100) / 10).toFixed(1)) : null,
              citations: randomInt(0, 50),
              departmentId: dept.id,
              facultyId: faculty?.id,
              status: 'PUBLISHED',
              approvalStatus: 'APPROVED',
              createdAt: recentDate()
            }
          })
          createdResearch++
        } catch (e) {}
      }
    }

    // ========== PATENTS ==========
    for (const dept of departments.slice(0, 7)) { // Patents for some departments
      const deptFaculty = facultyList.filter(f => f.departmentId === dept.id)
      
      if (deptFaculty.length > 0 && Math.random() > 0.5) {
        const faculty = randomItem(deptFaculty)
        
        try {
          await db.patent.create({
            data: {
              title: `Novel Approach for ${randomItem(['Smart Agriculture', 'Healthcare Monitoring', 'Traffic Control', 'Energy Optimization', 'Security Systems', 'Data Processing'])}`,
              patentNumber: `IN${randomInt(2021000000, 2025000000)}`,
              inventors: faculty?.user?.name || 'Inventor',
              filingDate: recentDate(),
              publishDate: recentDate(),
              grantDate: Math.random() > 0.6 ? recentDate() : null,
              status: Math.random() > 0.6 ? 'GRANTED' : (Math.random() > 0.5 ? 'PUBLISHED' : 'FILED'),
              country: 'India',
              category: 'Engineering/Technology',
              facultyId: faculty?.id,
              createdAt: recentDate()
            }
          })
          createdPatents++
        } catch (e) {}
      }
    }

    // ========== FACULTY AWARDS ==========
    for (const faculty of facultyList) {
      if (Math.random() > 0.6) { // 40% chance of having an award
        try {
          await db.award.create({
            data: {
              title: randomItem([
                'Best Teacher Award',
                'Excellence in Research Award',
                'Outstanding Faculty Award',
                'Innovation Award',
                'Best Mentor Award',
                'Teaching Excellence Award',
                'Research Publication Award',
                'Industry Collaboration Award',
                'Social Service Recognition',
                'Lifetime Achievement Award'
              ]),
              awardedBy: randomItem(['Anna University', 'ISTE', 'IE(I)', 'Institution', 'Professional Society', 'NGO']),
              awardDate: randomDate(2022, 2025),
              category: randomItem(['Teaching', 'Research', 'Service', 'Innovation']),
              level: randomItem(['State', 'National', 'International', 'Institutional']),
              description: `Recognition for outstanding contribution in ${faculty.department?.name || 'the institution'}`,
              facultyId: faculty.id,
              createdAt: randomDate(2022, 2025)
            }
          })
          createdAwards++
        } catch (e) {}
      }
    }

    // ========== CERTIFICATIONS ==========
    for (const faculty of facultyList.slice(0, Math.min(facultyList.length, 20))) {
      if (Math.random() > 0.4) {
        try {
          await db.certification.create({
            data: {
              title: randomItem([
                'AWS Certified Solutions Architect',
                'Azure Fundamentals Certification',
                'Google Cloud Professional',
                'NPTEL Certification - Elite',
                'Cisco CCNA Certification',
                'Project Management Professional (PMP)',
                'Six Sigma Green Belt',
                'Python Programming Certificate',
                'Machine Learning Specialization',
                'Data Science Professional'
              ]),
              issuer: randomItem(['AWS', 'Microsoft', 'Google', 'NPTEL-IIT', 'Cisco', 'PMI', 'Coursera', 'edX']),
              issuedDate: randomDate(2022, 2025),
              validUntil: Math.random() > 0.5 ? randomDate(2026, 2030) : null,
              facultyId: faculty.id,
              approvalStatus: 'APPROVED',
              createdAt: randomDate(2022, 2025)
            }
          })
          createdCertifications++
        } catch (e) {}
      }
    }

    // ========== NPTEL COURSES FOR STUDENTS ==========
    if (students.length > 0) {
      for (const student of students.slice(0, Math.min(students.length, 35))) {
        if (Math.random() > 0.5) {
          try {
            await db.nPCourse.create({
              data: {
                courseName: randomItem([
                  'Introduction to Machine Learning',
                  'Data Structures with Python',
                  'Cloud Computing Fundamentals',
                  'Cybersecurity Principles',
                  'Soft Skills Development',
                  'Indian Constitution',
                  'Environmental Studies',
                  'Operating Systems',
                  'Database Management Systems',
                  'Computer Networks'
                ]),
                courseId: `NPTEL${randomInt(1000, 9999)}`,
                platform: 'NPTEL-SWAYAM',
                instructor: randomItem(['IIT Madras', 'IIT Bombay', 'IIT Kharagpur', 'IIT Kanpur', 'IIT Delhi']),
                startDate: recentDate(),
                endDate: recentDate(),
                score: parseFloat((randomInt(50, 100)).toString()),
                grade: randomItem(['Elite', 'Elite+Gold', 'Completed', 'Passed']),
                studentId: student.id,
                approvalStatus: 'APPROVED',
                createdAt: recentDate()
              }
            })
          } catch (e) {}
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully!',
      summary: {
        studentAchievements: createdAchievements,
        eventsAndActivities: createdActivities,
        placements: createdPlacements,
        internships: createdInternships,
        researchPublications: createdResearch,
        patents: createdPatents,
        facultyAwards: createdAwards,
        certifications: createdCertifications,
        totalRecords: createdAchievements + createdActivities + createdPlacements + createdInternships + createdResearch + createdPatents + createdAwards + createdCertifications
      },
      note: 'All sample data has been added across all 11 departments with realistic values for official report generation.'
    })

  } catch (error) {
    console.error('Error seeding sample data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed sample data: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
