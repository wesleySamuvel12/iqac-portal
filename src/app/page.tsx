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
  MessageSquare, ThumbsUp, ThumbsDown,
  Sun, Moon, ChevronDown, ChevronLeft,
  ClipboardList, Flag, Mic, Presentation,
  Briefcase, Wrench, Rocket, Code, PlusCircle,
  Newspaper, Handshake, Circle
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

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'HOD' | 'STAFF' | 'STUDENT'
  departmentId?: string
  departmentName?: string
}

type TabType = 'dashboard' | 'departments' | 'faculty' | 'students' | 'activities' | 'research' 
  | 'approvals' | 'analytics' | 'documents' | 'settings' | 'achievements' | 'feedback'

// ============ ACHIEVEMENT TYPES DEFINITION (13 Types - Student Focused) ============
const ACHIEVEMENT_TYPES: Record<string, {
  label: string
  icon: React.ElementType
  color: string
  fields: Array<{
    id: string
    label: string
    type: string
    required?: boolean
    locked?: boolean
    full?: boolean
    options?: string[]
  }>
}> = {
  journal: {
    label: 'Journal Publication',
    icon: Newspaper,
    color: 'from-blue-500 to-blue-600',
    fields: [
      { id: 'name', label: 'Student Name', type: 'text', required: true },
      { id: 'dept', label: 'Department', type: 'text', required: true, locked: true },
      { id: 'reg', label: 'Register No', type: 'text', required: true },
      { id: 'year', label: 'Year of Study', type: 'select', options: ['I Year','II Year','III Year','IV Year'] },
      { id: 'title', label: 'Paper Title', type: 'text', required: true, full: true },
      { id: 'journal', label: 'Journal Name', type: 'text', required: true, full: true },
      { id: 'indexed', label: 'Indexed', type: 'select', options: ['SCI','Scopus','UGC Care','Web of Science','Other'] },
      { id: 'issn', label: 'ISSN', type: 'text' },
      { id: 'publisher', label: 'Publisher', type: 'text' },
      { id: 'month', label: 'Month', type: 'select', options: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
      { id: 'year_pub', label: 'Year', type: 'number' },
      { id: 'status_pub', label: 'Status', type: 'select', options: ['Published','Accepted','Under Review'] },
      { id: 'supervisor', label: 'Supervisor', type: 'text' },
      { id: 'link', label: 'Paper Link', type: 'url' },
      { id: 'description', label: 'Description', type: 'textarea', full: true }
    ]
  },
  conference: {
    label: 'Conference Publication',
    icon: Mic,
    color: 'from-purple-500 to-purple-600',
    fields: [
      { id: 'name', label: 'Student Name', type: 'text', required: true },
      { id: 'dept', label: 'Department', type: 'text', required: true, locked: true },
      { id: 'reg', label: 'Register No', type: 'text', required: true },
      { id: 'year', label: 'Year of Study', type: 'select', options: ['I Year','II Year','III Year','IV Year'] },
      { id: 'title', label: 'Paper Title', type: 'text', required: true, full: true },
      { id: 'conf', label: 'Conference Name', type: 'text', required: true, full: true },
      { id: 'org', label: 'Organizing Institute', type: 'text' },
      { id: 'indexed', label: 'Indexed', type: 'select', options: ['IEEE','Springer','Elsevier','Scopus','Other'] },
      { id: 'month', label: 'Month', type: 'select', options: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
      { id: 'year_pub', label: 'Year', type: 'number' },
      { id: 'status_pub', label: 'Status', type: 'select', options: ['Presented','Published','Both'] },
      { id: 'supervisor', label: 'Supervisor', type: 'text' },
      { id: 'description', label: 'Description', type: 'textarea', full: true }
    ]
  },
  patent: {
    label: 'Patent',
    icon: Lightbulb,
    color: 'from-amber-500 to-orange-500',
    fields: [
      { id: 'name', label: 'Student Name', type: 'text', required: true },
      { id: 'dept', label: 'Department', type: 'text', required: true, locked: true },
      { id: 'reg', label: 'Register No', type: 'text', required: true },
      { id: 'year', label: 'Year of Study', type: 'select', options: ['I Year','II Year','III Year','IV Year'] },
      { id: 'title', label: 'Invention Title', type: 'text', required: true, full: true },
      { id: 'patent_no', label: 'Patent No.', type: 'text' },
      { id: 'month', label: 'Month', type: 'select', options: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
      { id: 'year_pub', label: 'Year', type: 'number' },
      { id: 'status_pub', label: 'Status', type: 'select', options: ['Filed','Published','Granted'] },
      { id: 'inventors', label: 'All Inventors', type: 'text' },
      { id: 'supervisor', label: 'Supervisor', type: 'text' },
      { id: 'description', label: 'Description', type: 'textarea', full: true }
    ]
  },
  nptel: {
    label: 'NPTEL / MOOC',
    icon: GraduationCap,
    color: 'from-green-500 to-teal-600',
    fields: [
      { id: 'name', label: 'Student Name', type: 'text', required: true },
      { id: 'dept', label: 'Department', type: 'text', required: true, locked: true },
      { id: 'reg', label: 'Register No', type: 'text', required: true },
      { id: 'year', label: 'Year of Study', type: 'select', options: ['I Year','II Year','III Year','IV Year'] },
      { id: 'platform', label: 'Platform', type: 'select', options: ['NPTEL','Swayam','Coursera','edX','FutureLearn','Udemy','Other'] },
      { id: 'course', label: 'Course Name', type: 'text', required: true, full: true },
      { id: 'domain', label: 'Domain', type: 'text' },
      { id: 'mentor', label: 'Faculty Mentor', type: 'text' },
      { id: 'duration', label: 'Duration (wks)', type: 'number' },
      { id: 'score', label: 'Score (%)', type: 'number' },
      { id: 'grade', label: 'Grade', type: 'select', options: ['Elite + Gold','Elite + Silver','Elite','Successfully Completed','Completed'] },
      { id: 'description', label: 'Description', type: 'textarea', full: true }
    ]
  },
  seminar: {
    label: 'Seminar / Workshop',
    icon: Presentation,
    color: 'from-pink-500 to-rose-600',
    fields: [
      { id: 'name', label: 'Student Name', type: 'text', required: true },
      { id: 'dept', label: 'Department', type: 'text', required: true, locked: true },
      { id: 'reg', label: 'Register No', type: 'text', required: true },
      { id: 'year', label: 'Year of Study', type: 'select', options: ['I Year','II Year','III Year','IV Year'] },
      { id: 'title', label: 'Event Title', type: 'text', required: true, full: true },
      { id: 'type_sem', label: 'Type', type: 'select', options: ['Seminar','Webinar','Workshop','Conference','FDP','Other'] },
      { id: 'org', label: 'Organizing Institute', type: 'text' },
      { id: 'state', label: 'State', type: 'text' },
      { id: 'from_date', label: 'From Date', type: 'date' },
      { id: 'to_date', label: 'To Date', type: 'date' },
      { id: 'mode', label: 'Mode', type: 'select', options: ['Online','Offline','Hybrid'] },
      { id: 'description', label: 'Description', type: 'textarea', full: true }
    ]
  },
  internship: {
    label: 'Internship',
    icon: Briefcase,
    color: 'from-cyan-500 to-blue-600',
    fields: [
      { id: 'name', label: 'Student Name', type: 'text', required: true },
      { id: 'dept', label: 'Department', type: 'text', required: true, locked: true },
      { id: 'reg', label: 'Register No', type: 'text', required: true },
      { id: 'year', label: 'Year of Study', type: 'select', options: ['I Year','II Year','III Year','IV Year'] },
      { id: 'org_name', label: 'Organization / Industry', type: 'text', required: true, full: true },
      { id: 'role', label: 'Internship Role/Title', type: 'text' },
      { id: 'from_date', label: 'From Date', type: 'date' },
      { id: 'to_date', label: 'To Date', type: 'date' },
      { id: 'paid', label: 'Paid?', type: 'select', options: ['Yes','No'] },
      { id: 'stipend', label: 'Stipend (₹)', type: 'number' },
      { id: 'mode', label: 'Mode', type: 'select', options: ['Online','Offline','Hybrid'] },
      { id: 'industry_mentor', label: 'Industry Mentor', type: 'text' },
      { id: 'description', label: 'Description', type: 'textarea', full: true }
    ]
  },
  training: {
    label: 'Training Programme',
    icon: Wrench,
    color: 'from-indigo-500 to-violet-600',
    fields: [
      { id: 'name', label: 'Student Name', type: 'text', required: true },
      { id: 'dept', label: 'Department', type: 'text', required: true, locked: true },
      { id: 'reg', label: 'Register No', type: 'text', required: true },
      { id: 'year', label: 'Year of Study', type: 'select', options: ['I Year','II Year','III Year','IV Year'] },
      { id: 'prog_name', label: 'Training Program Name', type: 'text', required: true, full: true },
      { id: 'organizer', label: 'Organizer', type: 'text' },
      { id: 'from_date', label: 'From Date', type: 'date' },
      { id: 'to_date', label: 'To Date', type: 'date' },
      { id: 'hours', label: 'Hours / Days', type: 'text' },
      { id: 'description', label: 'Description', type: 'textarea', full: true }
    ]
  },
  award: {
    label: 'Awards & Recognition',
    icon: Trophy,
    color: 'from-yellow-500 to-amber-600',
    fields: [
      { id: 'name', label: 'Student Name', type: 'text', required: true },
      { id: 'dept', label: 'Department', type: 'text', required: true, locked: true },
      { id: 'reg', label: 'Register No', type: 'text', required: true },
      { id: 'year', label: 'Year of Study', type: 'select', options: ['I Year','II Year','III Year','IV Year'] },
      { id: 'award_name', label: 'Award Name', type: 'text', required: true, full: true },
      { id: 'event', label: 'Event / Competition', type: 'text' },
      { id: 'organizer', label: 'Organizer', type: 'text' },
      { id: 'level', label: 'Level', type: 'select', options: ['International','National','State','Regional','Institutional'] },
      { id: 'position', label: 'Position', type: 'text' },
      { id: 'date', label: 'Date', type: 'date' },
      { id: 'cash_prize', label: 'Cash / Prize', type: 'text' },
      { id: 'description', label: 'Description', type: 'textarea', full: true }
    ]
  },
  cocurricular: {
    label: 'Co-Curricular Activities',
    icon: Circle,
    color: 'from-emerald-500 to-green-600',
    fields: [
      { id: 'name', label: 'Student Name', type: 'text', required: true },
      { id: 'dept', label: 'Department', type: 'text', required: true, locked: true },
      { id: 'reg', label: 'Register No', type: 'text', required: true },
      { id: 'year', label: 'Year of Study', type: 'select', options: ['I Year','II Year','III Year','IV Year'] },
      { id: 'activity_type', label: 'Activity Type', type: 'select', options: ['Sports','Cultural','Club Activity','Social Service','Leadership','Student Council','Other'] },
      { id: 'event_name', label: 'Event Name', type: 'text', required: true },
      { id: 'organizer', label: 'Organizer', type: 'text' },
      { id: 'level', label: 'Level', type: 'select', options: ['International','National','State','Regional','Institutional'] },
      { id: 'position', label: 'Position', type: 'text' },
      { id: 'date', label: 'Date', type: 'date' },
      { id: 'description', label: 'Description', type: 'textarea', full: true }
    ]
  },
  placement: {
    label: 'Placement',
    icon: Handshake,
    color: 'from-violet-500 to-purple-600',
    fields: [
      { id: 'name', label: 'Student Name', type: 'text', required: true },
      { id: 'dept', label: 'Department', type: 'text', required: true, locked: true },
      { id: 'reg', label: 'Register No', type: 'text', required: true },
      { id: 'yop', label: 'Year of Passing', type: 'number' },
      { id: 'company', label: 'Company Name', type: 'text', required: true, full: true },
      { id: 'state', label: 'Company State', type: 'text' },
      { id: 'role', label: 'Job Role', type: 'text' },
      { id: 'package', label: 'Package (LPA)', type: 'number' },
      { id: 'offer_date', label: 'Offer Date', type: 'date' },
      { id: 'mode', label: 'Mode', type: 'select', options: ['Campus','Off-Campus','Lateral'] },
      { id: 'emp_type', label: 'Employment Type', type: 'select', options: ['Full-Time','Part-Time','Contract','Internship to PPO'] },
      { id: 'description', label: 'Description', type: 'textarea', full: true }
    ]
  },
  startup: {
    label: 'Startup',
    icon: Rocket,
    color: 'from-red-500 to-pink-600',
    fields: [
      { id: 'name', label: 'Student Name', type: 'text', required: true },
      { id: 'dept', label: 'Department', type: 'text', required: true, locked: true },
      { id: 'reg', label: 'Register No', type: 'text', required: true },
      { id: 'year', label: 'Year of Study', type: 'select', options: ['I Year','II Year','III Year','IV Year'] },
      { id: 'title', label: 'Startup Title / Idea', type: 'text', required: true, full: true },
      { id: 'domain', label: 'Domain / Sector', type: 'text' },
      { id: 'stage', label: 'Stage', type: 'select', options: ['Idea','Prototype','MVP','Launched','Scaling'] },
      { id: 'registered', label: 'Is Registered?', type: 'select', options: ['Yes','No'] },
      { id: 'startup_name', label: 'Startup Name', type: 'text' },
      { id: 'incubation', label: 'Incubation Status', type: 'select', options: ['Incubated','Not Incubated','Applied'] },
      { id: 'outcome', label: 'Outcome', type: 'text' },
      { id: 'description', label: 'Description', type: 'textarea', full: true }
    ]
  },
  hackathon: {
    label: 'Hackathon / Ideathon / SIH',
    icon: Code,
    color: 'from-slate-500 to-gray-600',
    fields: [
      { id: 'name', label: 'Student Name', type: 'text', required: true },
      { id: 'dept', label: 'Department', type: 'text', required: true, locked: true },
      { id: 'reg', label: 'Register No', type: 'text', required: true },
      { id: 'year', label: 'Year of Study', type: 'select', options: ['I Year','II Year','III Year','IV Year'] },
      { id: 'category', label: 'Category', type: 'select', options: ['Hackathon','Ideathon','SIH','Innovation Challenge','Other'] },
      { id: 'title', label: 'Title / Idea', type: 'text', required: true, full: true },
      { id: 'event_agency', label: 'Event / Agency', type: 'text' },
      { id: 'problem_domain', label: 'Problem Domain', type: 'text' },
      { id: 'level', label: 'Level', type: 'select', options: ['International','National','State','Regional','Institutional'] },
      { id: 'stage', label: 'Stage', type: 'select', options: ['Submitted','Shortlisted','Finalist','Winner','Runner-Up'] },
      { id: 'position_prize', label: 'Position / Prize', type: 'text' },
      { id: 'amount', label: 'Amount Received (₹)', type: 'number' },
      { id: 'event_date', label: 'Event Date', type: 'date' },
      { id: 'description', label: 'Description', type: 'textarea', full: true }
    ]
  },
  other: {
    label: 'Custom Achievement',
    icon: PlusCircle,
    color: 'from-gray-400 to-gray-500',
    fields: [
      { id: 'custom_type', label: 'Custom Achievement Type', type: 'text', required: true, full: true },
      { id: 'name', label: 'Student Name', type: 'text', required: true },
      { id: 'dept', label: 'Department', type: 'text', required: true, locked: true },
      { id: 'reg', label: 'Register No', type: 'text', required: true },
      { id: 'year', label: 'Year of Study', type: 'select', options: ['I Year','II Year','III Year','IV Year'] },
      { id: 'date', label: 'Date', type: 'date' },
      { id: 'description', label: 'Description', type: 'textarea', full: true }
    ]
  }
}

// ============ DEPARTMENTS LIST FOR LOGIN ============
const DEPARTMENTS_LIST = [
  { code: 'CSE', name: 'Computer Science & Engineering', color: 'blue' },
  { code: 'AI&DS', name: 'AI & Data Science', color: 'purple' },
  { code: 'IT', name: 'Information Technology', color: 'cyan' },
  { code: 'ECE', name: 'Electronics & Communication', color: 'pink' },
  { code: 'EEE', name: 'Electrical & Electronics', color: 'yellow' },
  { code: 'MECH', name: 'Mechanical Engineering', color: 'orange' },
  { code: 'CIVIL', name: 'Civil Engineering', color: 'emerald' },
  { code: 'MATHS', name: 'Mathematics', color: 'indigo' },
  { code: 'PHY', name: 'Physics', color: 'teal' },
  { code: 'CHEM', name: 'Chemistry', color: 'rose' },
  { code: 'ENG', name: 'English', color: 'sky' },
  { code: 'MBA', name: 'MBA', color: 'violet' },
  { code: 'MCA', name: 'MCA', color: 'fuchsia' },
  { code: 'BIO', name: 'Biotechnology', color: 'lime' },
  { code: 'AGRI', name: 'Agricultural Engg.', color: 'green' },
  { code: 'BME', name: 'Biomedical Engg.', color: 'red' },
  { code: 'R&A', name: 'Robotics & Automation', color: 'slate' },
  { code: 'MECHT', name: 'Mechatronics', color: 'zinc' },
  { code: 'CYBER', name: 'Cyber Security', color: 'amber' },
  { code: 'DS', name: 'Data Science', color: 'stone' },
]

const ROLE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  HOD: { bg: 'bg-purple-50 hover:bg-purple-100', border: 'border-purple-200 hover:border-purple-300', text: 'text-purple-700 hover:text-purple-800', icon: 'text-purple-500' },
  STAFF: { bg: 'bg-green-50 hover:bg-green-100', border: 'border-green-200 hover:border-green-300', text: 'text-green-700 hover:text-green-800', icon: 'text-green-500' },
  STUDENT: { bg: 'bg-amber-50 hover:bg-amber-100', border: 'border-amber-200 hover:border-amber-300', text: 'text-amber-700 hover:text-amber-800', icon: 'text-amber-500' },
}

// ============ LOGIN PAGE ============
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDept, setSelectedDept] = useState('CSE')
  const [showDeptDropdown, setShowDeptDropdown] = useState(false)
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

  const getDeptEmail = (deptCode: string, role: string) => {
    const code = deptCode.toLowerCase()
    switch(role) {
      case 'HOD': return `hod_${code}@niet.ac.in`
      case 'STAFF': return `staff_${code}1@niet.ac.in`
      case 'STUDENT': return `student_${code}1@niet.ac.in`
      default: return ''
    }
  }

  const getPassword = (role: string) => {
    switch(role) {
      case 'HOD': return 'hod123'
      case 'STAFF': return 'staff123'
      case 'STUDENT': return 'student123'
      default: return ''
    }
  }

  const currentDept = DEPARTMENTS_LIST.find(d => d.code === selectedDept)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0a2a5e] to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-[#0a7aff] to-purple-600 shadow-2xl shadow-blue-500/30 mb-6 backdrop-blur-sm border border-white/20">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">IQAC Portal</h1>
          <p className="text-white text-lg font-medium drop-shadow">Nehru Institute of Engineering and Technology</p>
          <Badge className="mt-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 px-4 py-1 shadow-lg text-sm">
            Autonomous Institution • NAAC Accredited
          </Badge>
        </div>

        {/* Login Card */}
        <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 animate-slide-up">
          <CardContent className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 animate-shake">
                <p className="text-red-600 text-sm flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-12 py-6 h-auto border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl text-base text-gray-800 placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-12 pr-12 py-6 h-auto border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl text-base text-gray-800 placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 text-base btn-glow"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Quick Login - Department Wise */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-4 uppercase tracking-wider font-semibold">Quick Demo Access</p>
              
              {/* Admin Button - Always Visible */}
              <button
                onClick={() => quickLogin('admin@niet.ac.in', 'admin123')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-bold transition-all shadow-md shadow-blue-500/25 mb-4 group"
              >
                <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                System Administrator
              </button>

              {/* Department Selector */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Select Department</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 text-sm font-semibold text-gray-700 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      {currentDept?.code} - {currentDept?.name}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDeptDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showDeptDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
                      {DEPARTMENTS_LIST.map((dept) => (
                        <button
                          key={dept.code}
                          type="button"
                          onClick={() => {
                            setSelectedDept(dept.code)
                            setShowDeptDropdown(false)
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            selectedDept === dept.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-${dept.color}-500`} />
                          <span className="font-medium text-sm">{dept.code}</span>
                          <span className="text-xs text-gray-500 truncate">{dept.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Role Buttons for Selected Department */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-500 text-center">
                  Login as: <span className="font-bold text-gray-700">{currentDept?.code}</span> Department
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {/* HOD Button */}
                  <button
                    onClick={() => quickLogin(getDeptEmail(selectedDept, 'HOD'), getPassword('HOD'))}
                    className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl ${ROLE_COLORS.HOD.bg} ${ROLE_COLORS.HOD.border} ${ROLE_COLORS.HOD.text} text-xs font-bold transition-all border group`}
                  >
                    <UserCheck className={`w-5 h-5 ${ROLE_COLORS.HOD.icon} group-hover:scale-110 transition-transform`} />
                    <span>HOD</span>
                  </button>
                  
                  {/* Staff Button */}
                  <button
                    onClick={() => quickLogin(getDeptEmail(selectedDept, 'STAFF'), getPassword('STAFF'))}
                    className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl ${ROLE_COLORS.STAFF.bg} ${ROLE_COLORS.STAFF.border} ${ROLE_COLORS.STAFF.text} text-xs font-bold transition-all border group`}
                  >
                    <BookOpen className={`w-5 h-5 ${ROLE_COLORS.STAFF.icon} group-hover:scale-110 transition-transform`} />
                    <span>Staff</span>
                  </button>
                  
                  {/* Student Button */}
                  <button
                    onClick={() => quickLogin(getDeptEmail(selectedDept, 'STUDENT'), getPassword('STUDENT'))}
                    className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl ${ROLE_COLORS.STUDENT.bg} ${ROLE_COLORS.STUDENT.border} ${ROLE_COLORS.STUDENT.text} text-xs font-bold transition-all border group`}
                  >
                    <GraduationCap className={`w-5 h-5 ${ROLE_COLORS.STUDENT.icon} group-hover:scale-110 transition-transform`} />
                    <span>Student</span>
                  </button>
                </div>

                {/* Department Pills - Quick Select */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-400 mb-2 text-center">Quick Departments:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI&DS', 'IT', 'CYBER'].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setSelectedDept(code)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          selectedDept === code 
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-gray-400 text-xs animate-fade-in font-medium">
          Secure Authentication System • Enterprise Edition v2.0
        </p>
      </div>

      <style jsx>{`
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
        }
        .orb-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          top: -100px;
          right: -100px;
          animation: orbFloat 8s ease-in-out infinite;
        }
        .orb-2 {
          width: 350px;
          height: 350px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          bottom: -100px;
          left: -100px;
          animation: orbFloat 10s ease-in-out infinite reverse;
        }
        .orb-3 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: orbFloat 12s ease-in-out infinite;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -30px); }
          66% { transform: translate(-20px, 20px); }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .glass-input {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }
        .btn-glow:hover {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-shake { animation: shake 0.4s ease-out; }
      `}</style>
    </div>
  )
}

// ============ STAT CARD ============
function StatCard({ title, value, icon: Icon, trend, color = "blue", subtitle }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  trend?: string;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "pink" | "cyan";
  subtitle?: string;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
    green: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
    purple: "from-violet-500 to-violet-600 shadow-violet-500/25",
    orange: "from-orange-500 to-orange-600 shadow-orange-500/25",
    red: "from-red-500 to-red-600 shadow-red-500/25",
    pink: "from-pink-500 to-pink-600 shadow-pink-500/25",
    cyan: "from-cyan-500 to-cyan-600 shadow-cyan-500/25",
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden stat-card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3" /> {trend}
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-gray-400">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ DEPARTMENT CARD ============
function DeptCard({ dept }: { dept: Department }) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white overflow-hidden dept-card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              {dept.code?.substring(0, 2) || 'DE'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{dept.name}</h3>
              <p className="text-sm text-gray-500">{dept.code}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-2 rounded-lg bg-blue-50/50">
            <p className="text-lg font-bold text-blue-700">{dept.facultyCount || 0}</p>
            <p className="text-xs text-gray-500">Faculty</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-purple-50/50">
            <p className="text-lg font-bold text-purple-700">{dept.studentCount || 0}</p>
            <p className="text-xs text-gray-500">Students</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-50/50">
            <p className="text-lg font-bold text-amber-700">{dept.activityCount || 0}</p>
            <p className="text-xs text-gray-500">Activities</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ ACHIEVEMENT FORM HEADER ============
function AchievementFormHeader({ selectedType }: { selectedType: string | null }) {
  if (!selectedType) return null
  const typeData = (ACHIEVEMENT_TYPES as any)[selectedType]
  if (!typeData) return null
  
  const IconComponent = typeData.icon
  
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeData.color} flex items-center justify-center`}>
        <IconComponent className="w-5 h-5 text-white" />
      </div>
      <div>
        <CardTitle className="text-lg">{typeData.name}</CardTitle>
        <p className="text-sm text-gray-500">Fill in all required fields marked with *</p>
      </div>
    </div>
  )
}

// ============ DATA TABLE ============
function DataTable({ data, columns }: { data: any[]; columns: { key: string; label: string }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <Database className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-6 py-4 text-sm text-gray-700">
                    {row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============ ACTION CARD ============
function ActionCard({ icon: Icon, title, description, color, onClick }: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white overflow-hidden action-card-hover"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}

// ============ ACHIEVEMENT FORM COMPONENT ============
function AchievementForm({ user, onBack }: { user: User; onBack: () => void }) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [otherValues, setOtherValues] = useState<Record<string, string>>({})
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  // Fields that should NOT have "Other" option
  const excludeOtherFields = ['year_pub', 'month', 'date_conf', 'filing_date', 'date_sem', 'start_date', 'end_date', 'date_award', 'date_event', 'offer_date', 'start_train', 'end_train', 'cert_date']

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleOtherChange = (fieldId: string, value: string) => {
    setOtherValues(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Merge form data with other values
    const finalData = { ...formData }
    Object.keys(otherValues).forEach(key => {
      if (otherValues[key]) {
        finalData[key] = otherValues[key]
      }
    })
    
    console.log('Achievement submitted:', {
      type: selectedType,
      data: finalData,
      description,
      department: user.departmentName,
      file: file?.name
    })
    
    setSubmitSuccess(true)
    setIsSubmitting(false)
    
    setTimeout(() => {
      setSubmitSuccess(false)
      setSelectedType(null)
      setFormData({})
      setOtherValues({})
      setDescription('')
      setFile(null)
    }, 2000)
  }

  const renderFormField = (field: any) => {
    const hasOtherOption = field.type === 'select' && !excludeOtherFields.includes(field.id)
    const isOtherSelected = formData[field.id] === 'Other'
    
    return (
      <div key={field.id} className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        
        {field.type === 'text' && (
          <Input
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
            className="bg-white/80"
          />
        )}
        
        {field.type === 'textarea' && (
          <textarea
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            rows={3}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none bg-white/80"
          />
        )}
        
        {field.type === 'number' && (
          <Input
            type="number"
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
            className="bg-white/80"
          />
        )}
        
        {field.type === 'date' && (
          <Input
            type="date"
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className="bg-white/80"
          />
        )}
        
        {field.type === 'select' && (
          <>
            <select
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white/80"
            >
              <option value="">Select {field.label}</option>
              {field.options.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
              {hasOtherOption && <option value="Other">Other</option>}
            </select>
            
            {/* Other option text input */}
            {hasOtherOption && isOtherSelected && (
              <Input
                value={otherValues[field.id] || ''}
                onChange={(e) => handleOtherChange(field.id, e.target.value)}
                placeholder={`Specify ${field.label.toLowerCase()}...`}
                className="mt-2 bg-amber-50 border-amber-200 focus:border-amber-400"
              />
            )}
          </>
        )}
      </div>
    )
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Achievement Submitted!</h3>
        <p className="text-gray-500">Your achievement has been submitted for review.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add New Achievement</h2>
          <p className="text-gray-500">Select an achievement type and fill in the details</p>
        </div>
      </div>

      {!selectedType ? (
        /* Achievement Type Selection */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(ACHIEVEMENT_TYPES).map(([key, type]) => (
            <Card
              key={key}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white overflow-hidden"
              onClick={() => setSelectedType(key)}
            >
              <CardContent className="p-5 text-center">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <type.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{type.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit}>
          <Card className="border border-gray-200">
            <CardHeader className="border-b border-gray-100">
              <AchievementFormHeader selectedType={selectedType} />
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Department Field - Locked for non-admin users */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Department</label>
                <Input
                  value={user.departmentName || ''}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400">Department is auto-filled based on your profile</p>
              </div>

              {/* Dynamic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(ACHIEVEMENT_TYPES as any)[selectedType]?.fields.map(renderFormField)}
              </div>

              {/* Optional Description Field */}
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional details about this achievement..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none bg-white/80"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Upload Certificate/Proof (Optional)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500">
                    {file ? file.name : 'Drag & drop or click to upload'}
                  </p>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="achievement-file"
                  />
                  <label htmlFor="achievement-file" className="inline-block mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm cursor-pointer transition-colors">
                    Browse Files
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedType(null)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Submit Achievement</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}

// ============ FEEDBACK MODULE ============
function FeedbackModule({ user, feedbackEnabled, setFeedbackEnabled }: { 
  user: User; 
  feedbackEnabled: boolean; 
  setFeedbackEnabled: (v: boolean) => void 
}) {
  const [feedbacks, setFeedbacks] = useState([
    { id: 1, category: 'Academic Quality', rating: 5, comment: 'Excellent teaching methodology', anonymous: true, date: '2024-01-15', role: 'Student' },
    { id: 2, category: 'Infrastructure', rating: 4, comment: 'Good labs but need more equipment', anonymous: false, date: '2024-01-14', role: 'Student' },
    { id: 3, category: 'Placement Support', rating: 3, comment: 'Need more company visits', anonymous: true, date: '2024-01-13', role: 'Staff' },
  ])
  const [showForm, setShowForm] = useState(false)
  const [newFeedback, setNewFeedback] = useState({
    category: '',
    rating: 5,
    comment: '',
    anonymous: false
  })

  const categories = ['Academic Quality', 'Infrastructure', 'Faculty Support', 'Laboratory Facilities', 'Library Resources', 'Placement Support', 'Extra-curricular Activities', 'Administration', 'Overall Experience', 'Other']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const feedback = {
      id: Date.now(),
      ...newFeedback,
      date: new Date().toISOString().split('T')[0],
      role: user.role
    }
    setFeedbacks(prev => [feedback, ...prev])
    setShowForm(false)
    setNewFeedback({ category: '', rating: 5, comment: '', anonymous: false })
  }

  const deleteFeedback = (id: number) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feedback Center</h2>
          <p className="text-gray-500">Share your thoughts and help us improve</p>
        </div>
        
        {/* Admin Toggle */}
        {user.role === 'ADMIN' && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Enable Feedback</span>
            <button
              onClick={() => setFeedbackEnabled(!feedbackEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${feedbackEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${feedbackEnabled ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Feedback" value={feedbacks.length} icon={MessageSquare} color="blue" />
        <StatCard title="Average Rating" value={(feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)} icon={Star} color="amber" />
        <StatCard title="Anonymous" value={feedbacks.filter(f => f.anonymous).length} icon={Shield} color="purple" />
        <StatCard title="This Week" value={feedbacks.filter(f => {
          const diff = Date.now() - new Date(f.date).getTime()
          return diff < 7 * 24 * 60 * 60 * 1000
        }).length} icon={Calendar} color="green" />
      </div>

      {/* Submit Form - Only shown when enabled and not admin-only view */}
      {feedbackEnabled && user.role !== 'ADMIN' && (
        <Card className="border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Submit Feedback</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : 'New Feedback'}
              </Button>
            </div>
          </CardHeader>
          
          {showForm && (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category *</label>
                    <select
                      value={newFeedback.category}
                      onChange={(e) => setNewFeedback(prev => ({ ...prev, category: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Rating *</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewFeedback(prev => ({ ...prev, rating: star }))}
                          className={`p-1 rounded transition-colors ${star <= newFeedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                      <span className="text-sm text-gray-500 ml-2">{newFeedback.rating}/5</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Comment *</label>
                  <textarea
                    value={newFeedback.comment}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your feedback..."
                    rows={3}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={newFeedback.anonymous}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, anonymous: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-600">Submit anonymously</label>
                </div>
                
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600">
                  <Send className="w-4 h-4 mr-2" /> Submit Feedback
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      )}

      {/* Disabled Message */}
      {!feedbackEnabled && user.role !== 'ADMIN' && (
        <Card className="border border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
            <h3 className="font-semibold text-amber-800">Feedback Currently Disabled</h3>
            <p className="text-amber-600 text-sm">The administrator has temporarily disabled feedback submissions.</p>
          </CardContent>
        </Card>
      )}

      {/* Feedback List */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {feedbacks.map(feedback => (
              <div key={feedback.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{feedback.category}</Badge>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {feedback.anonymous && <Badge variant="outline"><Shield className="w-3 h-3 mr-1" /> Anonymous</Badge>}
                    <span className="text-xs text-gray-400">{feedback.date}</span>
                    {user.role === 'ADMIN' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => deleteFeedback(feedback.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700">{feedback.comment}</p>
                <p className="text-xs text-gray-400 mt-2">From: {feedback.role}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============ DASHBOARD CONTENT ============
function DashboardContent({ user, setActiveTab }: { user: User; setActiveTab: (tab: TabType) => void }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalDepartments: 0,
    totalFaculty: 0,
    totalStudents: 0,
    totalActivities: 0,
    totalResearch: 0,
    pendingApprovals: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setStats(data.data.stats)
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  // Admin Dashboard
  if (user.role === 'ADMIN') {
    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a2a5e] via-blue-700 to-indigo-700 p-8 text-white banner-gradient">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
            <p className="text-blue-100 text-lg mb-6">Here's what's happening across the institution today.</p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                <p className="text-sm text-blue-100">Pending Approvals</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-2xl font-bold">{stats.totalActivities}</p>
                <p className="text-sm text-blue-100">Activities This Month</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-sm text-blue-100">Total Students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Departments" value={stats.totalDepartments} icon={Building2} color="blue" />
          <StatCard title="Faculty" value={stats.totalFaculty} icon={Users} color="green" />
          <StatCard title="Students" value={stats.totalStudents} icon={GraduationCap} color="purple" />
          <StatCard title="Activities" value={stats.totalActivities} icon={Activity} color="orange" />
          <StatCard title="Research" value={stats.totalResearch} icon={Award} color="pink" />
          <StatCard title="Pending" value={stats.pendingApprovals} icon={Clock} color="red" trend="Needs attention" />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard 
              icon={Users} 
              title="Manage Faculty" 
              description="Register and manage faculty members"
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              onClick={() => setActiveTab('faculty')}
            />
            <ActionCard 
              icon={Calendar} 
              title="Schedule Activities" 
              description="Plan institutional activities and events"
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              onClick={() => setActiveTab('activities')}
            />
            <ActionCard 
              icon={FileCheckIcon} 
              title="Review Approvals" 
              description="Process pending approval requests"
              color="bg-gradient-to-br from-amber-500 to-orange-500"
              onClick={() => setActiveTab('approvals')}
            />
            <ActionCard 
              icon={BarChart3} 
              title="View Analytics" 
              description="Detailed reports and insights"
              color="bg-gradient-to-br from-emerald-500 to-teal-600"
              onClick={() => setActiveTab('analytics')}
            />
          </div>
        </div>

        {/* Recent Activity Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('departments')}>
              View All Departments <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <DataTable 
            data={[
              { module: 'User Management', status: 'Active', lastUpdate: 'Today', records: stats.totalFaculty + stats.totalStudents },
              { module: 'Academic Programs', status: 'Active', lastUpdate: 'Today', records: stats.totalDepartments },
              { module: 'Research Activities', status: 'Active', lastUpdate: 'This Week', records: stats.totalResearch },
              { module: 'Quality Initiatives', status: 'Active', lastUpdate: 'This Month', records: stats.totalActivities },
            ]} 
            columns={[{ key: 'module', label: 'Module' }, { key: 'status', label: 'Status' }, { key: 'lastUpdate', label: 'Last Update' }, { key: 'records', label: 'Records' }]} 
          />
        </div>
      </div>
    )
  }

  // HOD Dashboard
  if (user.role === 'HOD') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Department Dashboard</h2>
          <p className="text-violet-100">{user.departmentName || 'Your Department'} • Head of Department</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Faculty Members" value="24" icon={Users} color="blue" />
          <StatCard title="Students" value="420" icon={GraduationCap} color="green" />
          <StatCard title="Active Projects" value="12" icon={Target} color="purple" />
          <StatCard title="Publications" value="38" icon={Award} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Department Activities
            </h3>
            <DataTable data={[]} columns={[{ key: 'title', label: 'Title' }, { key: 'status', label: 'Status' }]} />
          </Card>
          <Card className="p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Pending Approvals
            </h3>
            <DataTable data={[]} columns={[{ key: 'title', label: 'Request' }, { key: 'by', label: 'Requested By' }]} />
          </Card>
        </div>
      </div>
    )
  }

  // Staff Dashboard
  if (user.role === 'STAFF') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Staff Portal</h2>
          <p className="text-emerald-100">Welcome, {user.name} • {user.departmentName}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="My Activities" value="8" icon={Calendar} color="blue" />
          <StatCard title="Research Papers" value="5" icon={FileText} color="green" />
          <StatCard title="Attendance" value="95%" icon={CheckCircle} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActionCard 
            icon={Plus} 
            title="Submit New Activity" 
            description="Report a new activity or event"
            color="bg-gradient-to-br from-blue-500 to-indigo-600"
            onClick={() => setActiveTab('achievements')}
          />
          <ActionCard 
            icon={MessageSquare} 
            title="Give Feedback" 
            description="Share your thoughts and suggestions"
            color="bg-gradient-to-br from-purple-500 to-pink-600"
            onClick={() => setActiveTab('feedback')}
          />
        </div>
      </div>
    )
  }

  // Student Dashboard - Matching Screenshot Design
  return (
    <div className="space-y-6">
      {/* Stats Cards Row - Matching Screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records */}
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">TOTAL RECORDS</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-gradient-to-r from-cyan-400 to-cyan-500" />
        </Card>

        {/* Pending Approval */}
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">PENDING APPROVAL</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-500" />
        </Card>

        {/* Approved */}
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">APPROVED</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-gradient-to-r from-green-400 to-green-500" />
        </Card>

        {/* Rejected */}
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">REJECTED</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <CloseIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-gradient-to-r from-red-400 to-red-500" />
        </Card>
      </div>

      {/* Charts Section - Activity Trend & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Trend Chart */}
        <Card className="border border-gray-200 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-500" /> Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, i) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-48">
                    <div 
                      className="w-full max-w-[40px] bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-md min-h-[4px]"
                      style={{ height: `${Math.max(4, Math.random() * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-8 mt-4 text-xs text-gray-500">
              <span>1.0</span>
              <span>0.8</span>
              <span>0.6</span>
              <span>0.4</span>
              <span>0.2</span>
              <span>0.0</span>
              <span>-0.2</span>
              <span>-0.4</span>
              <span>-0.6</span>
              <span>-0.8</span>
              <span>-1.0</span>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-cyan-500" /> Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="w-48 h-48 rounded-full border-[20px] border-gray-300 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm text-gray-500">No Data</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 rounded-sm bg-gray-300" />
              <span>No Data</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard 
          icon={Trophy} 
          title="My Achievements" 
          description="View and add your achievements"
          color="bg-gradient-to-br from-amber-500 to-orange-500"
          onClick={() => setActiveTab('achievements')}
        />
        <ActionCard 
          icon={MessageSquare} 
          title="Submit Feedback" 
          description="Help us improve your experience"
          color="bg-gradient-to-br from-purple-500 to-pink-600"
          onClick={() => setActiveTab('feedback')}
        />
        <ActionCard 
          icon={FileText} 
          title="Documents" 
          description="Access certificates and reports"
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
          onClick={() => setActiveTab('documents')}
        />
      </div>
    </div>
  )
}

// PieChart Icon Component
function PieChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  )
}

// Close Icon for Rejected
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  )
}

// ============ DEPARTMENTS PAGE ============
function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDepartments(data.data.map((d: any) => ({
            id: d.id,
            name: d.name,
            code: d.code,
            facultyCount: d._count?.faculty || 0,
            studentCount: d._count?.students || 0,
            activityCount: d._count?.activities || 0
          })))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
          <p className="text-gray-500">Manage all academic departments</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600">
          <Plus className="w-4 h-4" /> Add Department
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {departments.map(dept => (
          <DeptCard key={dept.id} dept={dept} />
        ))}
      </div>
    </div>
  )
}

// ============ FACULTY PAGE ============
function FacultyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Faculty Management</h2>
          <p className="text-gray-500">View and manage faculty members</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600"><Plus className="w-4 h-4" /> Add Faculty</Button>
      </div>
      
      <Card className="p-6 border border-gray-200">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input placeholder="Search faculty..." className="pl-10 bg-white/80" />
          </div>
          <select className="border rounded-lg px-4 bg-white">
            <option>All Departments</option>
          </select>
        </div>
        <DataTable 
          data={[
            { name: 'Dr. R. Kumar', email: 'rkumar@niet.ac.in', department: 'CSE', designation: 'Professor', status: 'Active' },
            { name: 'Dr. S. Devi', email: 'sdevi@niet.ac.in', department: 'ECE', designation: 'Associate Professor', status: 'Active' },
            { name: 'Prof. M. Rajan', email: 'mrajan@niet.ac.in', department: 'EEE', designation: 'Assistant Professor', status: 'Active' },
            { name: 'Dr. K. Singh', email: 'ksingh@niet.ac.in', department: 'MECH', designation: 'Professor', status: 'On Leave' },
          ]}
          columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'department', label: 'Department' }, { key: 'designation', label: 'Designation' }, { key: 'status', label: 'Status' }]}
        />
      </Card>
    </div>
  )
}

// ============ STUDENTS PAGE ============
function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Records</h2>
          <p className="text-gray-500">Manage student information</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600"><Upload className="w-4 h-4" /> Import Students</Button>
      </div>
      
      <Card className="p-6 border border-gray-200">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input placeholder="Search students..." className="pl-10 bg-white/80" />
          </div>
          <select className="border rounded-lg px-4 bg-white">
            <option>All Departments</option>
          </select>
          <select className="border rounded-lg px-4 bg-white">
            <option>All Years</option>
          </select>
        </div>
        <DataTable 
          data={[
            { name: 'Arun Prakash', regNo: '2024CS001', department: 'CSE', year: 'III', cgpa: '8.9' },
            { name: 'Bhavani S.', regNo: '2024EC002', department: 'ECE', year: 'II', cgpa: '9.1' },
            { name: 'Chandru K.', regNo: '2024EE003', department: 'EEE', year: 'IV', cgpa: '8.7' },
            { name: 'Divya M.', regNo: '2024ME004', department: 'MECH', year: 'I', cgpa: '9.3' },
          ]}
          columns={[{ key: 'name', label: 'Name' }, { key: 'regNo', label: 'Reg. No.' }, { key: 'department', label: 'Department' }, { key: 'year', label: 'Year' }, { key: 'cgpa', label: 'CGPA' }]}
        />
      </Card>
    </div>
  )
}

// ============ ACTIVITIES PAGE ============
function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activities & Events</h2>
          <p className="text-gray-500">Track institutional activities</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600"><Plus className="w-4 h-4" /> New Activity</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Technical Symposium', type: 'Workshop', date: '2024-01-15', participants: 250, status: 'Completed' },
          { title: 'Hackathon 2024', type: 'Event', date: '2024-02-20', participants: 180, status: 'Upcoming' },
          { title: 'Guest Lecture - AI', type: 'Lecture', date: '2024-01-28', participants: 320, status: 'Completed' },
          { title: 'Industry Connect', type: 'Seminar', date: '2024-03-05', participants: 150, status: 'Scheduled' },
          { title: 'Cultural Fest', type: 'Event', date: '2024-03-15', participants: 500, status: 'Upcoming' },
          { title: 'FDP on Research', type: 'Training', date: '2024-04-01', participants: 45, status: 'Scheduled' },
        ].map((activity, i) => (
          <Card key={i} className="group hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={activity.status === 'Completed' ? 'default' : activity.status === 'Upcoming' ? 'secondary' : 'outline'} 
                       className={activity.status === 'Completed' ? 'bg-green-100 text-green-700' : activity.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>
                  {activity.status}
                </Badge>
                <span className="text-xs text-gray-500">{activity.type}</span>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{activity.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {activity.date}</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {activity.participants}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============ RESEARCH PAGE ============
function ResearchPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Research & Publications</h2>
          <p className="text-gray-500">Track research output</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600"><Plus className="w-4 h-4" /> Add Publication</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Journal Papers" value="45" icon={FileText} color="blue" />
        <StatCard title="Conferences" value="32" icon={Globe} color="green" />
        <StatCard title="Patents" value="8" icon={Award} color="purple" />
        <StatCard title="Funded Projects" value="12" icon={Trophy} color="orange" />
      </div>
      
      <Card className="p-6 border border-gray-200">
        <DataTable 
          data={[
            { title: 'Machine Learning in Healthcare', authors: 'Dr. R. Kumar et al.', venue: 'IEEE ICML', year: '2024', citations: 15 },
            { title: 'IoT-Based Smart Agriculture', authors: 'Prof. S. Devi', venue: 'Springer IoT Journal', year: '2023', citations: 23 },
            { title: 'Blockchain for Supply Chain', authors: 'Dr. K. Singh et al.', venue: 'ACM Computing', year: '2024', citations: 8 },
          ]}
          columns={[{ key: 'title', label: 'Title' }, { key: 'authors', label: 'Authors' }, { key: 'venue', label: 'Venue' }, { key: 'year', label: 'Year' }, { key: 'citations', label: 'Citations' }]}
        />
      </Card>
    </div>
  )
}

// ============ APPROVALS PAGE ============
function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Approval Requests</h2>
        <p className="text-gray-500">Review and manage pending approvals</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50/50">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-amber-600">12</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500 bg-green-50/50">
          <p className="text-sm text-gray-500">Approved Today</p>
          <p className="text-3xl font-bold text-green-600">8</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500 bg-red-50/50">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-3xl font-bold text-red-600">2</p>
        </Card>
      </div>
      
      <Card className="p-6 border border-gray-200">
        <DataTable 
          data={[
            { id: 'REQ001', type: 'Achievement', requestedBy: 'Arun Prakash', department: 'CSE', date: '2024-01-15', status: 'Pending' },
            { id: 'REQ002', type: 'Leave', requestedBy: 'Dr. R. Kumar', department: 'CSE', date: '2024-01-14', status: 'Pending' },
            { id: 'REQ003', type: 'Reimbursement', requestedBy: 'Bhavani S.', department: 'ECE', date: '2024-01-13', status: 'Approved' },
            { id: 'REQ004', type: 'Achievement', requestedBy: 'Chandru K.', department: 'EEE', date: '2024-01-12', status: 'Rejected' },
          ]}
          columns={[{ key: 'id', label: 'Request ID' }, { key: 'type', label: 'Type' }, { key: 'requestedBy', label: 'Requested By' }, { key: 'department', label: 'Department' }, { key: 'date', label: 'Date' }, { key: 'status', label: 'Status' }]}
        />
      </Card>
    </div>
  )
}

// ============ ANALYTICS PAGE ============
function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-gray-500">Institutional performance metrics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Placement Rate" value="92%" icon={TrendingUp} color="green" trend="+5% from last year" />
        <StatCard title="Pass Percentage" value="94%" icon={CheckCircle} color="blue" />
        <StatCard title="Industry Connect" value="45" icon={HeartHandshake} color="purple" />
        <StatCell title="Accreditation Score" value="A+" icon={Star} color="orange" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" /> Department-wise Results
          </h3>
          <div className="space-y-4">
            {[
              { dept: 'CSE', result: 92, color: 'from-blue-500 to-blue-600' },
              { dept: 'ECE', result: 89, color: 'from-purple-500 to-purple-600' },
              { dept: 'EEE', result: 87, color: 'from-green-500 to-green-600' },
              { dept: 'MECH', result: 91, color: 'from-orange-500 to-orange-600' },
              { dept: 'CIVIL', result: 85, color: 'from-pink-500 to-pink-600' },
            ].map(item => (
              <div key={item.dept}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.dept}</span>
                  <span className="text-gray-500">{item.result}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.result}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-500" /> Activity Distribution
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Workshops', value: 35, color: 'bg-blue-500' },
              { label: 'Seminars', value: 28, color: 'bg-purple-500' },
              { label: 'FDPs', value: 18, color: 'bg-green-500' },
              { label: 'Events', value: 19, color: 'bg-orange-500' },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-xl bg-gray-50">
                <p className="text-2xl font-bold text-gray-900">{item.value}%</p>
                <p className="text-sm text-gray-500">{item.label}</p>
                <div className={`h-1.5 ${item.color} rounded-full mt-2`} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card className="p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Performance Trends</h3>
        <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">Chart.js Integration Ready</p>
            <p className="text-xs text-gray-400">Connect to API for live data visualization</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Helper components
function StatCell({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color.includes('from') ? color : `from-${color}-500 to-${color}-600`} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ DOCUMENTS PAGE ============
function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
          <p className="text-gray-500">IQAC reports and documents</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600"><Upload className="w-4 h-4" /> Upload Document</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: 'AQAR 2023-24', type: 'PDF', size: '2.4 MB', date: '2024-04-15', icon: FileText },
          { name: 'SSR Report', type: 'PDF', size: '5.8 MB', date: '2024-03-20', icon: FileText },
          { name: 'IIQA Document', type: 'DOCX', size: '1.2 MB', date: '2024-02-10', icon: FileText },
          { name: 'Criteria Reports', type: 'ZIP', size: '12.4 MB', date: '2024-04-01', icon: FolderOpen },
          { name: 'NAAC Certificates', type: 'PDF', size: '3.2 MB', date: '2024-01-15', icon: Award },
          { name: 'Annual Report', type: 'PDF', size: '8.1 MB', date: '2024-03-01', icon: FileText },
        ].map((doc, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer border border-gray-100 bg-white">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-red-50">
                  <doc.icon className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.type} • {doc.size}</p>
                  <p className="text-xs text-gray-400 mt-1">{doc.date}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============ SETTINGS PAGE ============
function SettingsPage({ user }: { user: User }) {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500">Manage your account settings</p>
      </div>
      
      <Card className="p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" /> Profile Information
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input defaultValue={user.name} className="mt-1 bg-white/80" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input defaultValue={user.email} className="mt-1 bg-white/80" disabled />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <Input defaultValue={user.role} className="mt-1 bg-white/80" disabled />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Department</label>
              <Input defaultValue={user.departmentName || ''} className="mt-1 bg-white/80" disabled />
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">Save Changes</Button>
        </div>
      </Card>
      
      <Card className="p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" /> Appearance
        </h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <span className="font-medium text-gray-700">Dark Mode</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-indigo-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </Card>
      
      <Card className="p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-500" /> Security
        </h3>
        <div className="space-y-4">
          <Button variant="outline" className="gap-2">
            <Lock className="w-4 h-4" /> Change Password
          </Button>
          <Button variant="outline" className="gap-2 text-red-500 border-red-200 hover:bg-red-50">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ============ ICON IMPORT FIX ============
const UserPlus = Users
const FileCheckIcon = FileText

// ============ NOTIFICATION DROPDOWN ============
function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const notifications = [
    { id: 1, title: 'New approval request', time: '5 min ago', read: false },
    { id: 2, title: 'Achievement approved', time: '1 hour ago', read: false },
    { id: 3, title: 'System update available', time: '2 hours ago', read: true },
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
      </button>
      
      {isOpen && (
        <div className="fixed right-4 top-16 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden notification-dropdown">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {notifications.filter(n => !n.read).length} new
              </Badge>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.map(notif => (
              <div key={notif.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${!notif.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <button className="w-full text-center text-sm text-blue-600 font-medium hover:text-blue-700">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ SIDEBAR ============
function Sidebar({ 
  activeTab, 
  setActiveTab, 
  user,
  open,
  onToggle
}: { 
  activeTab: TabType; 
  setActiveTab: (t: TabType) => void; 
  user: User;
  open: boolean;
  onToggle: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false)
  
  // Role-based menu items - Student and Staff only see Dashboard, Achievements, Feedback
  const getAllMenuItems = (): { id: TabType; icon: React.ElementType; label: string; badge?: string; roles?: string[] }[] => [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'achievements', icon: Trophy, label: 'Achievements', badge: user.role === 'STUDENT' || user.role === 'STAFF' ? 'New' : undefined },
    { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
    { id: 'departments', icon: Building2, label: 'Departments', roles: ['ADMIN', 'HOD'] },
    { id: 'faculty', icon: Users, label: 'Faculty', roles: ['ADMIN', 'HOD'] },
    { id: 'students', icon: GraduationCap, label: 'Students', roles: ['ADMIN', 'HOD'] },
    { id: 'activities', icon: Activity, label: 'Activities', roles: ['ADMIN', 'HOD'] },
    { id: 'research', icon: Award, label: 'Research', roles: ['ADMIN', 'HOD'] },
    { id: 'approvals', icon: CheckCircle, label: 'Approvals', badge: '12', roles: ['ADMIN', 'HOD'] },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', roles: ['ADMIN', 'HOD'] },
    { id: 'documents', icon: FolderOpen, label: 'Documents', roles: ['ADMIN', 'HOD'] },
    { id: 'settings', icon: Settings, label: 'Settings', roles: ['ADMIN', 'HOD'] },
  ]

  const menuItems = getAllMenuItems().filter(item => !item.roles || item.roles.includes(user.role))

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white/95 backdrop-blur-xl border-r border-gray-200 flex flex-col transition-all duration-300 z-50 ${open ? 'fixed inset-y-0 left-0 shadow-2xl' : 'hidden lg:flex'} sidebar-shadow`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a2a5e] via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 logo-glow">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-bold text-gray-900 text-sm block truncate">IQAC ERP</span>
              <span className="text-xs text-gray-500">Enterprise Edition</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
            {!collapsed && (
              <>
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                    activeTab === item.id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {collapsed && item.badge && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Collapse Toggle - Desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="m-3 p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors hidden lg:flex items-center justify-center"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
    </>
  )
}

// ============ MOBILE NAV ============
// Note: Mobile navigation is now handled by the responsive Sidebar component
// This component is kept for reference but the main sidebar toggle is in the header
function MobileNav({ activeTab, setActiveTab, user }: { activeTab: TabType; setActiveTab: (t: TabType) => void; user: User }) {
  const [open, setOpen] = useState(false)
  
  // Role-based menu items - Student and Staff only see Dashboard, Achievements, Feedback
  const getAllMenuItems = (): { id: TabType; icon: React.ElementType; label: string; roles?: string[] }[] => [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'achievements', icon: Trophy, label: 'Achievements' },
    { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
    { id: 'departments', icon: Building2, label: 'Departments', roles: ['ADMIN', 'HOD'] },
    { id: 'faculty', icon: Users, label: 'Faculty', roles: ['ADMIN', 'HOD'] },
    { id: 'students', icon: GraduationCap, label: 'Students', roles: ['ADMIN', 'HOD'] },
    { id: 'activities', icon: Activity, label: 'Activities', roles: ['ADMIN', 'HOD'] },
    { id: 'research', icon: Award, label: 'Research', roles: ['ADMIN', 'HOD'] },
    { id: 'approvals', icon: CheckCircle, label: 'Approvals', roles: ['ADMIN', 'HOD'] },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', roles: ['ADMIN', 'HOD'] },
    { id: 'documents', icon: FolderOpen, label: 'Documents', roles: ['ADMIN', 'HOD'] },
    { id: 'settings', icon: Settings, label: 'Settings', roles: ['ADMIN', 'HOD'] },
  ]

  const menuItems = getAllMenuItems().filter(item => !item.roles || item.roles.includes(user.role))

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-50 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg shadow-blue-500/30"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl mobile-nav-animate">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a2a5e] to-blue-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">IQAC ERP</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-3 space-y-1 overflow-y-auto">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
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

// ============ STUDENT ACHIEVEMENTS PAGE (Matching Screenshot Design) ============
function StudentAchievementsPage({ user }: { user: User }) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [achievements, setAchievements] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Initialize form with user data when type changes
  useEffect(() => {
    if (selectedType) {
      const typeConfig = ACHIEVEMENT_TYPES[selectedType]
      if (typeConfig) {
        const initialData: Record<string, string> = {
          name: user.name || '',
          dept: user.departmentName || '',
          reg: `${user.departmentName || ''}001` // Default reg no
        }
        setFormData(initialData)
      }
    }
  }, [selectedType, user])

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = async () => {
    if (!selectedType) return
    setIsSubmitting(true)
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newAchievement = {
      id: Date.now(),
      type: selectedType,
      typeName: ACHIEVEMENT_TYPES[selectedType]?.label || selectedType,
      title: formData.title || formData.award_name || formData.prog_name || formData.course || formData.event_name || 'Untitled',
      dept: user.departmentName,
      date: new Date().toISOString().split('T')[0],
      status: 'pending_staff',
      data: formData
    }
    
    setAchievements(prev => [newAchievement, ...prev])
    setShowSuccess(true)
    setIsSubmitting(false)
    
    setTimeout(() => {
      setShowSuccess(false)
      setSelectedType('')
      setFormData({})
    }, 2000)
  }

  const handleClear = () => {
    setSelectedType('')
    setFormData({})
  }

  const currentTypeConfig = selectedType ? ACHIEVEMENT_TYPES[selectedType] : null

  // Filter achievements
  const filteredAchievements = achievements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.typeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || a.type === filterType
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Add Student Achievement Card */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-500" /> Add Student Achievement
          </h3>
          
          {/* Type Selector */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Achievement Type <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 bg-white"
              >
                <option value="">-- Select Type --</option>
                {Object.entries(ACHIEVEMENT_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>{type.label}</option>
                ))}
              </select>
            </div>

            {!selectedType ? (
              <p className="text-sm text-gray-500 py-4">Please select an achievement type above.</p>
            ) : (
              /* Dynamic Form Fields */
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentTypeConfig?.fields.map((field) => (
                    <div key={field.id} className={`space-y-1 ${field.full ? 'md:col-span-2' : ''}`}>
                      <label className="text-sm font-medium text-gray-600">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                        {field.locked && <Lock className="w-3 h-3 inline ml-1 text-gray-400" />}
                      </label>
                      
                      {field.type === 'text' && (
                        <input
                          type="text"
                          value={formData[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          disabled={field.locked}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 ${
                            field.locked ? 'bg-gray-100 cursor-not-allowed border-gray-200' : 'bg-white border-gray-200'
                          }`}
                        />
                      )}
                      
                      {field.type === 'number' && (
                        <input
                          type="number"
                          value={formData[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 bg-white"
                        />
                      )}
                      
                      {field.type === 'url' && (
                        <input
                          type="url"
                          value={formData[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 bg-white"
                        />
                      )}
                      
                      {field.type === 'date' && (
                        <input
                          type="date"
                          value={formData[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 bg-white"
                        />
                      )}
                      
                      {field.type === 'select' && (
                        <select
                          value={formData[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 bg-white"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                      
                      {field.type === 'textarea' && (
                        <textarea
                          value={formData[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 resize-none bg-white"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit for Approval
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                  
                  {showSuccess && (
                    <span className="flex items-center gap-1 text-green-600 font-medium ml-4">
                      <CheckCircle className="w-4 h-4" /> Submitted successfully!
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Achievements Table */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          {/* Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <List className="w-5 h-5 text-cyan-500" /> My Achievements
            </h3>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 w-40"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
              >
                <option value="all">All Types</option>
                {Object.entries(ACHIEVEMENT_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>{type.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
              >
                <option value="all">All Status</option>
                <option value="pending_staff">Pending Staff</option>
                <option value="staff_approved">Staff Approved</option>
                <option value="pending_hod">Pending HOD</option>
                <option value="hod_approved">HOD Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">#</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">TYPE</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">TITLE</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">DEPT</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">DATE</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">STATUS</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAchievements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      No achievements yet
                    </td>
                  </tr>
                ) : (
                  filteredAchievements.map((achievement, index) => (
                    <tr key={achievement.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="font-medium">{achievement.typeName}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">{achievement.title}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{achievement.dept}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{achievement.date}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          className={
                            achievement.status === 'hod_approved' ? 'bg-green-100 text-green-700' :
                            achievement.status === 'staff_approved' ? 'bg-blue-100 text-blue-700' :
                            achievement.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }
                        >
                          {achievement.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-amber-600">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// List Icon Component
function List({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}

// ============ STUDENT FEEDBACK PAGE (With Staff/HOD/Admin Selection) ============
function StudentFeedbackPage({ user, feedbackEnabled }: { user: User; feedbackEnabled: boolean }) {
  const [recipient, setRecipient] = useState<'staff' | 'hod' | 'admin'>('staff')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  if (!feedbackEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <MessageSquare className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Feedback Portal Disabled</h3>
        <p className="text-gray-500 max-w-md">The feedback portal has been disabled by the administrator. Please try again later.</p>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!message.trim()) return
    setIsSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setShowSuccess(true)
    setIsSubmitting(false)
    
    setTimeout(() => {
      setShowSuccess(false)
      setSubject('')
      setMessage('')
      setRating(0)
    }, 2500)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" /> Submit Feedback
          </h3>

          <div className="space-y-5">
            {/* Recipient Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">Send Feedback To</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'staff', label: 'Staff Member', icon: UserCheck, color: 'green' },
                  { value: 'hod', label: 'HOD', icon: Shield, color: 'purple' },
                  { value: 'admin', label: 'Administrator', icon: Building2, color: 'blue' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRecipient(option.value as any)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      recipient === option.value 
                        ? `border-${option.color}-500 bg-${option.color}-50` 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option.icon className={`w-6 h-6 ${recipient === option.value ? `text-${option.color}-600` : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${recipient === option.value ? `text-${option.color}-700` : 'text-gray-600'}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject for your feedback"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star 
                      className={`w-8 h-8 transition-colors ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                      }`} 
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-500 self-center">{rating}/5</span>
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Your Feedback</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts, suggestions, or concerns..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !message.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit Feedback
              </button>
              
              {showSuccess && (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle className="w-4 h-4" /> Feedback submitted successfully!
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============ MAIN APP COMPONENT ============
export default function IQACPortal() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [mounted, setMounted] = useState(false)
  const [feedbackEnabled, setFeedbackEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load settings from localStorage
    const savedFeedback = localStorage.getItem('iqac-feedback-enabled')
    if (savedFeedback !== null) {
      setFeedbackEnabled(savedFeedback === 'true')
    }
    const savedTheme = localStorage.getItem('iqac-theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
    }
  }, [])

  // Apply dark mode class to body
  useEffect(() => {
    if (mounted) {
      if (darkMode) {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark-theme')
      } else {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark-theme')
      }
    }
  }, [darkMode, mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading IQAC Portal...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardContent user={user} setActiveTab={setActiveTab} />
      case 'departments': return <DepartmentsPage />
      case 'faculty': return <FacultyPage />
      case 'students': return <StudentsPage />
      case 'activities': return <ActivitiesPage />
      case 'research': return <ResearchPage />
      case 'approvals': return <ApprovalsPage />
      case 'analytics': return <AnalyticsPage />
      case 'documents': return <DocumentsPage />
      case 'settings': return <SettingsPage user={user} />
      case 'achievements': return user?.role === 'STUDENT' 
        ? <StudentAchievementsPage user={user} />
        : <AchievementForm user={user} onBack={() => setActiveTab('dashboard')} />
      case 'feedback': return user?.role === 'STUDENT'
        ? <StudentFeedbackPage user={user} feedbackEnabled={feedbackEnabled} />
        : <FeedbackModule user={user} feedbackEnabled={feedbackEnabled} setFeedbackEnabled={setFeedbackEnabled} />
      default: return <DashboardContent user={user} setActiveTab={setActiveTab} />
    }
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark-theme' : ''}`} suppressHydrationWarning>
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen main-content-wrapper">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-30 header-shadow">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            {/* Sidebar Toggle Button - Top Left with Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#0a2a5e] to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105"
                title="Toggle Menu"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              {/* Logo - Always visible */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0a2a5e] via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 logo-glow">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="font-bold text-gray-900 text-sm block leading-tight">NIET IQAC</span>
                  <span className="text-xs text-gray-500 block leading-tight">ERP Portal</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors w-64">
              <Search className="w-4 h-4" />
              <span className="text-sm">Search...</span>
              <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 rounded bg-gray-200 text-xs text-gray-600 ml-auto">⌘K</kbd>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={() => {
                  setDarkMode(!darkMode)
                  localStorage.setItem('iqac-theme', !darkMode ? 'dark' : 'light')
                }}
                className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications - Fixed z-index */}
              <NotificationDropdown />

              {/* Profile */}
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-200">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-blue-500/20">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role?.toLowerCase()}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 content-area">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm mt-auto footer-sticky">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <p>© 2024 NIET IQAC Enterprise Management System</p>
            <p>Nehru Institute of Engineering and Technology (Autonomous)</p>
          </div>
        </footer>
      </div>

      {/* Mobile Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      {/* Global Styles */}
      <style jsx global>{`
        /* Glassmorphism Utilities */
        .glass {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Dark Theme Variables */
        .dark-theme {
          --bg-primary: #0f172a;
          --bg-secondary: #1e293b;
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --card-bg: rgba(30, 41, 59, 0.8);
          --border-color: rgba(51, 65, 85, 0.5);
        }
        
        .dark-theme .min-h-screen {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
        }
        
        .dark-theme header {
          background: rgba(15, 23, 42, 0.95) !important;
          border-bottom-color: rgba(51, 65, 85, 0.5) !important;
        }
        
        .dark-theme aside {
          background: rgba(15, 23, 42, 0.98) !important;
          border-right-color: rgba(51, 65, 85, 0.5) !important;
        }
        
        .dark-theme .text-gray-900 { color: #f1f5f9 !important; }
        .dark-theme .text-gray-700 { color: #cbd5e1 !important; }
        .dark-theme .text-gray-500 { color: #94a3b8 !important; }
        .dark-theme .bg-white { background: rgba(30, 41, 59, 0.8) !important; }
        .dark-theme .border-gray-200 { border-color: rgba(51, 65, 85, 0.5) !important; }
        .dark-theme .bg-gray-50 { background: rgba(30, 41, 59, 0.5) !important; }
        .dark-theme .bg-gray-100 { background: rgba(51, 65, 85, 0.3) !important; }
        
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        
        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .content-area > div {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Card Hover Effects */
        .stat-card-hover:hover {
          transform: translateY(-4px);
        }
        
        .dept-card-hover:hover {
          transform: translateY(-4px);
        }
        
        .action-card-hover:hover {
          transform: translateY(-4px);
        }
        
        /* Sidebar Shadow */
        .sidebar-shadow {
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
        }
        
        /* Header Shadow */
        .header-shadow {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }
        
        /* Footer Sticky */
        .footer-sticky {
          position: sticky;
          bottom: 0;
        }
        
        /* Logo Glow Effect */
        .logo-glow {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
        
        /* Banner Gradient Animation */
        .banner-gradient {
          position: relative;
          overflow: hidden;
        }
        .banner-gradient::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
        
        /* Notification Dropdown Animation */
        .notification-dropdown {
          animation: dropIn 0.2s ease-out;
        }
        
        @keyframes dropIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Mobile Nav Animation */
        .mobile-nav-animate {
          animation: slideInLeft 0.3s ease-out;
        }
        
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        /* Main Content Wrapper */
        .main-content-wrapper {
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
        }
        
        .dark-theme .main-content-wrapper {
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
        }
      `}</style>
    </div>
  )
}
