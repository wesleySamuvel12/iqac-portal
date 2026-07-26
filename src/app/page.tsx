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
  Newspaper, Handshake, Circle,
  DollarSign, Paperclip, Inbox, Tag, XCircle, ArrowLeft,
  Save
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
  | 'staff_achievement' | 'student_achievement_view'
  | 'hod_student_approval' | 'hod_staff_approval' | 'my_achievement'

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

// ============ LOGIN PAGE - LIQUID GLASS DESIGN ============
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'STAFF' | 'HOD' | 'ADMIN'>('STUDENT')
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
      case 'ADMIN': return 'admin123'
      case 'HOD': return 'hod123'
      case 'STAFF': return 'staff123'
      case 'STUDENT': return 'student123'
      default: return ''
    }
  }

  const currentDept = DEPARTMENTS_LIST.find(d => d.code === selectedDept)

  // Role configuration for tabs
  const roleTabs = [
    { id: 'STUDENT' as const, label: 'Student', icon: GraduationCap, color: 'emerald', gradient: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
    { id: 'STAFF' as const, label: 'Staff / Faculty', icon: BookOpen, color: 'blue', gradient: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
    { id: 'HOD' as const, label: 'HOD', icon: UserCheck, color: 'purple', gradient: 'from-purple-500 to-violet-600', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
    { id: 'ADMIN' as const, label: 'IQAC Admin', icon: Shield, color: 'amber', gradient: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  ]

  const getPlaceholderForRole = () => {
    switch(selectedRole) {
      case 'STUDENT': return 'student_cse1@niet.ac.in'
      case 'STAFF': return 'staff_cse1@niet.ac.in'
      case 'HOD': return 'hod_cse@niet.ac.in'
      case 'ADMIN': return 'admin@niet.ac.in'
      default: return 'Enter your email'
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 flex flex-col">
      {/* Ambient Background with Soft Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40" />
        
        {/* Soft Floating Orbs - Light Theme */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-200/40 to-blue-200/30 rounded-full blur-3xl animate-float-orb-1" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-sky-200/40 to-cyan-200/30 rounded-full blur-3xl animate-float-orb-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-100/20 to-pink-100/20 rounded-full blur-3xl animate-float-orb-3" />
        
        {/* Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Decorative Shapes */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-indigo-300/60 rounded-full animate-pulse-slow-light" />
        <div className="absolute top-40 right-32 w-3 h-3 bg-blue-300/50 rounded-full animate-pulse-slow-light-delayed" />
        <div className="absolute bottom-32 left-40 w-2 h-2 bg-cyan-300/60 rounded-full animate-pulse-slow-light" />
        <div className="absolute bottom-20 right-20 w-2.5 h-2.5 bg-violet-300/50 rounded-full animate-pulse-slow-light-delayed" />
      </div>

      {/* Institutional Verification Badge - Top Status Bar */}
      <header className="relative z-20 w-full bg-white/70 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-700">NAAC Accredited</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">NIRF Participant</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                IT Support
              </a>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-400">NIET Campus Portal v3.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[480px]">
          {/* Logo & Header Section */}
          <div className="text-center mb-8 light-header-animate">
            {/* Logo with Light Glass Effect */}
            <div className="relative inline-block mb-5">
              {/* Soft Shadow/Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-200/50 to-blue-200/50 blur-xl opacity-70" />
              
              {/* Main Logo Container - White Glass */}
              <div className="relative w-24 h-24 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-xl shadow-slate-200/50 flex items-center justify-center">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 flex items-center justify-center shadow-inner">
                  <Building2 className="w-10 h-10 text-white drop-shadow" />
                </div>
                
                {/* Subtle Shine Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/40 to-transparent" />
              </div>

              {/* Small Decorative Elements */}
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-300/50 flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-1.5 tracking-tight">
              IQAC Portal
            </h1>
            <p className="text-slate-500 text-sm sm:text-base font-medium">
              Nehru Institute of Engineering and Technology
            </p>
          </div>

          {/* Light Glass Login Card */}
          <div className="light-glass-card light-card-enter">
            {/* Role-Based Tabbed Selection */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block px-1">
                Select Your Role
              </label>
              <div className="grid grid-cols-4 gap-2">
                {roleTabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = selectedRole === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedRole(tab.id)}
                      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 group ${
                        isActive 
                          ? `${tab.bgColor} ${tab.borderColor} shadow-sm` 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? `bg-gradient-to-br ${tab.gradient} shadow-md` 
                          : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}>
                        <Icon className={`w-4.5 h-4.5 transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                        }`} />
                      </div>
                      <span className={`text-[10px] sm:text-xs font-semibold leading-tight text-center transition-colors duration-300 ${
                        isActive ? tab.textColor : 'text-slate-500'
                      }`}>
                        {tab.label.split(' ')[0]}
                      </span>
                      {isActive && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full bg-gradient-to-r tab.gradient opacity-60" 
                             style={{background: `linear-gradient(to right, var(--tw-gradient-stops))`}} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 light-error-shake">
                <p className="text-red-600 text-sm flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  Email Address
                </label>
                <div className="relative group">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={getPlaceholderForRole()}
                    className="light-input pl-11 pr-4 py-3.5 h-auto border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-slate-400" />
                  Password
                </label>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="light-input pl-11 pr-11 py-3.5 h-auto border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-all duration-200 hover:scale-110 rounded-md hover:bg-indigo-50"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Primary Indigo Action Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-base shadow-lg shadow-indigo-200 transition-all duration-300 group light-submit-btn"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In to Portal
                      <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Quick Access</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            {/* Quick Login Section */}
            <div className="space-y-4">
              {/* Admin Quick Access - Only show if not already on admin tab */}
              {selectedRole !== 'ADMIN' && (
                <button
                  onClick={() => quickLogin('admin@niet.ac.in', 'admin123')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-300 hover:shadow-md hover:shadow-amber-100 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                      <Shield className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-amber-800">System Administrator</p>
                      <p className="text-xs text-amber-600">Full access to all modules</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              )}

              {/* Department Selector */}
              {selectedRole !== 'ADMIN' && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">Select Department</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm text-sm font-medium text-slate-700 transition-all duration-200"
                    >
                      <span className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center border border-slate-200">
                          <Building2 className="w-4 h-4 text-indigo-500" />
                        </div>
                        <span>{currentDept?.code} - {currentDept?.name}</span>
                      </span>
                      <ChevronDown className={`w-4.5 h-4.5 text-slate-400 transition-transform duration-200 ${showDeptDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showDeptDropdown && (
                      <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 max-h-56 overflow-y-auto light-dropdown-enter">
                        {DEPARTMENTS_LIST.map((dept) => (
                          <button
                            key={dept.code}
                            type="button"
                            onClick={() => {
                              setSelectedDept(dept.code)
                              setShowDeptDropdown(false)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-all duration-150 first:rounded-t-xl last:rounded-b-xl ${
                              selectedDept === dept.code ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                            }`}
                          >
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              dept.color === 'blue' ? 'bg-blue-500' :
                              dept.color === 'green' ? 'bg-emerald-500' :
                              dept.color === 'purple' ? 'bg-purple-500' :
                              dept.color === 'orange' ? 'bg-orange-500' :
                              dept.color === 'pink' ? 'bg-pink-500' :
                              dept.color === 'cyan' ? 'bg-cyan-500' :
                              dept.color === 'red' ? 'bg-red-500' :
                              'bg-indigo-500'
                            }`} />
                            <span className="font-medium text-sm">{dept.code}</span>
                            <span className="text-xs text-slate-400 truncate">{dept.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Role Quick Login Buttons */}
              {selectedRole !== 'ADMIN' && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => quickLogin(getDeptEmail(selectedDept, 'STUDENT'), getPassword('STUDENT'))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      selectedRole === 'STUDENT' 
                        ? 'bg-emerald-50 border-emerald-300 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50'
                    }`}
                  >
                    <GraduationCap className={`w-5 h-5 ${selectedRole === 'STUDENT' ? 'text-emerald-600' : 'text-slate-500'}`} />
                    <span className={`text-xs font-semibold ${selectedRole === 'STUDENT' ? 'text-emerald-700' : 'text-slate-600'}`}>Student</span>
                  </button>
                  
                  <button
                    onClick={() => quickLogin(getDeptEmail(selectedDept, 'STAFF'), getPassword('STAFF'))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      selectedRole === 'STAFF' 
                        ? 'bg-blue-50 border-blue-300 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/50'
                    }`}
                  >
                    <BookOpen className={`w-5 h-5 ${selectedRole === 'STAFF' ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className={`text-xs font-semibold ${selectedRole === 'STAFF' ? 'text-blue-700' : 'text-slate-600'}`}>Staff</span>
                  </button>
                  
                  <button
                    onClick={() => quickLogin(getDeptEmail(selectedDept, 'HOD'), getPassword('HOD'))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      selectedRole === 'HOD' 
                        ? 'bg-purple-50 border-purple-300 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-purple-50/50'
                    }`}
                  >
                    <UserCheck className={`w-5 h-5 ${selectedRole === 'HOD' ? 'text-purple-600' : 'text-slate-500'}`} />
                    <span className={`text-xs font-semibold ${selectedRole === 'HOD' ? 'text-purple-700' : 'text-slate-600'}`}>HOD</span>
                  </button>
                </div>
              )}

              {/* Quick Department Pills */}
              {selectedRole !== 'ADMIN' && (
                <div className="pt-2">
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {['CSE', 'ECE', 'EEE', 'MECH', 'AI&DS', 'IT'].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setSelectedDept(code)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                          selectedDept === code 
                            ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-200' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 border border-slate-200'
                        }`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center mt-6 text-slate-400 text-xs font-medium light-footer-fade-in flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            Secure Authentication • NIET IQAC Enterprise
          </p>
        </div>
      </main>

      {/* Light Theme Styles */}
      <style jsx>{`
        /* Floating Orb Animations */
        .animate-float-orb-1 {
          animation: floatOrb1 20s ease-in-out infinite;
        }
        .animate-float-orb-2 {
          animation: floatOrb2 25s ease-in-out infinite reverse;
        }
        .animate-float-orb-3 {
          animation: floatOrb3 30s ease-in-out infinite;
        }
        
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 25px) scale(1.05); }
          66% { transform: translate(25px, -15px) scale(0.95); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(25px, -20px) scale(1.08); }
          66% { transform: translate(-25px, 25px) scale(0.92); }
        }
        @keyframes floatOrb3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(40px, 30px) rotate(180deg); }
        }

        /* Pulse Animations for Light Theme */
        .animate-pulse-slow-light {
          animation: pulseLight 3s ease-in-out infinite;
        }
        .animate-pulse-slow-light-delayed {
          animation: pulseLight 3s ease-in-out infinite 0.7s;
        }
        @keyframes pulseLight {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* Light Glass Card */
        .light-glass-card {
          position: relative;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 10px 15px -3px rgba(0, 0, 0, 0.08),
            0 20px 25px -5px rgba(0, 0, 0, 0.05),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset;
          overflow: hidden;
        }
        
        .light-glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
        }

        /* Card Enter Animation */
        .light-card-enter {
          animation: lightCardEnter 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes lightCardEnter {
          0% { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }

        /* Header Animation */
        .light-header-animate {
          animation: lightHeaderFadeIn 0.7s ease-out 0.15s both;
        }
        @keyframes lightHeaderFadeIn {
          0% { 
            opacity: 0; 
            transform: translateY(-20px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0);
          }
        }

        /* Light Input Styles */
        .light-input {
          transition: all 0.2s ease;
        }
        .light-input:focus {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        /* Submit Button Hover Effect */
        .light-submit-btn {
          position: relative;
          overflow: hidden;
        }
        .light-submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s ease;
        }
        .light-submit-btn:hover::before {
          left: 100%;
        }

        /* Dropdown Animation */
        .light-dropdown-enter {
          animation: lightDropdownSlide 0.25s ease-out;
        }
        @keyframes lightDropdownSlide {
          0% { 
            opacity: 0; 
            transform: translateY(-8px) scale(0.97);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }

        /* Error Shake */
        .light-error-shake {
          animation: lightErrorShake 0.5s ease-out;
        }
        @keyframes lightErrorShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(3px); }
        }

        /* Footer Fade In */
        .light-footer-fade-in {
          animation: lightFadeInUp 0.6s ease-out 0.4s both;
        }
        @keyframes lightFadeInUp {
          0% { 
            opacity: 0; 
            transform: translateY(8px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
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
  
  // Role-based menu items - Different menus for each role
  const getAllMenuItems = (): { id: TabType; icon: React.ElementType; label: string; badge?: string; roles?: string[] }[] => [
    // Common items
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    
    // Student specific
    { id: 'achievements', icon: Trophy, label: 'Achievements', roles: ['STUDENT'], badge: 'New' },
    { id: 'feedback', icon: MessageSquare, label: 'Feedback', roles: ['STUDENT'] },
    
    // Staff specific - 3 buttons only
    { id: 'staff_achievement', icon: Award, label: 'Staff Achievement', roles: ['STAFF'], badge: 'New' },
    { id: 'feedback', icon: MessageSquare, label: 'Feedback', roles: ['STAFF'] },
    { id: 'student_achievement_view', icon: GraduationCap, label: 'Student Achievement', roles: ['STAFF'], badge: 'Pending' },
    
    // HOD specific - 3 additional buttons (Dashboard is common)
    { id: 'my_achievement', icon: Trophy, label: 'My Achievement', roles: ['HOD'], badge: 'New' },
    { id: 'hod_student_approval', icon: GraduationCap, label: 'Student Achievement Approval', roles: ['HOD'], badge: 'Pending' },
    { id: 'hod_staff_approval', icon: BookOpen, label: 'Staff Achievement Approval', roles: ['HOD'], badge: 'Pending' },
    
    // Admin items
    { id: 'departments', icon: Building2, label: 'Departments', roles: ['ADMIN'] },
    { id: 'faculty', icon: Users, label: 'Faculty', roles: ['ADMIN'] },
    { id: 'students', icon: GraduationCap, label: 'Students', roles: ['ADMIN'] },
    { id: 'activities', icon: Activity, label: 'Activities', roles: ['ADMIN'] },
    { id: 'research', icon: Award, label: 'Research', roles: ['ADMIN'] },
    { id: 'approvals', icon: CheckCircle, label: 'Approvals', badge: '12', roles: ['ADMIN'] },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', roles: ['ADMIN'] },
    { id: 'documents', icon: FolderOpen, label: 'Documents', roles: ['ADMIN'] },
    { id: 'settings', icon: Settings, label: 'Settings', roles: ['ADMIN'] },
    { id: 'achievements', icon: Trophy, label: 'Achievements', roles: ['ADMIN'] },
    { id: 'feedback', icon: MessageSquare, label: 'Feedback', roles: ['ADMIN'] },
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
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
            {!collapsed && (
              <>
                <span className={`truncate ${activeTab === item.id ? 'font-semibold' : ''}`}>{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto px-2 py-0.5 text-xs rounded-full font-medium ${
                    activeTab === item.id ? 'bg-indigo-100 text-indigo-700' : 'bg-red-50 text-red-600'
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

// ============ STAFF ACHIEVEMENT TYPES (Achievement & Research & Publication) ============
// Matching exact screenshot specifications
const STAFF_ACHIEVEMENT_TYPES = {
  // ==================== ACHIEVEMENT CATEGORY ====================
  // Industry Interaction Record
  industry_interaction: {
    label: 'Industry Interaction',
    icon: Handshake,
    color: 'from-emerald-500 to-teal-600',
    category: 'achievement',
    headerTitle: 'Add Record',
    headerIcon: PlusCircle,
    fields: [
      { id: 'faculty_name', label: 'FACULTY NAME', type: 'text', required: true, full: false },
      { id: 'dept', label: 'DEPT', type: 'dept_select', required: true, full: false },
      { id: 'designation', label: 'DESIGNATION', type: 'text', required: false, full: false },
      { id: 'company_name', label: 'COMPANY NAME', type: 'text', required: true, full: true },
      { id: 'address', label: 'ADDRESS', type: 'text', required: false, full: false },
      { id: 'nature', label: 'NATURE', type: 'select', options: ['Consultancy', 'MOU Signed', 'Guest Lecture', 'Industrial Visit', 'Training Program', 'Internship', 'Project Guidance', 'Other'], full: false },
      { id: 'interaction_type', label: 'INTERACTION TYPE', type: 'select', options: ['Online', 'Offline', 'Hybrid'], full: false },
      { id: 'date', label: 'DATE', type: 'date', required: false, full: false },
      { id: 'certificate_link', label: 'CERTIFICATE LINK', type: 'url', required: false, placeholder: 'https://...', full: true }
    ]
  },
  // Award Record
  award_record: {
    label: 'Award Record',
    icon: Trophy,
    color: 'from-yellow-500 to-amber-600',
    category: 'achievement',
    headerTitle: 'Add Record',
    headerIcon: PlusCircle,
    fields: [
      { id: 'faculty_name', label: 'FACULTY NAME', type: 'text', required: true, full: false },
      { id: 'dept', label: 'DEPT', type: 'dept_select', required: true, full: false },
      { id: 'designation', label: 'DESIGNATION', type: 'text', required: false, full: false },
      { id: 'award_name', label: 'AWARD NAME', type: 'text', required: true, full: true },
      { id: 'event', label: 'EVENT', type: 'text', required: false, full: false },
      { id: 'organizer', label: 'ORGANIZER', type: 'text', required: false, full: false },
      { id: 'level', label: 'LEVEL', type: 'select', options: ['International', 'National', 'State', 'Regional', 'Institutional', 'Departmental'], full: false },
      { id: 'position', label: 'POSITION', type: 'text', required: false, full: false },
      { id: 'award_date', label: 'DATE', type: 'date', required: false, full: false }
    ]
  },
  // Event Organized Record
  event_organized: {
    label: 'Event Organized',
    icon: Calendar,
    color: 'from-pink-500 to-rose-600',
    category: 'achievement',
    headerTitle: 'Add Record',
    headerIcon: PlusCircle,
    fields: [
      { id: 'faculty_name', label: 'FACULTY NAME', type: 'text', required: true, full: false },
      { id: 'dept', label: 'DEPT', type: 'dept_select', required: true, full: false },
      { id: 'designation', label: 'DESIGNATION', type: 'text', required: false, full: false },
      { id: 'event_title', label: 'EVENT TITLE', type: 'text', required: true, full: true },
      { id: 'event_type', label: 'TYPE', type: 'select', options: ['Workshop', 'Seminar', 'Conference', 'FDP', 'STTP', 'Webinar', 'Guest Lecture', 'Hackathon', 'Symposium', 'Other'], full: false },
      { id: 'organizing_institute', label: 'ORGANIZING INSTITUTE', type: 'text', required: false, full: false },
      { id: 'state', label: 'STATE', type: 'text', required: false, full: false },
      { id: 'from_date', label: 'FROM DATE', type: 'date', required: false, full: false },
      { id: 'to_date', label: 'TO DATE', type: 'date', required: false, full: false },
      { id: 'mode', label: 'MODE', type: 'select', options: ['Online', 'Offline', 'Hybrid'], full: false },
      { id: 'certificate_link', label: 'CERTIFICATE LINK', type: 'url', required: false, placeholder: 'https://...', full: false },
      { id: 'proceeding_link', label: 'PROCEEDING LINK', type: 'url', required: false, placeholder: 'https://...', full: false }
    ]
  },
  // FDP / STTP Entry
  fdp_sttp: {
    label: 'FDP / STTP',
    icon: GraduationCap,
    color: 'from-green-500 to-teal-600',
    category: 'achievement',
    headerTitle: 'Add Entry',
    headerIcon: PlusCircle,
    fields: [
      { id: 'faculty_name', label: 'FACULTY NAME', type: 'text', required: true, full: false },
      { id: 'dept', label: 'DEPT', type: 'dept_select', required: true, full: false },
      { id: 'designation', label: 'DESIGNATION', type: 'text', required: false, full: false },
      { id: 'platform', label: 'PLATFORM', type: 'select', options: ['NPTEL', 'SWAYAM', 'Coursera', 'edX', 'Udemy', 'ATAL', 'AICTE', 'Other'], full: false },
      { id: 'course_name', label: 'COURSE NAME', type: 'text', required: true, full: true },
      { id: 'domain', label: 'DOMAIN', type: 'text', required: false, full: false },
      { id: 'duration_weeks', label: 'DURATION (WKS)', type: 'number', required: false, full: false },
      { id: 'score', label: 'SCORE (%)', type: 'number', required: false, full: false },
      { id: 'grade', label: 'GRADE', type: 'select', options: ['Elite + Gold', 'Elite + Silver', 'Elite', 'Successfully Completed', 'Completed', 'With Distinction'], full: false },
      { id: 'certificate_link', label: 'CERTIFICATE LINK', type: 'url', required: false, placeholder: 'https://...', full: true }
    ]
  },

  // ==================== RESEARCH & PUBLICATION CATEGORY ====================
  // Add Grant
  grant: {
    label: 'Grant',
    icon: DollarSign,
    color: 'from-blue-500 to-indigo-600',
    category: 'research_publication',
    headerTitle: 'Add Grant',
    headerIcon: PlusCircle,
    fields: [
      { id: 'pi_name', label: 'PI NAME', type: 'text', required: true, full: false },
      { id: 'co_pi_name', label: 'CO-PI NAME (IF ANY)', type: 'text', required: false, placeholder: 'Co-PI faculty name', full: false },
      { id: 'dept', label: 'DEPT', type: 'dept_select', required: true, full: false },
      { id: 'project_title', label: 'PROJECT TITLE', type: 'text', required: true, full: true },
      { id: 'funding_agency', label: 'FUNDING AGENCY', type: 'text', required: false, full: false },
      { id: 'scheme', label: 'SCHEME', type: 'text', required: false, full: false },
      { id: 'year', label: 'YEAR', type: 'year_only', required: false, defaultValue: '2025', full: false },
      { id: 'amount', label: 'AMOUNT (₹)', type: 'number', required: false, full: false },
      { id: 'received', label: 'RECEIVED (₹)', type: 'number', required: false, full: false },
      { id: 'status', label: 'STATUS', type: 'select', options: ['Sanctioned', 'In Progress', 'Completed', 'Submitted', 'Approved', 'Rejected'], full: false },
      { id: 'sanction_letter_link', label: 'SANCTION LETTER PDF LINK', type: 'url', required: false, placeholder: 'https://drive.google.com/...', full: true }
    ]
  },
  // Add Publication (Conference)
  publication: {
    label: 'Publication',
    icon: Mic,
    color: 'from-purple-500 to-violet-600',
    category: 'research_publication',
    headerTitle: 'Add Publication',
    headerIcon: PlusCircle,
    fields: [
      { id: 'faculty_name', label: 'FACULTY NAME', type: 'text', required: true, full: false },
      { id: 'dept', label: 'DEPT', type: 'dept_select', required: true, full: false },
      { id: 'paper_title', label: 'PAPER TITLE', type: 'text', required: true, full: true },
      { id: 'conference_name', label: 'CONFERENCE NAME', type: 'text', required: true, full: true },
      { id: 'pub_type', label: 'TYPE', type: 'select', options: ['International Journal', 'National Journal', 'International Conference', 'National Conference', 'Magazine', 'Other'], full: false },
      { id: 'mode', label: 'MODE', type: 'select', options: ['Online', 'Offline', 'Hybrid'], full: false },
      { id: 'publisher', label: 'PUBLISHER', type: 'text', required: false, full: false },
      { id: 'month', label: 'MONTH', type: 'month_select', required: false, full: false },
      { id: 'year', label: 'YEAR', type: 'year_only', required: false, defaultValue: '2025', full: false },
      { id: 'indexed', label: 'INDEXED', type: 'select', options: ['SCI', 'Scopus', 'UGC Care', 'Web of Science', 'IEEE', 'Springer', 'Elsevier', 'Not Indexed', 'Other'], full: false },
      { id: 'designation', label: 'DESIGNATION', type: 'text', required: false, placeholder: 'e.g. Professor', full: false },
      { id: 'status', label: 'STATUS', type: 'select', options: ['Published', 'Accepted', 'Under Review', 'Presented'], full: false },
      { id: 'certificate_link', label: 'CERTIFICATE LINK', type: 'url', required: false, placeholder: 'https://...', full: false },
      { id: 'proceeding_link', label: 'PROCEEDING LINK', type: 'url', required: false, placeholder: 'https://...', full: true }
    ]
  },
  // Add Chapter
  chapter: {
    label: 'Book Chapter',
    icon: BookOpen,
    color: 'from-cyan-500 to-blue-600',
    category: 'research_publication',
    headerTitle: 'Add Chapter',
    headerIcon: PlusCircle,
    fields: [
      { id: 'faculty_name', label: 'FACULTY NAME', type: 'text', required: true, full: false },
      { id: 'dept', label: 'DEPT', type: 'dept_select', required: true, full: false },
      { id: 'chapter_title', label: 'CHAPTER TITLE', type: 'text', required: true, full: true },
      { id: 'book_name', label: 'BOOK NAME', type: 'text', required: true, full: true },
      { id: 'publisher', label: 'PUBLISHER', type: 'text', required: false, full: false },
      { id: 'month', label: 'MONTH', type: 'month_select', required: false, full: false },
      { id: 'year', label: 'YEAR', type: 'year_only', required: false, defaultValue: '2025', full: false },
      { id: 'designation', label: 'DESIGNATION', type: 'text', required: false, placeholder: 'e.g. Professor', full: false },
      { id: 'no_of_authors', label: 'NO. OF AUTHORS', type: 'number', required: false, full: false },
      { id: 'author_position', label: 'AUTHOR POSITION', type: 'text', required: false, placeholder: 'e.g. First Author', full: false },
      { id: 'indexed', label: 'INDEXED', type: 'text', required: false, full: false },
      { id: 'pdf_link', label: 'BOOK CHAPTER PDF LINK', type: 'url', required: false, placeholder: 'https://drive.google.com/...', full: true }
    ]
  },
  // Add Book
  book: {
    label: 'Book',
    icon: BookOpen,
    color: 'from-amber-500 to-orange-600',
    category: 'research_publication',
    headerTitle: 'Add Book',
    headerIcon: PlusCircle,
    fields: [
      { id: 'faculty_name', label: 'FACULTY NAME', type: 'text', required: true, full: false },
      { id: 'dept', label: 'DEPT', type: 'dept_select', required: true, full: false },
      { id: 'book_title', label: 'BOOK TITLE', type: 'text', required: true, full: true },
      { id: 'publisher', label: 'PUBLISHER', type: 'text', required: false, full: false },
      { id: 'isbn', label: 'ISBN', type: 'text', required: false, full: false },
      { id: 'month', label: 'MONTH', type: 'month_select', required: false, full: false },
      { id: 'year', label: 'YEAR', type: 'year_only', required: false, defaultValue: '2025', full: false },
      { id: 'designation', label: 'DESIGNATION', type: 'text', required: false, placeholder: 'e.g. Professor', full: false },
      { id: 'no_of_authors', label: 'NO. OF AUTHORS', type: 'number', required: false, full: false },
      { id: 'author_position', label: 'AUTHOR POSITION', type: 'text', required: false, placeholder: 'e.g. First Author', full: false },
      { id: 'indexed', label: 'INDEXED', type: 'text', required: false, full: false },
      { id: 'book_front_page_link', label: 'BOOK FRONT PAGE + AUTHOR PAGE LINK', type: 'url', required: false, placeholder: 'https://drive.google.com/...', full: true }
    ]
  },
  // Add Patent
  patent: {
    label: 'Patent',
    icon: Lightbulb,
    color: 'from-red-500 to-pink-600',
    category: 'research_publication',
    headerTitle: 'Add Patent',
    headerIcon: PlusCircle,
    fields: [
      { id: 'faculty_name', label: 'FACULTY NAME', type: 'text', required: true, full: false },
      { id: 'dept', label: 'DEPT', type: 'dept_select', required: true, full: false },
      { id: 'designation', label: 'DESIGNATION', type: 'text', required: false, full: false },
      { id: 'invention_title', label: 'INVENTION TITLE', type: 'text', required: true, full: true },
      { id: 'patent_no', label: 'PATENT NO.', type: 'text', required: false, full: false },
      { id: 'month', label: 'MONTH', type: 'month_select', required: false, full: false },
      { id: 'year', label: 'YEAR', type: 'year_only', required: false, defaultValue: '2025', full: false },
      { id: 'patent_type', label: 'TYPE', type: 'select', options: ['Design', 'Product', 'Process', 'Software', 'Other'], full: false },
      { id: 'status', label: 'STATUS', type: 'select', options: ['Filed', 'Published', 'Granted', 'Under Examination', 'Abandoned'], full: false },
      { id: 'country', label: 'COUNTRY', type: 'text', required: false, defaultValue: 'India', full: false },
      { id: 'google_drive_link', label: 'PATENT GOOGLE DRIVE LINK', type: 'url', required: false, placeholder: 'https://drive.google.com/...', full: true }
    ]
  },
  // Journal Publication (Detailed - Screenshot 6)
  journal_detailed: {
    label: 'Journal Paper',
    icon: Newspaper,
    color: 'from-slate-500 to-gray-700',
    category: 'research_publication',
    headerTitle: 'Add Record',
    headerIcon: PlusCircle,
    fields: [
      { id: 'faculty_name', label: 'FACULTY NAME', type: 'text', required: true, full: false },
      { id: 'dept', label: 'DEPT', type: 'dept_select', required: true, full: false },
      { id: 'designation', label: 'DESIGNATION', type: 'text', required: false, full: false },
      { id: 'paper_title', label: 'PAPER TITLE', type: 'text', required: true, full: true },
      { id: 'journal_name', label: 'JOURNAL NAME', type: 'text', required: true, full: true },
      { id: 'publisher', label: 'PUBLISHER', type: 'text', required: false, full: false },
      { id: 'issn', label: 'ISSN', type: 'text', required: false, full: false },
      { id: 'month', label: 'MONTH', type: 'month_select', required: false, full: false },
      { id: 'year', label: 'YEAR', type: 'year_only', required: false, defaultValue: '2025', full: false },
      { id: 'no_of_authors', label: 'NO. OF AUTHORS', type: 'number', required: false, full: false },
      { id: 'author_position', label: 'AUTHOR POSITION', type: 'text', required: false, full: false },
      { id: 'indexed', label: 'INDEXED', type: 'select', options: ['SCI', 'Scopus', 'UGC Care', 'Web of Science', 'IEEE Xplore', 'ACM Digital Library', 'Not Indexed', 'Other'], full: false },
      { id: 'impact_factor', label: 'IMPACT FACTOR', type: 'text', required: false, full: false },
      { id: 'quartile', label: 'QUARTILE', type: 'select', options: ['Q1', 'Q2', 'Q3', 'Q4', 'NA'], full: false },
      { id: 'paper_link', label: 'PAPER LINK (DRIVE)', type: 'url', required: false, placeholder: 'https://...', full: false },
      { id: 'publisher_online_link', label: 'PUBLISHER ONLINE LINK', type: 'url', required: false, placeholder: 'https://doi.org/...', full: false }
    ]
  }
}

// ============ FILE UPLOAD COMPONENT WITH DRAG & DROP ============
function FileUpload({ onFileSelect, accept = '*', maxFiles = 5 }: {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).slice(0, maxFiles)
    setSelectedFiles(prev => [...prev, ...files])
    onFileSelect([...selectedFiles, ...files])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, maxFiles)
      setSelectedFiles(prev => [...prev, ...files])
      onFileSelect([...selectedFiles, ...files])
    }
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFileSelect(newFiles)
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
        <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-sm font-medium text-gray-700">
          {isDragging ? 'Drop files here...' : 'Drag & drop files here'}
        </p>
        <p className="text-xs text-gray-500 mt-1">or click to browse</p>
        <p className="text-xs text-gray-400 mt-2">Max {maxFiles} files • PDF, DOC, Images</p>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected Files:</p>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
              <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(index) }}
                className="p-1 hover:bg-red-100 rounded-full text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ STAFF ACHIEVEMENT PAGE ============
function StaffAchievementPage({ user }: { user: User }) {
  const [selectedCategory, setSelectedCategory] = useState<'achievement' | 'research_publication'>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submittedEntries, setSubmittedEntries] = useState<any[]>([])
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Get types based on selected category
  const getTypesForCategory = (category: string) => {
    return Object.entries(STAFF_ACHIEVEMENT_TYPES)
      .filter(([_, config]) => config.category === category)
      .map(([key, config]) => ({ key, ...config }))
  }

  // Initialize form when type changes
  useEffect(() => {
    if (selectedType && STAFF_ACHIEVEMENT_TYPES[selectedType]) {
      const initialData: Record<string, string> = {
        faculty_name: user.name || '',
        dept: user.departmentName || '',
        designation: user.role === 'STAFF' ? 'Assistant Professor' : '',
      }
      // Set default values for fields
      STAFF_ACHIEVEMENT_TYPES[selectedType].fields.forEach(field => {
        if (field.defaultValue && !initialData[field.id]) {
          initialData[field.id] = field.defaultValue
        }
      })
      setFormData(initialData)
      setAttachedFiles([])
    }
  }, [selectedType, user])

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleClearForm = () => {
    if (selectedType && STAFF_ACHIEVEMENT_TYPES[selectedType]) {
      const initialData: Record<string, string> = {
        faculty_name: user.name || '',
        dept: user.departmentName || '',
      }
      STAFF_ACHIEVEMENT_TYPES[selectedType].fields.forEach(field => {
        if (field.defaultValue && !initialData[field.id]) {
          initialData[field.id] = field.defaultValue
        }
      })
      setFormData(initialData)
    }
    setAttachedFiles([])
  }

  const handleSubmit = async () => {
    if (!selectedType) return
    setIsSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const typeConfig = STAFF_ACHIEVEMENT_TYPES[selectedType]
    const newEntry = {
      id: Date.now(),
      type: selectedType,
      typeName: typeConfig?.label || selectedType,
      category: typeConfig?.category,
      title: formData.pi_name || formData.paper_title || formData.project_title || formData.invention_title || formData.book_title || formData.chapter_title || formData.award_name || formData.event_title || formData.company_name || formData.course_name || 'Untitled',
      dept: user.departmentName,
      data: formData,
      files: attachedFiles.map(f => f.name),
      status: 'pending_staff',
      submittedAt: new Date().toISOString(),
      submittedBy: user.name
    }
    
    setSubmittedEntries(prev => [newEntry, ...prev])
    setShowSuccess(true)
    setIsSubmitting(false)
    
    setTimeout(() => {
      setShowSuccess(false)
      setSelectedType('')
      setFormData({})
      setAttachedFiles([])
    }, 2000)
  }

  // Month options for month_select type
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const renderFormField = (field: any) => {
    const value = formData[field.id] || ''
    
    switch (field.type) {
      case 'dept_select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm bg-white"
            required={field.required}
          >
            <option value="">Select</option>
            {DEPARTMENTS_LIST.map(dept => (
              <option key={dept.code} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        )
      case 'month_select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm bg-white"
            required={field.required}
          >
            <option value="">Select</option>
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )
      case 'year_only':
        return (
          <input
            type="text"
            value={value || (field.defaultValue || '')}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.defaultValue || '2025'}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm bg-white"
            required={field.required}
          />
        )
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm bg-white"
            required={field.required}
          >
            <option value="">Select</option>
            {field.options?.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || field.label}
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm resize-none bg-white"
            required={field.required}
          />
        )
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || field.label}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm bg-white"
            required={field.required}
          />
        )
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm bg-white"
            required={field.required}
          />
        )
      case 'url':
        return (
          <input
            type="url"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || 'https://...'}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm bg-white"
          />
        )
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm bg-white"
            required={field.required}
          />
        )
    }
  }

  const currentTypeConfig = selectedType ? STAFF_ACHIEVEMENT_TYPES[selectedType] : null

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Achievement Portal</h2>
          <p className="text-gray-500 mt-1">Submit your achievements and research publications</p>
        </div>
        <Badge variant="outline" className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border-blue-200">
          {user.departmentName} • {user.role}
        </Badge>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-pulse">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">Submission successful! Record saved.</span>
        </div>
      )}

      {/* Category Selection - Two Main Options (Dropdown Style) */}
      {!selectedCategory ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Achievement Card */}
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden border-0 shadow-lg"
            onClick={() => setSelectedCategory('achievement')}
          >
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
            <CardContent className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ACHIEVEMENT</h3>
              <p className="text-gray-500 text-sm mb-4">Industry Interaction, Awards, Events Organized, FDP/STTP & more</p>
              
              <div className="space-y-2">
                {['Industry Interaction', 'Award Record', 'Event Organized', 'FDP / STTP'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <ChevronRight className="w-4 h-4 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                Select Category
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Research & Publication Card */}
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden border-0 shadow-lg"
            onClick={() => setSelectedCategory('research_publication')}
          >
            <div className="h-2 bg-gradient-to-r from-slate-600 to-slate-800"></div>
            <CardContent className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">RESEARCH AND PUBLICATION</h3>
              <p className="text-gray-500 text-sm mb-4">Grants, Publications, Chapters, Books, Patents, Journals & more</p>
              
              <div className="space-y-2">
                {['Grant', 'Publication', 'Book Chapter', 'Book', 'Patent', 'Journal Paper'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-4 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900">
                Select Category
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Type Selection within Category */
        !selectedType ? (
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedCategory('')}
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
            
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedCategory === 'achievement' ? '🏆 Achievement Forms' : '📚 Research & Publication Forms'}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTypesForCategory(selectedCategory).map(({ key, label, icon: Icon, color }) => (
                <Card
                  key={key}
                  onClick={() => setSelectedType(key)}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 group border border-gray-200 hover:border-blue-300"
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-medium text-gray-800">{label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Form View - Matching Screenshot Design Exactly */
          <div className="space-y-6">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedType('')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Types
            </Button>

            {/* Form Card - Screenshot Style */}
            <Card className="overflow-hidden border border-gray-200 shadow-sm">
              {/* Form Header - Like screenshots show "Add Grant", "Add Publication", etc. */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  {currentTypeConfig && (
                    <>
                      <currentTypeConfig.headerIcon className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {currentTypeConfig.headerTitle || `Add ${currentTypeConfig.label}`}
                      </h3>
                    </>
                  )}
                </div>
              </div>
              
              <CardContent className="p-6 space-y-5">
                {/* Dynamic Fields Grid - 3 columns like screenshots */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {currentTypeConfig?.fields.map(field => (
                    <div key={field.id} className={`${field.full ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {renderFormField(field)}
                    </div>
                  ))}
                </div>

                {/* File Upload Section - Drag and Drop */}
                <div className="pt-4 border-t border-gray-200">
                  <FileUpload 
                    onFileSelect={setAttachedFiles}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    maxFiles={5}
                  />
                </div>

                {/* Action Buttons - Save & Clear like screenshots */}
                <div className="flex items-center gap-3 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white font-medium rounded-lg shadow-md flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearForm}
                    className="px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Submitted Entries List */}
            {submittedEntries.length > 0 && (
              <Card className="mt-6 border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    Your Submissions ({submittedEntries.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {submittedEntries.slice(0, 10).map(entry => {
                      const EntryIcon = STAFF_ACHIEVEMENT_TYPES[entry.type]?.icon || FileText
                      return (
                        <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${STAFF_ACHIEVEMENT_TYPES[entry.type]?.color || 'bg-gray-400'} flex items-center justify-center shadow-sm`}>
                              <EntryIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-800">{entry.typeName}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{entry.title.substring(0, 50)}...</p>
                              <p className="text-xs text-gray-400 mt-0.5">{new Date(entry.submittedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge className={
                            entry.status === 'pending_staff' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            entry.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }>
                            {entry.status === 'pending_staff' ? 'Pending' : entry.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{getTypesForCategory('achievement').length}</p>
              <p className="text-sm text-gray-500">Achievement Types</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-slate-600">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-slate-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{getTypesForCategory('research_publication').length}</p>
              <p className="text-sm text-gray-500">Publication Types</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{submittedEntries.length}</p>
              <p className="text-sm text-gray-500">Your Submissions</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ============ STUDENT ACHIEVEMENT VIEW PAGE (For Staff - Approve & Send to HOD) ============
function StudentAchievementViewPage({ user }: { user: User }) {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [studentAchievements, setStudentAchievements] = useState<any[]>([
    // Demo data - student submissions pending approval
    {
      id: 1,
      studentName: 'Bhavani S',
      regNo: 'CSE001',
      department: 'CSE',
      type: 'journal',
      typeName: 'Journal Publication',
      title: 'Research on Machine Learning Algorithms',
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'pending_staff',
      data: { name: 'Bhavani S', dept: 'CSE', reg: 'CSE001', year: 'III' }
    },
    {
      id: 2,
      studentName: 'Arun Kumar',
      regNo: 'CSE002',
      department: 'CSE',
      type: 'hackathon',
      typeName: 'Hackathon Participation',
      title: 'Smart India Hackathon 2024',
      submittedAt: '2024-01-14T09:15:00Z',
      status: 'pending_staff',
      data: { name: 'Arun Kumar', dept: 'CSE', reg: 'CSE002', year: 'IV' }
    },
    {
      id: 3,
      studentName: 'Priya Devi',
      regNo: 'ECE001',
      department: 'ECE',
      type: 'internship',
      typeName: 'Internship Completion',
      title: 'Internship at TCS',
      submittedAt: '2024-01-13T14:20:00Z',
      status: 'staff_approved',
      data: { name: 'Priya Devi', dept: 'ECE', reg: 'ECE001', year: 'III' }
    },
    {
      id: 4,
      studentName: 'Rahul R',
      regNo: 'CSE003',
      department: 'CSE',
      type: 'award',
      typeName: 'Award Received',
      title: 'Best Project Award at Symposium',
      submittedAt: '2024-01-12T11:45:00Z',
      status: 'hod_approved',
      data: { name: 'Rahul R', dept: 'CSE', reg: 'CSE003', year: 'II' }
    }
  ])
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [processingAction, setProcessingAction] = useState<string | null>(null)

  const filteredAchievements = studentAchievements.filter(a => {
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus
    const matchesType = filterType === 'all' || a.type === filterType
    const matchesSearch = searchTerm === '' || 
      a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.regNo.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesType && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_staff': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'staff_approved': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending_hod': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'hod_approved': return 'bg-green-100 text-green-700 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_staff': return '⏳ Pending Your Review'
      case 'staff_approved': return '✓ Approved by You'
      case 'pending_hod': return '📤 Sent to HOD'
      case 'hod_approved': return '✅ HOD Approved'
      case 'rejected': return '❌ Rejected'
      default: return status
    }
  }

  const handleApprove = async (id: string) => {
    setProcessingAction(id)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setStudentAchievements(prev => prev.map(a => 
      a.id.toString() === id 
        ? { ...a, status: 'pending_hod', approvedBy: user.name, approvedAt: new Date().toISOString() }
        : a
    ))
    setProcessingAction(null)
    setSelectedEntry(null)
  }

  const handleReject = async (id: string) => {
    setProcessingAction(id)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setStudentAchievements(prev => prev.map(a => 
      a.id.toString() === id 
        ? { ...a, status: 'rejected', rejectedBy: user.name, rejectedAt: new Date().toISOString() }
        : a
    ))
    setProcessingAction(null)
    setSelectedEntry(null)
  }

  const stats = {
    total: studentAchievements.length,
    pending_staff: studentAchievements.filter(a => a.status === 'pending_staff').length,
    approved: studentAchievements.filter(a => a.status === 'staff_approved' || a.status === 'pending_hod').length,
    hod_approved: studentAchievements.filter(a => a.status === 'hod_approved').length
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Achievements Review</h2>
          <p className="text-gray-500 mt-1">Review and approve student submissions before sending to HOD</p>
        </div>
        <Badge variant="outline" className="px-4 py-2 text-sm bg-purple-50 text-purple-700 border-purple-200">
          {user.departmentName} • Staff Reviewer
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              <p className="text-xs text-blue-600">Total Submissions</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending_staff}</p>
              <p className="text-xs text-yellow-600">Pending Review</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
              <p className="text-xs text-green-600">Approved by You</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">{stats.hod_approved}</p>
              <p className="text-xs text-purple-600">HOD Finalized</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, reg no, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending_staff">Pending Your Review</option>
            <option value="staff_approved">Approved by You</option>
            <option value="pending_hod">Sent to HOD</option>
            <option value="hod_approved">HOD Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Types</option>
            <option value="journal">Journal</option>
            <option value="conference">Conference</option>
            <option value="hackathon">Hackathon</option>
            <option value="internship">Internship</option>
            <option value="award">Award</option>
            <option value="placement">Placement</option>
          </select>
        </div>
      </Card>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredAchievements.length === 0 ? (
          <Card className="p-12 text-center">
            <Inbox className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No submissions found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
          </Card>
        ) : (
          filteredAchievements.map(entry => (
            <Card key={entry.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-1 ${
                entry.status === 'pending_staff' ? 'bg-yellow-500' :
                entry.status === 'staff_approved' ? 'bg-blue-500' :
                entry.status === 'pending_hod' ? 'bg-purple-500' :
                entry.status === 'hod_approved' ? 'bg-green-500' :
                'bg-red-500'
              }`}></div>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {entry.studentName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{entry.studentName}</h3>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{entry.regNo}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(entry.status)}`}>
                          {getStatusLabel(entry.status)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-1">{entry.title}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />{entry.typeName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />{entry.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{new Date(entry.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 lg:flex-shrink-0">
                    {entry.status === 'pending_staff' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setSelectedEntry(entry)}
                          variant="outline"
                          className="text-gray-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(entry.id.toString())}
                          disabled={processingAction === entry.id.toString()}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingAction === entry.id.toString() ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <><CheckCircle className="w-4 h-4 mr-1" />Approve</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(entry.id.toString())}
                          disabled={processingAction === entry.id.toString()}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-1" />Reject
                        </Button>
                      </>
                    )}
                    {entry.status !== 'pending_staff' && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedEntry(entry)}
                        variant="outline"
                        className="text-gray-700"
                      >
                        <Eye className="w-4 h-4 mr-1" />View Details
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEntry(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-gray-900">Submission Details</h3>
              <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Student Info */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {selectedEntry.studentName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{selectedEntry.studentName}</h4>
                  <p className="text-gray-600">{selectedEntry.regNo} • {selectedEntry.department}</p>
                  <span className={`inline-block mt-1 px-3 py-1 text-xs rounded-full border ${getStatusColor(selectedEntry.status)}`}>
                    {getStatusLabel(selectedEntry.status)}
                  </span>
                </div>
              </div>

              {/* Achievement Details */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  Achievement Information
                </h5>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium text-gray-900">{selectedEntry.typeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Title</span>
                    <span className="font-medium text-gray-900">{selectedEntry.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted On</span>
                    <span className="font-medium text-gray-900">{new Date(selectedEntry.submittedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Submitted Data */}
              {selectedEntry.data && (
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-green-500" />
                    Submitted Data
                  </h5>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    {Object.entries(selectedEntry.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-medium text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attached Files Placeholder */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-orange-500" />
                  Attached Documents
                </h5>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <FileText className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Supporting documents would be displayed here</p>
                </div>
              </div>

              {/* Action Buttons (only for pending) */}
              {selectedEntry.status === 'pending_staff' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedEntry(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedEntry.id.toString())}
                    disabled={processingAction === selectedEntry.id.toString()}
                    className="flex-1"
                  >
                    {processingAction === selectedEntry.id.toString() ? 'Processing...' : 'Reject Submission'}
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedEntry.id.toString())}
                    disabled={processingAction === selectedEntry.id.toString()}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processingAction === selectedEntry.id.toString() ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" />Approve & Send to HOD</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ MY ACHIEVEMENT PAGE (For HOD) ============
function MyAchievementPage({ user }: { user: User }) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [achievements, setAchievements] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (selectedType) {
      const typeConfig = ACHIEVEMENT_TYPES[selectedType]
      if (typeConfig) {
        const initialData: Record<string, string> = { name: user.name || '', dept: user.departmentName || '' }
        typeConfig.fields.forEach(field => {
          if (!initialData[field.id]) {
            initialData[field.id] = ''
          }
        })
        setFormData(initialData)
      }
    }
  }, [selectedType, user.name, user.departmentName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newAchievement = {
      id: Date.now(),
      ...formData,
      type: selectedType,
      typeName: ACHIEVEMENT_TYPES[selectedType]?.label,
      submittedBy: user.name,
      role: user.role,
      department: user.departmentName,
      status: 'hod_approved',
      createdAt: new Date().toISOString()
    }
    
    setAchievements(prev => [newAchievement, ...prev])
    setShowSuccess(true)
    setIsSubmitting(false)
    setSelectedType('')
    setFormData({})
    
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Achievements</h2>
          <p className="text-gray-500 mt-1">Submit and track your achievements as HOD</p>
        </div>
        <Badge variant="outline" className="px-4 py-2 text-sm bg-emerald-50 text-emerald-700 border-emerald-200">
          {user.departmentName} • Head of Department
        </Badge>
      </div>

      {showSuccess && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 animate-slide-up">
          <p className="text-green-700 font-medium flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Achievement submitted successfully!
          </p>
        </div>
      )}

      {!selectedType ? (
        <>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-500" /> Submit New Achievement
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(ACHIEVEMENT_TYPES).map(([key, config]) => {
                  const Icon = config.icon
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedType(key)}
                      className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{config.label}</span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {achievements.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Your Submissions ({achievements.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3 max-h-96 overflow-y-auto">
                {achievements.map(ach => (
                  <div key={ach.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">{ach.title || ach.typeName}</p>
                        <p className="text-xs text-gray-500">{ach.typeName} • {new Date(ach.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="overflow-hidden">
            <div className={`h-1.5 bg-gradient-to-r ${ACHIEVEMENT_TYPES[selectedType]?.color}`} />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{ACHIEVEMENT_TYPES[selectedType]?.label}</CardTitle>
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedType('')}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ACHIEVEMENT_TYPES[selectedType]?.fields.map(field => (
                <div key={field.id} className={`${field.full ? 'col-span-full' : ''}`}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.id] || ''}
                      onChange={(e) => setFormData(prev => ({...prev, [field.id]: e.target.value}))}
                      required={field.required}
                      disabled={field.locked}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Select...</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.id] || ''}
                      onChange={(e) => setFormData(prev => ({...prev, [field.id]: e.target.value}))}
                      required={field.required}
                      rows={4}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  ) : (
                    <input
                      type={field.type === 'url' ? 'url' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                      value={formData[field.id] || ''}
                      onChange={(e) => setFormData(prev => ({...prev, [field.id]: e.target.value}))}
                      required={field.required}
                      readOnly={field.locked}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  )}
                </div>
              ))}
              
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">Drag & Drop files here or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">PDF, Images, Documents (Max 10MB)</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedType('')} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : <><Save className="w-4 h-4 mr-2" />Submit Achievement</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}

// ============ HOD STUDENT APPROVAL PAGE ============
function HODStudentApprovalPage({ user }: { user: User }) {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [studentAchievements, setStudentAchievements] = useState<any[]>([
    {
      id: 1,
      studentName: 'Bhavani S',
      regNo: 'CSE001',
      department: 'CSE',
      type: 'journal',
      typeName: 'Journal Publication',
      title: 'Research on Machine Learning Algorithms',
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'pending_hod',
      data: { name: 'Bhavani S', dept: 'CSE', reg: 'CSE001', year: 'III', title: 'Research on ML Algorithms', journal: 'IEEE Transactions' },
      staffApprovedBy: 'Dr. Kumar'
    },
    {
      id: 2,
      studentName: 'Arun Kumar',
      regNo: 'CSE002',
      department: 'CSE',
      type: 'hackathon',
      typeName: 'Hackathon Participation',
      title: 'Smart India Hackathon 2024',
      submittedAt: '2024-01-14T09:15:00Z',
      status: 'pending_hod',
      data: { name: 'Arun Kumar', dept: 'CSE', reg: 'CSE002', year: 'IV', title: 'Smart India Hackathon' },
      staffApprovedBy: 'Prof. Ramesh'
    },
    {
      id: 3,
      studentName: 'Priya Devi',
      regNo: 'ECE001',
      department: 'ECE',
      type: 'internship',
      typeName: 'Internship Completion',
      title: 'Internship at TCS',
      submittedAt: '2024-01-13T14:20:00Z',
      status: 'hod_approved',
      data: { name: 'Priya Devi', dept: 'ECE', reg: 'ECE001', year: 'III' },
      approvedAt: '2024-01-16T11:00:00Z'
    },
    {
      id: 4,
      studentName: 'Rahul R',
      regNo: 'CSE003',
      department: 'CSE',
      type: 'award',
      typeName: 'Award Received',
      title: 'Best Project Award at Symposium',
      submittedAt: '2024-01-12T11:45:00Z',
      status: 'rejected',
      rejectionReason: 'Documentation incomplete - missing certificate proof',
      rejectedAt: '2024-01-15T14:30:00Z',
      data: { name: 'Rahul R', dept: 'CSE', reg: 'CSE003', year: 'II' }
    },
    {
      id: 5,
      studentName: 'Sneha M',
      regNo: 'AI001',
      department: 'AI&DS',
      type: 'nptel',
      typeName: 'NPTEL Certification',
      title: 'NPTEL Data Structures Course',
      submittedAt: '2024-01-16T08:00:00Z',
      status: 'pending_hod',
      data: { name: 'Sneha M', dept: 'AI&DS', reg: 'AI001', year: 'III', course: 'Data Structures', score: '85%' },
      staffApprovedBy: 'Dr. Sharma'
    }
  ])
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [processingAction, setProcessingAction] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const filteredAchievements = studentAchievements.filter(a => {
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus
    const matchesType = filterType === 'all' || a.type === filterType
    const matchesSearch = searchTerm === '' || 
      a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.regNo.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesType && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_staff': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'staff_approved': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending_hod': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'hod_approved': return 'bg-green-100 text-green-700 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_staff': return '⏳ Pending Staff Review'
      case 'staff_approved': return '✓ Staff Approved'
      case 'pending_hod': return '📋 Pending Your Approval'
      case 'hod_approved': return '✅ Approved by You'
      case 'rejected': return '❌ Rejected'
      default: return status
    }
  }

  const handleApprove = async (id: string) => {
    setProcessingAction(id)
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    setStudentAchievements(prev => prev.map(a => 
      a.id.toString() === id 
        ? { ...a, status: 'hod_approved', hodApprovedBy: user.name, approvedAt: new Date().toISOString() }
        : a
    ))
    setProcessingAction(null)
    setSelectedEntry(null)
  }

  const handleRejectWithReason = async () => {
    if (!rejectingId || !rejectReason.trim()) return
    
    setProcessingAction(rejectingId)
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    setStudentAchievements(prev => prev.map(a => 
      a.id.toString() === rejectingId 
        ? { ...a, status: 'rejected', rejectionReason: rejectReason, rejectedBy: user.name, rejectedAt: new Date().toISOString() }
        : a
    ))
    setProcessingAction(null)
    setShowRejectModal(false)
    setRejectReason('')
    setRejectingId(null)
    setSelectedEntry(null)
  }

  const openRejectModal = (id: string) => {
    setRejectingId(id)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const stats = {
    total: studentAchievements.length,
    pending_hod: studentAchievements.filter(a => a.status === 'pending_hod').length,
    approved: studentAchievements.filter(a => a.status === 'hod_approved').length,
    rejected: studentAchievements.filter(a => a.status === 'rejected').length
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Achievement Approval</h2>
          <p className="text-gray-500 mt-1">Review and approve student achievements sent by staff members</p>
        </div>
        <Badge variant="outline" className="px-4 py-2 text-sm bg-purple-50 text-purple-700 border-purple-200">
          {user.departmentName} • HOD Reviewer
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-600">Total Submissions</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">{stats.pending_hod}</p>
              <p className="text-xs text-purple-600">Pending Your Approval</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
              <p className="text-xs text-green-600">Approved by You</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
              <p className="text-xs text-red-600">Rejected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, reg no, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending_hod">Pending Your Approval</option>
            <option value="hod_approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">All Types</option>
            <option value="journal">Journal</option>
            <option value="conference">Conference</option>
            <option value="hackathon">Hackathon</option>
            <option value="internship">Internship</option>
            <option value="nptel">NPTEL/MOOC</option>
            <option value="award">Award</option>
          </select>
        </div>
      </Card>

      {/* Submissions List - High Contrast Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Student</div>
            <div className="col-span-3">Achievement</div>
            <div className="col-span-2">Type / Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        {filteredAchievements.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No submissions found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAchievements.map(entry => (
              <div 
                key={entry.id} 
                className={`px-6 py-4 transition-colors duration-150 hover:bg-[#F8FAFC] group ${
                  entry.status === 'pending_hod' ? 'bg-white' : ''
                }`}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Student Info */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                      {entry.studentName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{entry.studentName}</p>
                      <p className="text-xs text-gray-500">{entry.regNo}</p>
                    </div>
                  </div>

                  {/* Achievement */}
                  <div className="col-span-3 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{entry.title}</p>
                    {entry.staffApprovedBy && (
                      <p className="text-xs text-indigo-600 mt-0.5">
                        <UserCheck className="w-3 h-3 inline mr-1" />
                        {entry.staffApprovedBy}
                      </p>
                    )}
                  </div>

                  {/* Type & Date */}
                  <div className="col-span-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
                      <Tag className="w-3 h-3" />{entry.typeName}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(entry.submittedAt).toLocaleDateString()}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>
                      {getStatusLabel(entry.status)}
                    </span>
                    {entry.status === 'rejected' && entry.rejectionReason && (
                      <p className="text-xs text-red-500 mt-1 truncate" title={entry.rejectionReason}>
                        {entry.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {entry.status === 'pending_hod' ? (
                      <>
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(entry.id.toString())}
                          disabled={processingAction === entry.id.toString()}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                          {processingAction === entry.id.toString() ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openRejectModal(entry.id.toString())}
                          disabled={processingAction === entry.id.toString()}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEntry(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-gray-900">Submission Details</h3>
              <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Student Info */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                  {selectedEntry.studentName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{selectedEntry.studentName}</h4>
                  <p className="text-gray-600">{selectedEntry.regNo} • {selectedEntry.department}</p>
                  <span className={`inline-block mt-1 px-3 py-1 text-xs rounded-full border ${getStatusColor(selectedEntry.status)}`}>
                    {getStatusLabel(selectedEntry.status)}
                  </span>
                </div>
              </div>

              {/* Achievement Details */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  Achievement Information
                </h5>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium text-gray-900">{selectedEntry.typeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Title</span>
                    <span className="font-medium text-gray-900">{selectedEntry.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted On</span>
                    <span className="font-medium text-gray-900">{new Date(selectedEntry.submittedAt).toLocaleString()}</span>
                  </div>
                  {selectedEntry.staffApprovedBy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Staff Approved By</span>
                      <span className="font-medium text-blue-600">{selectedEntry.staffApprovedBy}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submitted Data */}
              {selectedEntry.data && (
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-green-500" />
                    Submitted Data
                  </h5>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    {Object.entries(selectedEntry.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-medium text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedEntry.status === 'pending_hod' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedEntry(null)} className="flex-1">Cancel</Button>
                  <Button variant="destructive" onClick={() => {setSelectedEntry(null); openRejectModal(selectedEntry.id.toString())}} className="flex-1">
                    <XCircle className="w-4 h-4 mr-2" />Reject with Reason
                  </Button>
                  <Button onClick={() => handleApprove(selectedEntry.id.toString())} disabled={processingAction === selectedEntry.id.toString()} className="flex-1 bg-green-600 hover:bg-green-700">
                    {processingAction === selectedEntry.id.toString() ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                    ) : (
                      <><CheckCircle className="w-4 h-4 mr-2" />Approve</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Reason - Clean White on Dark Backdrop */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark Backdrop with Blur */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={() => setShowRejectModal(false)}
          />
          
          {/* Clean White Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-5 border-b border-red-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-red-200">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Reject Submission</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Please provide constructive feedback for rejection</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  placeholder="Explain why this submission is being rejected. This feedback will be visible to the submitter..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none text-sm text-gray-800 placeholder:text-gray-400 transition-all"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1.5">Be specific and helpful to help improve future submissions</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRejectWithReason} 
                  disabled={!rejectReason.trim() || processingAction === rejectingId}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-sm shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingAction === rejectingId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Confirm Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ HOD STAFF APPROVAL PAGE ============
function HODStaffApprovalPage({ user }: { user: User }) {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [staffAchievements, setStaffAchievements] = useState<any[]>([
    {
      id: 1,
      staffName: 'Dr. Ramesh Kumar',
      department: 'CSE',
      category: 'research',
      typeName: 'Research Publication',
      title: 'Deep Learning Approaches for Image Classification - SCI Journal',
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'pending_hod',
      data: { journal: 'IEEE Transactions on Neural Networks', issn: '2162-237X', indexed: 'SCI', coAuthors: 'Dr. Sharma, Prof. Singh' },
      staffNote: 'Published in Q1 journal'
    },
    {
      id: 2,
      staffName: 'Prof. Lakshmi Priya',
      department: 'CSE',
      category: 'achievement',
      typeName: 'Workshop Conducted',
      title: 'One Week FDP on Cloud Computing Technologies',
      submittedAt: '2024-01-14T09:15:00Z',
      status: 'pending_hod',
      data: { participants: '45', venue: 'Seminar Hall A', dates: 'Jan 8-13, 2024', sponsor: 'AICTE' },
      staffNote: 'Successfully completed with good feedback'
    },
    {
      id: 3,
      staffName: 'Dr. Venkat Raman',
      department: 'ECE',
      category: 'research',
      typeName: 'Conference Paper',
      title: 'IoT-Based Smart Agriculture System - IEEE International Conference',
      submittedAt: '2024-01-13T14:20:00Z',
      status: 'hod_approved',
      data: { conference: 'IEEE ICIT 2024', location: 'Kerala', indexed: 'IEEE Xplore' },
      approvedAt: '2024-01-16T10:00:00Z'
    },
    {
      id: 4,
      staffName: 'Ms. Divya S',
      department: 'AI&DS',
      category: 'achievement',
      typeName: 'Certification Completed',
      title: 'AWS Solutions Architect Professional Certification',
      submittedAt: '2024-01-12T11:45:00Z',
      status: 'rejected',
      rejectionReason: 'Please provide valid certificate copy and payment receipt',
      rejectedAt: '2024-01-15T16:00:00Z',
      data: { provider: 'Amazon Web Services', validity: '3 Years' }
    },
    {
      id: 5,
      staffName: 'Prof. Arun Prakash',
      department: 'MECH',
      category: 'research',
      typeName: 'Patent Filed',
      title: 'Novel Design for Heat Exchanger in Automobile Applications',
      submittedAt: '2024-01-16T08:00:00Z',
      status: 'pending_hod',
      data: { patentNo: '2024410XXXXXX', inventors: 'Prof. Arun Prakash, Dr. Krishnan', status_pub: 'Filed' },
      staffNote: 'Innovation under industry collaboration'
    }
  ])
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [processingAction, setProcessingAction] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const filteredAchievements = staffAchievements.filter(a => {
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      a.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_hod': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'hod_approved': return 'bg-green-100 text-green-700 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_hod': return '📋 Pending Your Approval'
      case 'hod_approved': return '✅ Approved by You'
      case 'rejected': return '❌ Rejected'
      default: return status
    }
  }

  const handleApprove = async (id: string) => {
    setProcessingAction(id)
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    setStaffAchievements(prev => prev.map(a => 
      a.id.toString() === id 
        ? { ...a, status: 'hod_approved', hodApprovedBy: user.name, approvedAt: new Date().toISOString() }
        : a
    ))
    setProcessingAction(null)
    setSelectedEntry(null)
  }

  const handleRejectWithReason = async () => {
    if (!rejectingId || !rejectReason.trim()) return
    
    setProcessingAction(rejectingId)
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    setStaffAchievements(prev => prev.map(a => 
      a.id.toString() === rejectingId 
        ? { ...a, status: 'rejected', rejectionReason: rejectReason, rejectedBy: user.name, rejectedAt: new Date().toISOString() }
        : a
    ))
    setProcessingAction(null)
    setShowRejectModal(false)
    setRejectReason('')
    setRejectingId(null)
    setSelectedEntry(null)
  }

  const openRejectModal = (id: string) => {
    setRejectingId(id)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const stats = {
    total: staffAchievements.length,
    pending_hod: staffAchievements.filter(a => a.status === 'pending_hod').length,
    approved: staffAchievements.filter(a => a.status === 'hod_approved').length,
    rejected: staffAchievements.filter(a => a.status === 'rejected').length
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Achievement Approval</h2>
          <p className="text-gray-500 mt-1">Review and approve staff research and achievement submissions</p>
        </div>
        <Badge variant="outline" className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 border-indigo-200">
          {user.departmentName} • HOD Reviewer
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-600">Total Submissions</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">{stats.pending_hod}</p>
              <p className="text-xs text-purple-600">Pending Your Approval</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
              <p className="text-xs text-green-600">Approved by You</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
              <p className="text-xs text-red-600">Rejected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by staff name or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending_hod">Pending Your Approval</option>
            <option value="hod_approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Submissions List - High Contrast Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Staff Member</div>
            <div className="col-span-3">Submission</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        {filteredAchievements.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No submissions found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAchievements.map(entry => (
              <div 
                key={entry.id} 
                className={`px-6 py-4 transition-colors duration-150 hover:bg-[#F8FAFC] group ${
                  entry.status === 'pending_hod' ? 'bg-white' : ''
                }`}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Staff Info */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                      {entry.staffName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{entry.staffName}</p>
                      <p className="text-xs text-gray-500">{entry.department}</p>
                    </div>
                  </div>

                  {/* Submission */}
                  <div className="col-span-3 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{entry.title}</p>
                    {entry.staffNote && (
                      <p className="text-xs text-orange-600 mt-0.5 truncate" title={entry.staffNote}>
                        📝 {entry.staffNote}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                      entry.category === 'research' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {entry.category === 'research' ? '📄' : '🏆'}
                      {entry.typeName}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(entry.submittedAt).toLocaleDateString()}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>
                      {getStatusLabel(entry.status)}
                    </span>
                    {entry.status === 'rejected' && entry.rejectionReason && (
                      <p className="text-xs text-red-500 mt-1 truncate" title={entry.rejectionReason}>
                        {entry.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {entry.status === 'pending_hod' ? (
                      <>
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(entry.id.toString())}
                          disabled={processingAction === entry.id.toString()}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                          {processingAction === entry.id.toString() ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openRejectModal(entry.id.toString())}
                          disabled={processingAction === entry.id.toString()}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEntry(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-gray-900">Staff Submission Details</h3>
              <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Staff Info */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {selectedEntry.staffName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{selectedEntry.staffName}</h4>
                  <p className="text-gray-600">{selectedEntry.department} Department</p>
                  <span className={`inline-block mt-1 px-3 py-1 text-xs rounded-full border ${getStatusColor(selectedEntry.status)}`}>
                    {getStatusLabel(selectedEntry.status)}
                  </span>
                </div>
              </div>

              {/* Achievement Details */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-500" />
                  Submission Information
                </h5>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium text-gray-900">{selectedEntry.typeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Title</span>
                    <span className="font-medium text-gray-900">{selectedEntry.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted On</span>
                    <span className="font-medium text-gray-900">{new Date(selectedEntry.submittedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Additional Data */}
              {selectedEntry.data && (
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-green-500" />
                    Details
                  </h5>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    {Object.entries(selectedEntry.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-medium text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Staff Note */}
              {selectedEntry.staffNote && (
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orange-500" />
                    Staff Note
                  </h5>
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <p className="text-sm text-gray-700 italic">{selectedEntry.staffNote}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedEntry.status === 'pending_hod' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedEntry(null)} className="flex-1">Cancel</Button>
                  <Button variant="destructive" onClick={() => {setSelectedEntry(null); openRejectModal(selectedEntry.id.toString())}} className="flex-1">
                    <XCircle className="w-4 h-4 mr-2" />Reject with Reason
                  </Button>
                  <Button onClick={() => handleApprove(selectedEntry.id.toString())} disabled={processingAction === selectedEntry.id.toString()} className="flex-1 bg-green-600 hover:bg-green-700">
                    {processingAction === selectedEntry.id.toString() ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                    ) : (
                      <><CheckCircle className="w-4 h-4 mr-2" />Approve</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Reason - Clean White on Dark Backdrop */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark Backdrop with Blur */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={() => setShowRejectModal(false)}
          />
          
          {/* Clean White Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-5 border-b border-red-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-red-200">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Reject Staff Submission</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Please provide constructive feedback for rejection</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  placeholder="Explain why this submission is being rejected. This feedback will be visible to the staff member..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none text-sm text-gray-800 placeholder:text-gray-400 transition-all"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1.5">Be specific and helpful to help improve future submissions</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRejectWithReason} 
                  disabled={!rejectReason.trim() || processingAction === rejectingId}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-sm shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingAction === rejectingId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Confirm Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
      case 'staff_achievement': return <StaffAchievementPage user={user} />
      case 'student_achievement_view': return <StudentAchievementViewPage user={user} />
      case 'my_achievement': return <MyAchievementPage user={user} />
      case 'hod_student_approval': return <HODStudentApprovalPage user={user} />
      case 'hod_staff_approval': return <HODStaffApprovalPage user={user} />
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
