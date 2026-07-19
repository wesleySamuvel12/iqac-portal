'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/lib/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, Mail, Lock, Eye, EyeOff, Loader2, 
  LayoutDashboard, Users, GraduationCap, FileText,
  BarChart3, Settings, Bell, LogOut, Menu, X,
  Home, UserCheck, BookOpen, Award, TrendingUp,
  CheckCircle, Clock, AlertCircle, ChevronRight,
  Shield, Star, Activity, Zap, Database,
  Search, Filter, Download, Plus, Edit3, Trash2,
  Calendar, MapPin, Phone, Globe, Send,
  ArrowRight, RefreshCw, Upload, FolderOpen,
  Target, Lightbulb, HeartHandshake, Trophy,
  MessageSquare, ThumbsUp, ThumbsDown, Moon, Sun,
  ChevronDown, ChevronUp, XCircle, FileCheck,
  Briefcase, GraduationCap as GradCap, Code,
  Medal, Gamepad2, Rocket, Sparkles
} from 'lucide-react'

// ============ TYPES ============
interface Department {
  id: string
  name: string
  code: string
  vision?: string
  mission?: string
  hod?: string
  facultyCount?: number
  studentCount?: number
  activityCount?: number
}

interface DashboardStats {
  totalDepartments: number
  totalFaculty: number
  totalStudents: number
  totalActivities: number
  totalResearch: number
  pendingApprovals: number
}

interface AppUser {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'HOD' | 'STAFF' | 'STUDENT'
  departmentId?: string
  departmentName?: string
  regNumber?: string
  yearOfStudy?: string
}

interface FeedbackEntry {
  id: string
  userId: string
  userName: string
  category: string
  rating: number
  message: string
  isAnonymous: boolean
  createdAt: Date
  status: 'pending' | 'reviewed' | 'resolved'
}

interface AchievementData {
  id: string
  userId: string
  type: string
  title: string
  data: Record<string, any>
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: Date
  reviewedBy?: string
  reviewedAt?: Date
  comments?: string
}

type TabType = 'dashboard' | 'departments' | 'faculty' | 'students' | 'activities' | 'research' 
  | 'approvals' | 'analytics' | 'documents' | 'settings' | 'achievements' | 'feedback'

type ThemeType = 'light' | 'dark'

// ============ ACHIEVEMENT TYPE DEFINITIONS ============
const ACHIEVEMENT_TYPES = {
  journal: {
    name: 'Journal Publication',
    icon: FileText,
    color: 'from-blue-500 to-blue-600',
    fields: [
      { id: 'journal_name', label: 'Journal Name', type: 'text', required: true },
      { id: 'issn', label: 'ISSN Number', type: 'text', required: true },
      { id: 'publisher', label: 'Publisher', type: 'text', required: false },
      { id: 'title', label: 'Paper Title', type: 'textarea', required: true },
      { id: 'authors', label: 'Authors (comma separated)', type: 'text', required: true },
      { id: 'volume', label: 'Volume', type: 'text', required: false },
      { id: 'issue', label: 'Issue', type: 'text', required: false },
      { id: 'pages', label: 'Page Numbers', type: 'text', required: false },
      { id: 'year_pub', label: 'Year of Publication', type: 'select', options: ['2024','2023','2022','2021','2020'], required: true },
      { id: 'doi', label: 'DOI (if available)', type: 'text', required: false },
      { id: 'indexing', label: 'Indexing', type: 'select', options: ['Scopus','Web of Science','UGC Care','Other'], required: true },
      { id: 'status_pub', label: 'Publication Status', type: 'select', options: ['Published','Accepted','Under Review','Submitted'], required: true }
    ]
  },
  conference: {
    name: 'Conference Paper',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    fields: [
      { id: 'conf_name', label: 'Conference Name', type: 'text', required: true },
      { id: 'organizer', label: 'Organizer/Institution', type: 'text', required: true },
      { id: 'title', label: 'Paper Title', type: 'textarea', required: true },
      { id: 'authors', label: 'Authors', type: 'text', required: true },
      { id: 'date_conf', label: 'Conference Date', type: 'date', required: true },
      { id: 'venue', label: 'Venue/Location', type: 'text', required: false },
      { id: 'level', label: 'Conference Level', type: 'select', options: ['International','National','State','Regional'], required: true },
      { id: 'proceedings', label: 'Proceedings Published', type: 'select', options: ['Yes - Scopus','Yes - IEEE','Yes - Springer','Yes - Other','No'], required: true },
      { id: 'presentation', label: 'Presentation Mode', type: 'select', options: ['Oral','Poster','Virtual'], required: false }
    ]
  },
  patent: {
    name: 'Patent Filed/Published',
    icon: Award,
    color: 'from-amber-500 to-orange-500',
    fields: [
      { id: 'patent_title', label: 'Patent Title', type: 'text', required: true },
      { id: 'inventors', label: 'Inventors', type: 'text', required: true },
      { id: 'patent_number', label: 'Application/Publication Number', type: 'text', required: false },
      { id: 'filing_date', label: 'Filing Date', type: 'date', required: true },
      { id: 'status_pat', label: 'Status', type: 'select', options: ['Filed','Published','Granted','Under Examination'], required: true },
      { id: 'jurisdiction', label: 'Jurisdiction/Country', type: 'select', options: ['India','USA','Europe','International','Other'], required: true },
      { id: 'category_pat', label: 'Category', type: 'select', options: ['Utility','Design','Plant','Software','Other'], required: true }
    ]
  },
  nptel: {
    name: 'NPTEL Certification',
    icon: GraduationCap,
    color: 'from-green-500 to-emerald-600',
    fields: [
      { id: 'course_name', label: 'Course Name', type: 'text', required: true },
      { id: 'nptel_id', label: 'Course ID', type: 'text', required: true },
      { id: 'instructor', label: 'Instructor(s)', type: 'text', required: false },
      { id: 'semester', label: 'Semester', type: 'select', options: ['Jan-Apr 2024','Jul-Oct 2024','Jan-Apr 2023','Jul-Oct 2023'], required: true },
      { id: 'score', label: 'Score (%)', type: 'number', required: true },
      { id: 'grade_nptel', label: 'Grade/Elite Status', type: 'select', options: ['Elite + Gold','Elite + Silver','Elite','Successfully Completed','Participated'], required: true },
      { id: 'certificate_url', label: 'Certificate URL', type: 'text', required: false }
    ]
  },
  seminar: {
    name: 'Seminar/Workshop Attended',
    icon: Lightbulb,
    color: 'from-cyan-500 to-teal-600',
    fields: [
      { id: 'seminar_title', label: 'Seminar/Workshop Title', type: 'text', required: true },
      { id: 'organizer_sem', label: 'Organizing Body', type: 'text', required: true },
      { id: 'resource_person', label: 'Resource Person(s)', type: 'text', required: false },
      { id: 'date_seminar', label: 'Date(s)', type: 'date', required: true },
      { id: 'duration_days', label: 'Duration (Days)', type: 'number', required: true },
      { id: 'mode_sem', label: 'Mode', type: 'select', options: ['Online','Offline','Hybrid'], required: true },
      { id: 'level_sem', label: 'Level', type: 'select', options: ['International','National','State','Institutional'], required: true },
      { id: 'role_sem', label: 'Role', type: 'select', options: ['Participant','Presenter','Organizer','Volunteer'], required: true },
      { id: 'certificate_issued', label: 'Certificate Issued', type: 'select', options: ['Yes - Participation','Yes - Presentation','Yes - Organizing','No'], required: true }
    ]
  },
  internship: {
    name: 'Internship/Industrial Training',
    icon: Briefcase,
    color: 'from-indigo-500 to-violet-600',
    fields: [
      { id: 'company_name', label: 'Company/Organization Name', type: 'text', required: true },
      { id: 'location_int', label: 'Location', type: 'text', required: false },
      { id: 'start_date', label: 'Start Date', type: 'date', required: true },
      { id: 'end_date', label: 'End Date', type: 'date', required: true },
      { id: 'duration_weeks', label: 'Duration (Weeks)', type: 'number', required: true },
      { id: 'stipend', label: 'Stipend (if any)', type: 'text', required: false },
      { id: 'domain', label: 'Domain/Area', type: 'select', options: ['Software Development','Hardware/Electronics','Mechanical','Civil','Management','Data Science','AI/ML','Cloud Computing','Cybersecurity','Networking','Testing/QA','Other'], required: true },
      { id: 'offer_received', label: 'PPO/Offer Received', type: 'select', options: ['Yes - PPO Given','Yes - Offer Letter','No','Pending'], required: false },
      { id: 'supervisor', label: 'Supervisor Name', type: 'text', required: false },
      { id: 'description_int', label: 'Work Description', type: 'textarea', required: true }
    ]
  },
  training: {
    name: 'Technical Training Program',
    icon: Target,
    color: 'from-rose-500 to-pink-600',
    fields: [
      { id: 'training_title', label: 'Training Program Name', type: 'text', required: true },
      { id: 'training_org', label: 'Conducting Organization', type: 'text', required: true },
      { id: 'start_date_tr', label: 'Start Date', type: 'date', required: true },
      { id: 'end_date_tr', label: 'End Date', type: 'date', required: true },
      { id: 'hours', label: 'Total Hours', type: 'number', required: true },
      { id: 'platform_tr', label: 'Platform/Mode', type: 'select', options: ['Online - Live','Online - Self-paced','Offline - Campus','Offline - External','Hybrid'], required: true },
      { id: 'skills_learned', label: 'Skills Learned', type: 'textarea', required: true },
      { id: 'certification_tr', label: 'Certification Received', type: 'select', options: ['Yes - Industry Recognized','Yes - Participation','No','Pending Assessment'], required: true }
    ]
  },
  awards: {
    name: 'Awards & Honors',
    icon: Trophy,
    color: 'from-yellow-500 to-amber-600',
    fields: [
      { id: 'award_name', label: 'Award/Honor Name', type: 'text', required: true },
      { id: 'awarding_body', label: 'Awarding Organization', type: 'text', required: true },
      { id: 'date_award', label: 'Date Received', type: 'date', required: true },
      { id: 'category_aw', label: 'Category', type: 'select', options: ['Academic','Sports','Cultural','Technical','Social Service','Leadership','Innovation','Other'], required: true },
      { id: 'level_aw', label: 'Level', type: 'select', options: ['International','National','State','District','Institutional'], required: true },
      { id: 'position', label: 'Position/Rank', type: 'select', options: ['1st','2nd','3rd','Participation','Special Mention','Other'], required: false },
      { id: 'prize_money', label: 'Prize Money/Award Value', type: 'text', required: false },
      { id: 'description_aw', label: 'Description', type: 'textarea', required: false }
    ]
  },
  cocurricular: {
    name: 'Co-Curricular Activities',
    icon: Sparkles,
    color: 'from-fuchsia-500 to-purple-600',
    fields: [
      { id: 'event_name', label: 'Event/Activity Name', type: 'text', required: true },
      { id: 'event_type', label: 'Event Type', type: 'select', options: ['Technical Symposium','Hackathon','Cultural Fest','Sports Meet','Debate/Quiz','Workshop','Club Activity','Social Service','Other'], required: true },
      { id: 'organizer_cc', label: 'Organizing Body', type: 'text', required: true },
      { id: 'date_event', label: 'Date', type: 'date', required: true },
      { id: 'role_cc', label: 'Your Role', type: 'select', options: ['Participant','Organizer','Volunteer','Coordinator','Winner','Runner-up'], required: true },
      { id: 'achievement_cc', label: 'Achievement (if any)', type: 'text', required: false },
      { id: 'skills_developed', label: 'Skills Developed', type: 'textarea', required: false }
    ]
  },
  placement: {
    name: 'Placement / Job Offer',
    icon: Rocket,
    color: 'from-emerald-500 to-green-600',
    fields: [
      { id: 'company_pl', label: 'Company Name', type: 'text', required: true },
      { id: 'role_pl', label: 'Role/Position', type: 'text', required: true },
      { id: 'package_lpa', label: 'Package (LPA)', type: 'text', required: true },
      { id: 'offer_date', label: 'Offer Date', type: 'date', required: true },
      { id: 'joining_status', label: 'Joining Status', type: 'select', options: ['Joined','Joining Pending','Declined','Offer Withdrawn','Multiple Offers'], required: true },
      { id: 'placement_type', label: 'Placement Type', type: 'select', options: ['Campus','Off-Campus','Referral','Walk-in','Internship to FTE','Startup'], required: true },
      { id: 'bond_years', label: 'Bond Period (Years)', type: 'number', required: false },
      { id: 'location_pl', label: 'Location', type: 'text', required: false }
    ]
  },
  startup: {
    name: 'Startup / Entrepreneurship',
    icon: Lightbulb,
    color: 'from-violet-500 to-indigo-600',
    fields: [
      { id: 'startup_name', label: 'Startup/Venture Name', type: 'text', required: true },
      { id: 'founders', label: 'Founder(s)', type: 'text', required: true },
      { id: 'industry', label: 'Industry/Sector', type: 'select', options: ['EdTech','HealthTech','FinTech','AgriTech','CleanTech','E-commerce','SaaS','AI/ML','IoT','Manufacturing','Consulting','Media','Other'], required: true },
      { id: 'stage_startup', label: 'Stage', type: 'select', options: ['Idea Stage','MVP Built','Beta Testing','Revenue Generating','Funded - Pre-Series','Funded - Series A+','Profitable'], required: true },
      { id: 'funding_raised', label: 'Funding Raised (if any)', type: 'text', required: false },
      { id: 'incorporated', label: 'Company Incorporated', type: 'select', options: ['Yes - Pvt Ltd','Yes - LLP','Yes - OPC','Not Yet','Sole Proprietorship'], required: true },
      { id: 'incubator', label: 'Incubation Support', type: 'select', options: ['TBI - NIET','External Incubator','Government Scheme','Self-funded','Accelerator Program','None'], required: false },
      { id: 'pitch', label: 'Pitch Deck URL', type: 'text', required: false }
    ]
  },
  hackathon: {
    name: 'Hackathon Participation',
    icon: Code,
    color: 'from-slate-600 to-gray-700',
    fields: [
      { id: 'hackathon_name', label: 'Hackathon Name', type: 'text', required: true },
      { id: 'organizer_hk', label: 'Organizer', type: 'text', required: true },
      { id: 'date_hk', label: 'Date(s)', type: 'date', required: true },
      { id: 'duration_hk', label: 'Duration (Hours)', type: 'number', required: true },
      { id: 'mode_hk', label: 'Mode', type: 'select', options: ['Online','Offline','Hybrid'], required: true },
      { id: 'team_size', label: 'Team Size', type: 'select', options: ['Solo','2 Members','3 Members','4 Members','5+ Members'], required: true },
      { id: 'project_name', label: 'Project/Built Solution', type: 'text', required: true },
      { id: 'tech_stack', label: 'Tech Stack Used', type: 'text', required: true },
      { id: 'result_hk', label: 'Result/Position', type: 'select', options: ['Winner','1st Runner-up','2nd Runner-up','Finalist','Top 10','Participation Certificate','Just Participated'], required: true },
      { id: 'prize_hk', label: 'Prize (if won)', type: 'text', required: false },
      { id: 'github_link', label: 'GitHub/Demo Link', type: 'text', required: false }
    ]
  }
} as const

type AchievementTypeKey = keyof typeof ACHIEVEMENT_TYPES

// ============ FEEDBACK CATEGORIES ============
const FEEDBACK_CATEGORIES = [
  'Teaching Quality',
  'Infrastructure & Facilities',
  'Laboratory Equipment',
  'Library Resources',
  'Placement Support',
  'Extracurricular Activities',
  'Administrative Services',
  'Canteen & Food',
  'Hostel Facilities',
  'Transportation',
  'Internet & IT Support',
  'Overall Satisfaction',
  'Other'
]

// ============ LOGIN PAGE ============
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const result = await login(email, password)
      if (!result.success) {
        setError(result.error || 'Invalid email or password')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = (emailVal: string, passVal: string) => {
    setEmail(emailVal)
    setPassword(passVal)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-2xl shadow-blue-500/30 mb-6 backdrop-blur-sm border border-white/10">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">IQAC Portal</h1>
          <p className="text-blue-200 text-lg">Nehru Institute of Engineering and Technology</p>
          <Badge className="mt-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 px-4 py-1">Autonomous Institution</Badge>
        </div>

        <Card className="shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
                <p className="text-red-200 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="pl-12 py-6 h-auto border-white/20 bg-white/5 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl text-base text-white placeholder:text-blue-300/50" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="pl-12 pr-12 py-6 h-auto border-white/20 bg-white/5 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl text-base text-white placeholder:text-blue-300/50" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full py-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 text-base">
                {isLoading ? (<span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Signing in...</span>) : ('Sign In')}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-blue-300/70 text-center mb-4 uppercase tracking-wider font-medium">Quick Demo Access</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => quickLogin('admin@niet.ac.in', 'admin123')} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-blue-500/20 text-blue-100 hover:text-white text-sm font-medium transition-all border border-white/10 hover:border-blue-400/30"><Shield className="w-4 h-4" />Admin</button>
                <button onClick={() => quickLogin('hod_cse@niet.ac.in', 'hod123')} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-purple-500/20 text-purple-200 hover:text-white text-sm font-medium transition-all border border-white/10 hover:border-purple-400/30"><UserCheck className="w-4 h-4" />HOD CSE</button>
                <button onClick={() => quickLogin('staff_cse@niet.ac.in', 'staff123')} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-green-500/20 text-green-200 hover:text-white text-sm font-medium transition-all border border-white/10 hover:border-green-400/30"><BookOpen className="w-4 h-4" />Staff CSE</button>
                <button onClick={() => quickLogin('student_cse@niet.ac.in', 'student123')} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-amber-500/20 text-amber-200 hover:text-white text-sm font-medium transition-all border border-white/10 hover:border-amber-400/30"><GraduationCap className="w-4 h-4" />Student CSE</button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-blue-300/60 text-xs">Secure Authentication System • NAAC Accredited Institution</p>
      </div>
    </div>
  )
}

// ============ STAT CARD ============
function StatCard({ title, value, icon: Icon, trend, color = "blue", isDark }: { 
  title: string; value: string | number; icon: React.ElementType; trend?: string; color?: "blue" | "green" | "purple" | "orange" | "red" | "pink"; isDark?: boolean;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
    green: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
    purple: "from-violet-500 to-violet-600 shadow-violet-500/25",
    orange: "from-orange-500 to-orange-600 shadow-orange-500/25",
    red: "from-red-500 to-red-600 shadow-red-500/25",
    pink: "from-pink-500 to-pink-600 shadow-pink-500/25",
  }

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-0 ${isDark ? 'bg-white/10 backdrop-blur-sm border-white/10' : 'bg-white/80 backdrop-blur-sm'} overflow-hidden`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className={`text-sm font-medium ${isDark ? 'text-blue-100' : 'text-gray-500'}`}>{title}</p>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
            {trend && (<p className="text-xs text-emerald-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{trend}</p>)}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ DYNAMIC FORM FIELD WITH OTHER OPTION ============
function FormField({ field, value, onChange, isDark, locked, otherValue, onOtherChange, descriptionValue, onDescriptionChange }: {
  field: typeof ACHIEVEMENT_TYPES.journal.fields[0];
  value: string;
  onChange: (val: string) => void;
  isDark?: boolean;
  locked?: boolean;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  descriptionValue?: string;
  onDescriptionChange?: (val: string) => void;
}) {
  const showOther = value === 'Other'
  
  // Fields that should NOT have "Other" option
  const excludeOther = ['year_pub', 'month', 'year']
  const hasOtherOption = field.type === 'select' && !excludeOther.includes(field.id)

  if (field.id === 'description') {
    return (
      <div className="col-span-full space-y-2">
        <label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>
          Description <span className="text-xs opacity-60">(Optional)</span>
        </label>
        <textarea
          value={descriptionValue || ''}
          onChange={(e) => onDescriptionChange?.(e.target.value)}
          placeholder="Add additional details or notes about this achievement..."
          rows={3}
          className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-blue-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500'} focus:ring-2 ${isDark ? 'focus:ring-blue-400/20' : 'focus:ring-blue-500/20'} resize-none transition-all`}
        />
      </div>
    )
  }

  if (field.type === 'select') {
    const options = hasOtherOption ? [...field.options, 'Other'] : field.options
    
    return (
      <div className="space-y-2">
        <label className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>
          {field.label} {field.required && <span className="text-red-400">*</span>}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={locked}
          className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer ${locked ? 'opacity-60 cursor-not-allowed' : ''} ${isDark ? 'border-white/20 bg-white/5 text-white focus:border-blue-400' : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500'} focus:ring-2 ${isDark ? 'focus:ring-blue-400/20' : 'focus:ring-blue-500/20'} transition-all`}
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '2.5rem' }}
        >
          <option value="">Select {field.label}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        
        {/* Show "Other" text input when "Other" is selected */}
        {showOther && hasOtherOption && (
          <input
            type="text"
            value={otherValue || ''}
            onChange={(e) => onOtherChange?.(e.target.value)}
            placeholder={`Specify custom ${field.label.toLowerCase()}...`}
            className={`w-full mt-2 px-4 py-2.5 rounded-lg border text-sm ${isDark ? 'border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-blue-400' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500'} focus:ring-1 ${isDark ? 'focus:ring-blue-400/20' : 'focus:ring-blue-500/20'} transition-all`}
          />
        )}
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div className="space-y-2">
        <label className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>
          {field.label} {field.required && <span className="text-red-400">*</span>}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}...`}
          rows={3}
          disabled={locked}
          className={`w-full px-4 py-3 rounded-xl border ${locked ? 'opacity-60 cursor-not-allowed' : ''} ${isDark ? 'border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-blue-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500'} focus:ring-2 ${isDark ? 'focus:ring-blue-400/20' : 'focus:ring-blue-500/20'} resize-none transition-all`}
        />
      </div>
    )
  }

  if (field.type === 'date') {
    return (
      <div className="space-y-2">
        <label className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>
          {field.label} {field.required && <span className="text-red-400">*</span>}
        </label>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={locked}
          className={`w-full px-4 py-3 rounded-xl border ${locked ? 'opacity-60 cursor-not-allowed' : ''} ${isDark ? 'border-white/20 bg-white/5 text-white focus:border-blue-400' : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500'} focus:ring-2 ${isDark ? 'focus:ring-blue-400/20' : 'focus:ring-blue-500/20'} transition-all`}
        />
      </div>
    )
  }

  if (field.type === 'number') {
    return (
      <div className="space-y-2">
        <label className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>
          {field.label} {field.required && <span className="text-red-400">*</span>}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}...`}
          disabled={locked}
          className={`w-full px-4 py-3 rounded-xl border ${locked ? 'opacity-60 cursor-not-allowed' : ''} ${isDark ? 'border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-blue-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500'} focus:ring-2 ${isDark ? 'focus:ring-blue-400/20' : 'focus:ring-blue-500/20'} transition-all`}
        />
      </div>
    )
  }

  // Default text input
  return (
    <div className="space-y-2">
      <label className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>
        {field.label} {field.required && <span className="text-red-400">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${field.label.toLowerCase()}...`}
        disabled={locked}
        className={`w-full px-4 py-3 rounded-xl border ${locked ? 'opacity-60 cursor-not-allowed' : ''} ${isDark ? 'border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-blue-400' : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500'} focus:ring-2 ${isDark ? 'focus:ring-blue-400/20' : 'focus:ring-blue-500/20'} transition-all`}
      />
    </div>
  )
}

// ============ ACHIEVEMENT FORM COMPONENT ============
function AchievementForm({ user, onSubmitSuccess, isDark }: { user: AppUser; onSubmitSuccess: () => void; isDark: boolean }) {
  const [selectedType, setSelectedType] = useState<AchievementTypeKey | ''>('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [otherValues, setOtherValues] = useState<Record<string, string>>({})
  const [descriptionValue, setDescriptionValue] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const currentType = selectedType ? ACHIEVEMENT_TYPES[selectedType] : null

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleOtherChange = (fieldId: string, value: string) => {
    setOtherValues(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentType) return

    // Validate required fields
    const missingRequired = currentType.fields.filter(f => f.required && !formData[f.id])
    if (missingRequired.length > 0) {
      alert(`Please fill in all required fields: ${missingRequired.map(f => f.label).join(', ')}`)
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Achievement Submitted:', {
      type: selectedType,
      userId: user.id,
      department: user.departmentName,
      data: formData,
      otherValues,
      description: descriptionValue,
      file: file?.name
    })

    setIsSubmitting(false)
    onSubmitSuccess()
    
    // Reset form
    setSelectedType('')
    setFormData({})
    setOtherValues({})
    setDescriptionValue('')
    setFile(null)
    setShowForm(false)
  }

  const isDeptLocked = user.role !== 'ADMIN'

  if (!showForm) {
    return (
      <div className="text-center py-12">
        <Award className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-blue-300/50' : 'text-gray-300'}`} />
        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Submit New Achievement</h3>
        <p className={`mb-6 ${isDark ? 'text-blue-200/70' : 'text-gray-500'}`}>Select an achievement type to get started</p>
        <Button onClick={() => setShowForm(true)} size="lg" className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
          <Plus className="w-5 h-5" /> Start New Submission
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Achievement Type Selection */}
      {!selectedType ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {(Object.keys(ACHIEVEMENT_TYPES) as AchievementTypeKey[]).map(key => {
            const type = ACHIEVEMENT_TYPES[key]
            const Icon = type.icon
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedType(key)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 group ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-400/50' : 'border-gray-200 bg-white hover:border-blue-500 hover:shadow-md'}`}
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${type.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-medium text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{type.name}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <>
          {/* Selected Type Header */}
          <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-blue-50 border border-blue-100'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${currentType.color}`}>
                {React.createElement(currentType.icon, { className: "w-5 h-5 text-white" })}
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentType.name}</h3>
                <p className={`text-xs ${isDark ? 'text-blue-200/70' : 'text-gray-500'}`}>Fill in the details below</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setSelectedType(''); setFormData({}); }}>
              Change Type
            </Button>
          </div>

          {/* Department Field (Locked for non-admin) */}
          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>
              Department {isDeptLocked && <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">Locked</Badge>}
            </label>
            <Input value={user.departmentName || ''} disabled className={`${isDark ? 'bg-white/5 border-white/20 text-white' : 'bg-gray-50'} ${isDeptLocked ? 'opacity-70' : ''}`} />
            {isDeptLocked && <p className="text-xs text-amber-500/80">Your department is automatically assigned based on your profile</p>}
          </div>

          {/* Dynamic Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentType.fields.map(field => (
              <FormField
                key={field.id}
                field={field}
                value={formData[field.id] || ''}
                onChange={(val) => handleFieldChange(field.id, val)}
                isDark={isDark}
                locked={false}
                otherValue={otherValues[field.id]}
                onOtherChange={(val) => handleOtherChange(field.id, val)}
                descriptionValue={descriptionValue}
                onDescriptionChange={setDescriptionValue}
              />
            ))}
            
            {/* Description Field (Optional) */}
            <FormField
              field={{ id: 'description', label: 'Additional Description', type: 'textarea', required: false }}
              value=""
              onChange={() => {}}
              isDark={isDark}
              descriptionValue={descriptionValue}
              onDescriptionChange={setDescriptionValue}
            />
          </div>

          {/* File Upload */}
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isDark ? 'border-white/20 hover:border-blue-400/50' : 'border-gray-300 hover:border-blue-400'}`}>
            <Upload className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-blue-300/50' : 'text-gray-400'}`} />
            <p className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Upload Supporting Document</p>
            <p className={`text-sm mb-3 ${isDark ? 'text-blue-200/60' : 'text-gray-500'}`}>Certificate, proof, or any relevant document (PDF, Image)</p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="achievement-file"
            />
            <label htmlFor="achievement-file" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 cursor-pointer transition-colors text-sm font-medium">
              <FolderOpen className="w-4 h-4" /> Choose File
            </label>
            {file && <p className="mt-2 text-sm text-green-500">{file.name}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl">
              {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Submitting...</>) : (<><Send className="w-5 h-5 mr-2" />Submit Achievement</>)}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </>
      )}
    </form>
  )
}

// ============ FEEDBACK MODULE ============
function FeedbackModule({ user, feedbackEnabled, setFeedbackEnabled, isDark }: {
  user: AppUser;
  feedbackEnabled: boolean;
  setFeedbackEnabled: (v: boolean) => void;
  isDark: boolean;
}) {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([
    { id: '1', userId: '1', userName: 'Arun Prakash', category: 'Teaching Quality', rating: 5, message: 'Excellent teaching methodology!', isAnonymous: false, createdAt: new Date(), status: 'pending' },
    { id: '2', userId: '2', userName: 'Bhavani S.', category: 'Infrastructure', rating: 4, message: 'Lab equipment needs upgrade', isAnonymous: true, createdAt: new Date(), status: 'reviewed' },
  ])
  const [newFeedback, setNewFeedback] = useState({ category: '', rating: 5, message: '', isAnonymous: false })
  const [submitted, setSubmitted] = useState(false)

  const canSubmitFeedback = feedbackEnabled && (user.role === 'STUDENT' || user.role === 'STAFF')
  const isAdmin = user.role === 'ADMIN'

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    const entry: FeedbackEntry = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      ...newFeedback,
      createdAt: new Date(),
      status: 'pending'
    }
    setFeedbacks(prev => [entry, ...prev])
    setSubmitted(true)
    setNewFeedback({ category: '', rating: 5, message: '', isAnonymous: false })
    setTimeout(() => setSubmitted(false), 3000)
  }

  const deleteFeedback = (id: string) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Admin Toggle */}
      {isAdmin && (
        <Card className={`p-4 ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className={`w-5 h-5 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Feedback System Control</h3>
                <p className={`text-xs ${isDark ? 'text-blue-200/70' : 'text-gray-500'}`}>Enable or disable student/staff feedback submissions</p>
              </div>
            </div>
            <button
              onClick={() => setFeedbackEnabled(!feedbackEnabled)}
              className={`relative w-14 h-7 rounded-full transition-colors ${feedbackEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${feedbackEnabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          <p className={`mt-2 text-sm ${feedbackEnabled ? 'text-green-500' : 'text-red-500'}`}>
            {feedbackEnabled ? '✓ Feedback system is ENABLED - Students can submit feedback' : '✗ Feedback system is DISABLED'}
          </p>
        </Card>
      )}

      {/* Feedback Form (only shown when enabled and user is student/staff) */}
      {canSubmitFeedback && !submitted && (
        <Card className={`p-6 ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'}`}>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Send className="w-5 h-5 text-blue-500" /> Submit Feedback
          </h3>
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>Category *</label>
                <select
                  value={newFeedback.category}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, category: e.target.value }))}
                  required
                  className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'border-white/20 bg-white/5 text-white' : 'border-gray-200 bg-white'} focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="">Select Category</option>
                  {FEEDBACK_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>Rating *</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewFeedback(prev => ({ ...prev, rating: star }))}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star className={`w-7 h-7 ${star <= newFeedback.rating ? 'text-yellow-400 fill-yellow-400' : isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    </button>
                  ))}
                  <span className={`ml-2 text-sm ${isDark ? 'text-blue-200' : 'text-gray-500'}`}>{newFeedback.rating}/5</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>Your Feedback *</label>
              <textarea
                value={newFeedback.message}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Share your thoughts and suggestions..."
                rows={4}
                required
                className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'border-white/20 bg-white/5 text-white placeholder:text-white/40' : 'border-gray-200 bg-white placeholder:text-gray-400'} focus:ring-2 focus:ring-blue-500/20 resize-none`}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newFeedback.isAnonymous}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className={`text-sm ${isDark ? 'text-blue-200' : 'text-gray-600'}`}>Submit anonymously</span>
              </label>
            </div>

            <Button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
              <Send className="w-4 h-4 mr-2" /> Submit Feedback
            </Button>
          </form>
        </Card>
      )}

      {submitted && (
        <Card className={`p-6 text-center ${isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <h3 className={`font-semibold text-green-700 ${isDark ? 'text-green-300' : ''}`}>Thank You!</h3>
          <p className={`text-sm ${isDark ? 'text-green-200/80' : 'text-green-600'}`}>Your feedback has been submitted successfully.</p>
        </Card>
      )}

      {/* Feedback List */}
      <Card className={`overflow-hidden ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'}`}>
        <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <MessageSquare className="w-5 h-5" /> All Feedback ({feedbacks.length})
          </h3>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {feedbacks.map(fb => (
            <div key={fb.id} className={`p-4 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">{fb.category}</Badge>
                    <Badge className={`text-xs ${fb.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{fb.status}</Badge>
                    {fb.isAnonymous && <Badge variant="outline" className="text-xs">Anonymous</Badge>}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className={`text-sm ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>{fb.message}</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-blue-300/60' : 'text-gray-400'}`}>
                    {fb.isAnonymous ? 'Anonymous' : fb.userName} • {fb.createdAt.toLocaleDateString()}
                  </p>
                </div>
                {isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => deleteFeedback(fb.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ============ NOTIFICATION DROPDOWN (Fixed Z-Index) ============
function NotificationDropdown({ isDark }: { isDark: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const notifications = [
    { id: 1, title: 'New achievement submitted', time: '5 min ago', read: false },
    { id: 2, title: 'Approval request pending', time: '1 hour ago', read: false },
    { id: 3, title: 'System update scheduled', time: 'Yesterday', read: true },
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-colors ${isDark ? 'text-blue-200 hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
      </button>
      
      {isOpen && (
        <div className="fixed right-4 top-16 w-80 rounded-2xl shadow-2xl border overflow-hidden z-[9999]" style={{ zIndex: 9999 }}>
          <div className={`p-4 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
              <Badge variant="secondary" className="bg-red-100 text-red-600">{notifications.filter(n => !n.read).length} new</Badge>
            </div>
          </div>
          <div className={`max-h-80 overflow-y-auto ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            {notifications.map(notif => (
              <div key={notif.id} className={`p-4 border-b last:border-0 ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{notif.title}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{notif.time}</p>
              </div>
            ))}
          </div>
          <div className={`p-3 border-t text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
            <button className={`text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ DASHBOARD CONTENT ============
function DashboardContent({ user, setActiveTab, isDark }: { user: AppUser; setActiveTab: (t: TabType) => void; isDark: boolean }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalDepartments: 0, totalFaculty: 0, totalStudents: 0,
    totalActivities: 0, totalResearch: 0, pendingApprovals: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.data.stats)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
  }

  if (user.role === 'ADMIN') {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" aria-hidden="true" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
            <p className="text-blue-100 text-lg">Here&apos;s what&apos;s happening across the institution today.</p>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3">
                <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                <p className="text-sm text-blue-100">Pending Approvals</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3">
                <p className="text-2xl font-bold">{stats.totalActivities}</p>
                <p className="text-sm text-blue-100">Activities This Month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Departments" value={stats.totalDepartments} icon={Building2} color="blue" isDark={isDark} />
          <StatCard title="Faculty" value={stats.totalFaculty} icon={Users} color="green" isDark={isDark} />
          <StatCard title="Students" value={stats.totalStudents} icon={GraduationCap} color="purple" isDark={isDark} />
          <StatCard title="Activities" value={stats.totalActivities} icon={Activity} color="orange" isDark={isDark} />
          <StatCard title="Research" value={stats.totalResearch} icon={Award} color="pink" isDark={isDark} />
          <StatCard title="Pending" value={stats.pendingApprovals} icon={Clock} color="red" trend="Needs attention" isDark={isDark} />
        </div>

        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard icon={Users} title="Add Faculty" description="Register new faculty members" color="bg-gradient-to-br from-blue-500 to-blue-600" onClick={() => setActiveTab('faculty')} isDark={isDark} />
            <ActionCard icon={Calendar} title="New Activity" description="Schedule institutional activities" color="bg-gradient-to-br from-purple-500 to-purple-600" onClick={() => setActiveTab('activities')} isDark={isDark} />
            <ActionCard icon={FileCheck} title="Approvals" description="Review pending approval requests" color="bg-gradient-to-br from-amber-500 to-orange-500" onClick={() => setActiveTab('approvals')} isDark={isDark} />
            <ActionCard icon={BarChart3} title="Analytics" description="View detailed reports & insights" color="bg-gradient-to-br from-emerald-500 to-teal-600" onClick={() => setActiveTab('analytics')} isDark={isDark} />
          </div>
        </div>
      </div>
    )
  }

  if (user.role === 'HOD') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Department Dashboard</h2>
          <p className="text-violet-100">{user.departmentName || 'Your Department'} • Head of Department</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Faculty Members" value="24" icon={Users} color="blue" isDark={isDark} />
          <StatCard title="Students" value="420" icon={GraduationCap} color="green" isDark={isDark} />
          <StatCard title="Active Projects" value="12" icon={Target} color="purple" isDark={isDark} />
          <StatCard title="Publications" value="38" icon={Award} color="orange" isDark={isDark} />
        </div>
      </div>
    )
  }

  if (user.role === 'STAFF') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Staff Portal</h2>
          <p className="text-emerald-100">Welcome, {user.name} • {user.departmentName}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="My Activities" value="8" icon={Calendar} color="blue" isDark={isDark} />
          <StatCard title="Research Papers" value="5" icon={FileText} color="green" isDark={isDark} />
          <StatCard title="Attendance" value="95%" icon={CheckCircle} color="purple" isDark={isDark} />
        </div>
        <ActionCard icon={Plus} title="Submit New Activity" description="Report a new activity or event" color="bg-gradient-to-br from-blue-500 to-indigo-600" isDark={isDark} />
      </div>
    )
  }

  // Student Dashboard
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Student Portal</h2>
        <p className="text-amber-100">Welcome, {user.name} • {user.regNumber || 'Student ID'} • {user.departmentName}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Attendance" value="87%" icon={CheckCircle} color="green" isDark={isDark} />
        <StatCard title="CGPA" value="8.5" icon={Star} color="purple" isDark={isDark} />
        <StatCard title="Credits" value="120" icon={BookOpen} color="blue" isDark={isDark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={`p-6 ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'}`}>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Calendar className="w-5 h-5 text-blue-500" /> Upcoming Events
          </h3>
          <div className="space-y-3">
            {['Technical Symposium', 'Workshop on AI', 'Cultural Fest'].map((event, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <Calendar className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                <span className={`text-sm ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>{event}</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className={`p-6 ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'}`}>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Bell className="w-5 h-5 text-amber-500" /> Recent Announcements
          </h3>
          <div className="space-y-3">
            {['Exam Schedule Released', 'Holiday Notice', 'Placement Drive'].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <Bell className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                <span className={`text-sm ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Action Buttons for Student */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button onClick={() => setActiveTab('achievements')} className="py-4 text-base gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
          <Award className="w-5 h-5" /> My Achievements
        </Button>
        <Button onClick={() => setActiveTab('feedback')} variant="outline" className={`py-4 text-base gap-2 ${isDark ? 'border-white/20 text-white hover:bg-white/10' : ''}`}>
          <MessageSquare className="w-5 h-5" /> Submit Feedback
        </Button>
      </div>
    </div>
  )
}

// ============ ACTION CARD ============
function ActionCard({ icon: Icon, title, description, color, onClick, isDark }: {
  icon: React.ElementType; title: string; description: string; color: string; onClick?: () => void; isDark?: boolean;
}) {
  return (
    <Card className={`group cursor-pointer hover:shadow-xl transition-all duration-300 border ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-gray-100 bg-white hover:border-blue-200'} overflow-hidden`} onClick={onClick}>
      <CardContent className="p-6">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className={`font-semibold mb-2 group-hover:text-blue-600 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-blue-200/70' : 'text-gray-500'}`}>{description}</p>
      </CardContent>
    </Card>
  )
}

const FileCheck = CheckCircle

// ============ SIDEBAR ============
function Sidebar({ activeTab, setActiveTab, user, isDark }: { activeTab: TabType; setActiveTab: (t: TabType) => void; user: AppUser; isDark: boolean }) {
  const [collapsed, setCollapsed] = useState(false)
  
  const menuItems: { id: TabType; icon: React.ElementType; label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'departments', icon: Building2, label: 'Departments' },
    { id: 'faculty', icon: Users, label: 'Faculty' },
    { id: 'students', icon: GraduationCap, label: 'Students' },
    { id: 'activities', icon: Activity, label: 'Activities' },
    { id: 'research', icon: Award, label: 'Research' },
    ...(user.role === 'ADMIN' ? [{ id: 'approvals' as TabType, icon: CheckCircle, label: 'Approvals' }] : []),
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'documents', icon: FolderOpen, label: 'Documents' },
    ...(user.role === 'STUDENT' || user.role === 'STAFF' ? [{ id: 'achievements' as TabType, icon: Trophy, label: 'Achievements' }] : []),
    ...(user.role === 'STUDENT' || user.role === 'STAFF' ? [{ id: 'feedback' as TabType, icon: MessageSquare, label: 'Feedback' }] : []),
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-gray-200'} border-r flex flex-col transition-all duration-300 hidden lg:flex`}>
      <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>IQAC ERP</span>}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.id
                ? (isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-700')
                : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <button onClick={() => setCollapsed(!collapsed)} className={`m-3 p-2 rounded-xl border ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
        <Menu className="w-5 h-5" />
      </button>
    </aside>
  )
}

// ============ MOBILE NAV ============
function MobileNav({ activeTab, setActiveTab, user, isDark }: { activeTab: TabType; setActiveTab: (t: TabType) => void; user: AppUser; isDark: boolean }) {
  const [open, setOpen] = useState(false)
  
  const menuItems: { id: TabType; icon: React.ElementType; label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'departments', icon: Building2, label: 'Departments' },
    { id: 'faculty', icon: Users, label: 'Faculty' },
    { id: 'students', icon: GraduationCap, label: 'Students' },
    { id: 'activities', icon: Activity, label: 'Activities' },
    { id: 'research', icon: Award, label: 'Research' },
    { id: 'approvals', icon: CheckCircle, label: 'Approvals' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'documents', icon: FolderOpen, label: 'Documents' },
    { id: 'achievements', icon: Trophy, label: 'Achievements' },
    { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <>
      <button onClick={() => setOpen(true)} className="lg:hidden fixed bottom-4 left-4 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg">
        <Menu className="w-6 h-6" />
      </button>
      
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className={`absolute left-0 top-0 bottom-0 w-72 shadow-xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Menu</span>
              <button onClick={() => setOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    activeTab === item.id ? (isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-700') : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-50')
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

// ============ PAGE COMPONENTS ============
function DepartmentsPage({ isDark }: { isDark: boolean }) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDepartments(data.data.map((d: any) => ({
            id: d.id, name: d.name, code: d.code,
            facultyCount: d._count?.faculty || 0,
            studentCount: d._count?.students || 0,
            activityCount: d._count?.activities || 0
          })))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Departments</h2>
          <p className={isDark ? 'text-blue-200/70' : 'text-gray-500'}>Manage all academic departments</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Add Department</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {departments.map(dept => (
          <Card key={dept.id} className={`group hover:shadow-xl transition-all duration-300 border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-white'} overflow-hidden`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                    {dept.code?.substring(0, 2) || 'DE'}
                  </div>
                  <div>
                    <h3 className={`font-semibold group-hover:text-blue-600 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{dept.name}</h3>
                    <p className={`text-sm ${isDark ? 'text-blue-200/70' : 'text-gray-500'}`}>{dept.code}</p>
                  </div>
                </div>
                <Badge className="bg-green-50 text-green-700 border-green-200">Active</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <p className={`text-lg font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{dept.facultyCount || 0}</p>
                  <p className={`text-xs ${isDark ? 'text-blue-200/60' : 'text-gray-500'}`}>Faculty</p>
                </div>
                <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                  <p className={`text-lg font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>{dept.studentCount || 0}</p>
                  <p className={`text-xs ${isDark ? 'text-purple-200/60' : 'text-gray-500'}`}>Students</p>
                </div>
                <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                  <p className={`text-lg font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>{dept.activityCount || 0}</p>
                  <p className={`text-xs ${isDark ? 'text-amber-200/60' : 'text-gray-500'}`}>Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AchievementsPage({ user, isDark }: { user: AppUser; isDark: boolean }) {
  const [showForm, setShowForm] = useState(false)
  const [submissions, setSubmissions] = useState<AchievementData[]>([])
  const [successMsg, setSuccessMsg] = useState('')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Achievements</h2>
          <p className={isDark ? 'text-blue-200/70' : 'text-gray-500'}>Track and submit your achievements</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600">
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'New Achievement'}
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-600">{successMsg}</span>
        </div>
      )}

      {showForm && (
        <Card className={`p-6 ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'}`}>
          <AchievementForm
            user={user}
            isDark={isDark}
            onSubmitSuccess={() => {
              setSuccessMsg('Achievement submitted successfully! It will be reviewed by your HOD.')
              setTimeout(() => setSuccessMsg(''), 5000)
            }}
          />
        </Card>
      )}

      {/* Submissions List */}
      <Card className={`overflow-hidden ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'}`}>
        <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Submissions</h3>
        </div>
        {submissions.length > 0 ? (
          <div className="divide-y">
            {submissions.map(sub => (
              <div key={sub.id} className={`p-4 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{sub.title}</p>
                    <p className={`text-sm ${isDark ? 'text-blue-200/70' : 'text-gray-500'}`}>{sub.type} • {sub.submittedAt.toLocaleDateString()}</p>
                  </div>
                  <Badge className={
                    sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                    sub.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }>{sub.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>No achievements submitted yet</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Click &quot;New Achievement&quot; to submit your first one!</p>
          </div>
        )}
      </Card>
    </div>
  )
}

function FeedbackPage({ user, isDark }: { user: AppUser; isDark: boolean }) {
  const [feedbackEnabled, setFeedbackEnabled] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Feedback Center</h2>
        <p className={isDark ? 'text-blue-200/70' : 'text-gray-500'}>Share your thoughts and help us improve</p>
      </div>
      <FeedbackModule user={user} feedbackEnabled={feedbackEnabled} setFeedbackEnabled={setFeedbackEnabled} isDark={isDark} />
    </div>
  )
}

function SettingsPage({ user, isDark, toggleTheme }: { user: AppUser; isDark: boolean; toggleTheme: () => void }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
        <p className={isDark ? 'text-blue-200/70' : 'text-gray-500'}>Manage your account preferences</p>
      </div>
      
      <Card className={`p-6 ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <span className={isDark ? 'text-blue-100' : 'text-gray-700'}>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-colors ${isDark ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDark ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </Card>

      <Card className={`p-6 ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-sm font-medium ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>Full Name</label>
              <Input defaultValue={user.name} className={`mt-1 ${isDark ? 'bg-white/5 border-white/20 text-white' : ''}`} />
            </div>
            <div>
              <label className={`text-sm font-medium ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>Email</label>
              <Input defaultValue={user.email} className={`mt-1 ${isDark ? 'bg-white/5 border-white/20 text-white' : ''}`} disabled />
            </div>
          </div>
          <div>
            <label className={`text-sm font-medium ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>Role</label>
            <Input defaultValue={user.role} className={`mt-1 ${isDark ? 'bg-white/5 border-white/20 text-white' : ''}`} disabled />
          </div>
          <div>
            <label className={`text-sm font-medium ${isDark ? 'text-blue-100' : 'text-gray-700'}`}>Department</label>
            <Input defaultValue={user.departmentName || ''} className={`mt-1 ${isDark ? 'bg-white/5 border-white/20 text-white' : ''}`} disabled />
          </div>
          <Button>Save Changes</Button>
        </div>
      </Card>
    </div>
  )
}

// Placeholder pages
function GenericPage({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
        <p className={isDark ? 'text-blue-200/70' : 'text-gray-500'}>Manage {title.toLowerCase()}</p>
      </div>
      <Card className={`p-12 text-center ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'}`}>
        <Database className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
        <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>{title} module coming soon...</p>
      </Card>
    </div>
  )
}

// ============ MAIN APP COMPONENT ============
export default function IQACPortal() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<ThemeType>('light')

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('iqac-theme') as ThemeType | null
    if (savedTheme) setTheme(savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('iqac-theme', newTheme)
  }

  const isDark = theme === 'dark'

  if (!mounted) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardContent user={user} setActiveTab={setActiveTab} isDark={isDark} />
      case 'departments': return <DepartmentsPage isDark={isDark} />
      case 'faculty': return <GenericPage title="Faculty Management" isDark={isDark} />
      case 'students': return <GenericPage title="Student Records" isDark={isDark} />
      case 'activities': return <GenericPage title="Activities & Events" isDark={isDark} />
      case 'research': return <GenericPage title="Research & Publications" isDark={isDark} />
      case 'approvals': return <GenericPage title="Approval Requests" isDark={isDark} />
      case 'analytics': return <GenericPage title="Analytics Dashboard" isDark={isDark} />
      case 'documents': return <GenericPage title="Document Management" isDark={isDark} />
      case 'achievements': return <AchievementsPage user={user} isDark={isDark} />
      case 'feedback': return <FeedbackPage user={user} isDark={isDark} />
      case 'settings': return <SettingsPage user={user} isDark={isDark} toggleTheme={toggleTheme} />
      default: return <DashboardContent user={user} setActiveTab={setActiveTab} isDark={isDark} />
    }
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Background Orbs for dark mode */}
      {isDark && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>
      )}

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} isDark={isDark} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Header */}
        <header className={`sticky top-0 z-30 border-b ${isDark ? 'bg-slate-900/90 border-slate-800 backdrop-blur-xl' : 'bg-white/90 backdrop-blur-xl border-gray-200'}`}>
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="lg:hidden flex items-center gap-3">
              <Building2 className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>IQAC Portal</span>
            </div>

            <button className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              <Search className="w-4 h-4" />
              <span className="text-sm">Search...</span>
              <kbd className={`hidden lg:inline-flex items-center px-2 py-0.5 rounded text-xs ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-200 text-gray-600'}`}>⌘K</kbd>
            </button>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button onClick={toggleTheme} className={`p-2.5 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications - Fixed z-index */}
              <NotificationDropdown isDark={isDark} />

              {/* Profile */}
              <div className={`flex items-center gap-2 pl-2 sm:pl-3 border-l ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-blue-500/20">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                  <p className={`text-xs capitalize ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{user.role?.toLowerCase()}</p>
                </div>
                <button onClick={logout} className={`p-2.5 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`} title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 relative z-10">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className={`py-4 px-6 border-t mt-auto relative z-10 ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-white/80 border-gray-200 text-gray-500'}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
            <p>© 2024 NIET IQAC Enterprise Management System</p>
            <p>Nehru Institute of Engineering and Technology (Autonomous)</p>
          </div>
        </footer>
      </div>

      {/* Mobile Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} user={user} isDark={isDark} />
    </div>
  )
}
