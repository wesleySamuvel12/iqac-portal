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
  Save, Sparkles, PanelLeft, PanelLeftClose,
  GripVertical
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
      { id: 'indexed', label: 'Indexed In', type: 'select_with_other', options: ['SCI','Scopus','UGC Care','Web of Science'] },
      { id: 'issn', label: 'ISSN', type: 'text' },
      { id: 'publisher', label: 'Publisher', type: 'text' },
      { id: 'month', label: 'Month', type: 'select', options: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
      { id: 'year_pub', label: 'Year', type: 'number' },
      { id: 'status_pub', label: 'Status', type: 'constant', value: 'Published' },
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
      { id: 'indexed', label: 'Indexed In', type: 'select_with_other', options: ['Scopus','SCI','Web of Science','UGC Care'] },
      { id: 'publisher', label: 'Publisher', type: 'publisher_select', options: ['IEEE','Springer','Elsevier','Other'] },
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
      { id: 'platform', label: 'Platform', type: 'select_with_other', options: ['NPTEL','Swayam','Coursera','edX','FutureLearn','Udemy'] },
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
      { id: 'type_sem', label: 'Type', type: 'select_with_other', options: ['Seminar','Webinar','Workshop','Conference','FDP'] },
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
      { id: 'activity_type', label: 'Activity Type', type: 'select_with_other', options: ['Sports','Cultural','Club Activity','Social Service','Leadership','Student Council'] },
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
      { id: 'category', label: 'Category', type: 'select_with_other', options: ['Hackathon','Ideathon','SIH','Innovation Challenge'] },
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

// ============ LOGIN PAGE - PREMIUM IMPRESSIVE DESIGN ============
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'STAFF' | 'HOD' | 'ADMIN'>('STUDENT')
  const [selectedDept, setSelectedDept] = useState('CSE')
  const [showDeptDropdown, setShowDeptDropdown] = useState(false)
  const [isFocused, setIsFocused] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const login = useAuthStore((state) => state.login)

  // Track mouse position for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

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

  // Premium Role Configuration
  const roleTabs = [
    { id: 'STUDENT' as const, label: 'Student', icon: GraduationCap, color: 'emerald', gradient: 'from-emerald-400 via-teal-500 to-cyan-500', glowColor: 'rgba(16, 185, 129, 0.4)', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-300', shadowColor: 'shadow-emerald-200' },
    { id: 'STAFF' as const, label: 'Staff / Faculty', icon: BookOpen, color: 'blue', gradient: 'from-blue-400 via-indigo-500 to-violet-500', glowColor: 'rgba(59, 130, 246, 0.4)', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-300', shadowColor: 'shadow-blue-200' },
    { id: 'HOD' as const, label: 'HOD', icon: UserCheck, color: 'purple', gradient: 'from-purple-400 via-fuchsia-500 to-pink-500', glowColor: 'rgba(168, 85, 247, 0.4)', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-300', shadowColor: 'shadow-purple-200' },
    { id: 'ADMIN' as const, label: 'IQAC Admin', icon: Shield, color: 'amber', gradient: 'from-amber-400 via-orange-500 to-red-500', glowColor: 'rgba(245, 158, 11, 0.4)', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-300', shadowColor: 'shadow-amber-200' },
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

  // Generate particles for ambient effect
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 15 + Math.random() * 20,
    opacity: 0.1 + Math.random() * 0.4
  }))

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex flex-col">
      {/* ====== PREMIUM AMBIENT BACKGROUND ====== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Multi-layer Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_50%,rgba(99,102,241,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_100%,rgba(6,182,212,0.1),transparent)]" />
        
        {/* Animated Floating Orbs - Premium Version */}
        <div className="premium-orb orb-1" />
        <div className="premium-orb orb-2" />
        <div className="premium-orb orb-3" />
        <div className="premium-orb orb-4" />
        <div className="premium-orb orb-5" />
        
        {/* Aurora Borealis Effect */}
        <div className="aurora-layer aurora-1-premium" />
        <div className="aurora-layer aurora-2-premium" />

        {/* Animated Particle System */}
        <div className="particle-container-premium">
          {particles.map((p) => (
            <div
              key={p.id}
              className="floating-particle"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: `${p.x}%`,
                top: `${p.y}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>

        {/* Subtle Grid Pattern */}
        <div className="grid-pattern-premium" />

        {/* Floating Geometric Shapes */}
        <div className="geo-shape geo-shape-1" />
        <div className="geo-shape geo-shape-2" />
        <div className="geo-shape geo-shape-3" />
        <div className="geo-shape geo-shape-4" />
        
        {/* Radial Gradient Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-radial-depth" />
      </div>

      {/* ====== INSTITUTIONAL STATUS BAR ====== */}
      <header className="relative z-20 w-full">
        <div className="premium-status-bar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-11">
              <div className="flex items-center gap-3">
                {/* NAAC Badge with Pulse */}
                <div className="premium-badge naac-badge">
                  <span className="badge-pulse-ring" />
                  <span className="badge-dot" />
                  <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="badge-text">NAAC Accredited</span>
                </div>
                
                {/* NIRF Badge */}
                <div className="premium-badge nirf-badge hidden sm:flex">
                  <Award className="w-3.5 h-3.5 text-blue-500" />
                  <span className="badge-text-blue">NIRF Ranked</span>
                </div>

                {/* AICTE Badge */}
                <div className="premium-badge aicte-badge hidden md:flex">
                  <Building2 className="w-3.5 h-3.5 text-violet-500" />
                  <span className="badge-text-violet">AICTE Approved</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <a href="#" className="support-link">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  IT Support
                </a>
                <div className="version-badge">
                  v3.0 Enterprise
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ====== MAIN CONTENT AREA ====== */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[520px]">
          
          {/* ====== PREMIUM LOGO & HEADER ====== */}
          <div className="text-center mb-10 premium-header-animate">
            {/* 3D Floating Logo Container */}
            <div className="logo-container-premium">
              {/* Outer Glow Rings */}
              <div className="logo-glow-outer" />
              <div className="logo-glow-middle" />
              
              {/* Rotating Gradient Border */}
              <div className="logo-border-rotating" />
              
              {/* Main Logo Card */}
              <div className="logo-main-card">
                <div className="logo-inner-gradient">
                  <Building2 className="logo-icon" />
                </div>
                
                {/* Glass Reflection */}
                <div className="logo-reflection" />
              </div>
              
              {/* Verification Badge */}
              <div className="logo-verify-badge">
                <CheckCircle className="w-3 h-3" />
              </div>
              
              {/* Orbiting Dots */}
              <div className="orbit-dot orbit-dot-1" />
              <div className="orbit-dot orbit-dot-2" />
              <div className="orbit-dot orbit-dot-3" />
            </div>
            
            {/* Title with Gradient Text */}
            <h1 className="premium-title">
              <span className="title-text-gradient">IQAC Portal</span>
            </h1>
            
            {/* Subtitle with Typing Effect Style */}
            <p className="premium-subtitle">
              <span className="subtitle-icon-wrapper">
                <GraduationCap className="w-4 h-4" />
              </span>
              Nehru Institute of Engineering and Technology
            </p>

            {/* Tagline */}
            <div className="tagline-container">
              <div className="tagline-line" />
              <span className="tagline-text">Excellence in Quality Assurance</span>
              <div className="tagline-line" />
            </div>
          </div>

          {/* ====== PREMIUM GLASS CARD ====== */}
          <div className="premium-card-container" onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = ((e.clientX - rect.left) / rect.width) * 100
            const y = ((e.clientY - rect.top) / rect.height) * 100
            e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
            e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
          }}>
            
            {/* Animated Border Gradient */}
            <div className="card-animated-border" />
            
            {/* Spotlight Effect Following Mouse */}
            <div className="card-spotlight" />
            
            {/* Main Card Content */}
            <div className="premium-card-content">
              
              {/* ====== ROLE TABS SECTION ====== */}
              <div className="role-section">
                <div className="role-label">
                  <div className="role-label-icon">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  Select Your Role
                  <div className="role-label-line" />
                </div>
                
                <div className="role-tabs-grid">
                  {roleTabs.map((tab, index) => {
                    const Icon = tab.icon
                    const isActive = selectedRole === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedRole(tab.id)}
                        className={`role-tab-button ${isActive ? `role-tab-active-${tab.color}` : ''}`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Active State Glow */}
                        {isActive && (
                          <>
                            <div className="active-glow" style={{ background: tab.glowColor }} />
                            <div className="active-border-gradient" style={{ background: `linear-gradient(135deg, ${tab.glowColor}, transparent)` }} />
                          </>
                        )}
                        
                        {/* Icon Container */}
                        <div className={`role-icon-wrap ${isActive ? 'role-icon-active' : ''}`}>
                          {isActive ? (
                            <div className="icon-gradient-bg" style={{ background: `linear-gradient(135deg, ${tab.gradient})` }}>
                              <Icon className="role-icon-active-svg" />
                            </div>
                          ) : (
                            <Icon className="role-icon-inactive" />
                          )}
                        </div>
                        
                        {/* Label */}
                        <span className={`role-label-text ${isActive ? `role-label-active-${tab.color}` : ''}`}>
                          {tab.label.split(' ')[0]}
                        </span>
                        
                        {/* Bottom Indicator */}
                        {isActive && (
                          <div className="active-indicator-bar" style={{ background: `linear-gradient(90deg, ${tab.glowColor}, transparent)` }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Error Message with Slide Animation */}
              {error && (
                <div className="error-container-premium">
                  <div className="error-content">
                    <div className="error-icon-wrap">
                      <AlertCircle className="error-icon" />
                    </div>
                    <p className="error-text">{error}</p>
                  </div>
                  <button onClick={() => setError('')} className="error-close">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ====== FORM SECTION ====== */}
              <form onSubmit={handleSubmit} className="form-space-premium">
                
                {/* Email Input Field */}
                <div className="input-group-premium">
                  <label className={`input-label-premium ${isFocused === 'email' ? 'input-label-focused' : ''}`}>
                    <Mail className="input-label-icon" />
                    Email Address
                    <span className="input-required-mark">*</span>
                  </label>
                  <div className={`input-wrapper-premium ${isFocused === 'email' ? 'input-wrapper-focused' : ''}`}>
                    <div className="input-prefix">
                      <Mail className={`input-prefix-icon ${isFocused === 'email' ? 'prefix-icon-focused' : ''}`} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused('email')}
                      onBlur={() => setIsFocused(null)}
                      placeholder={getPlaceholderForRole()}
                      className="premium-input-field"
                      required
                    />
                    <div className="input-focus-line" />
                    {isFocused === 'email' && <div className="input-glow-effect" />}
                  </div>
                </div>

                {/* Password Input Field */}
                <div className="input-group-premium">
                  <label className={`input-label-premium ${isFocused === 'password' ? 'input-label-focused' : ''}`}>
                    <Lock className="input-label-icon" />
                    Password
                    <span className="input-required-mark">*</span>
                  </label>
                  <div className={`input-wrapper-premium ${isFocused === 'password' ? 'input-wrapper-focused' : ''}`}>
                    <div className="input-prefix">
                      <Lock className={`input-prefix-icon ${isFocused === 'password' ? 'prefix-icon-focused' : ''}`} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused('password')}
                      onBlur={() => setIsFocused(null)}
                      placeholder="Enter your password"
                      className="premium-input-field pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle-btn"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <div className="input-focus-line" />
                    {isFocused === 'password' && <div className="input-glow-effect" />}
                  </div>
                </div>

                {/* ====== SUBMIT BUTTON ====== */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="premium-submit-btn"
                >
                  {/* Button Background Layers */}
                  <div className="btn-bg-base" />
                  <div className="btn-bg-gradient" />
                  <div className="btn-shimmer" />
                  
                  {/* Loading Spinner or Content */}
                  <span className="btn-content">
                    {isLoading ? (
                      <>
                        <Loader2 className="btn-spinner" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span className="btn-text">Sign In to Portal</span>
                        <ArrowRight className="btn-arrow" />
                      </>
                    )}
                  </span>
                  
                  {/* Hover Glow */}
                  <div className="btn-hover-glow" />
                </button>
              </form>

              {/* ====== DIVIDER ====== */}
              <div className="divider-premium">
                <div className="divider-line" />
                <span className="divider-text">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Quick Access
                  <Sparkles className="w-3 h-3 ml-1" />
                </span>
                <div className="divider-line" />
              </div>

              {/* ====== QUICK ACCESS SECTION ====== */}
              <div className="quick-access-section">
                
                {/* Admin Quick Access */}
                {selectedRole !== 'ADMIN' && (
                  <button
                    onClick={() => quickLogin('admin@niet.ac.in', 'admin123')}
                    className="admin-quick-btn"
                  >
                    <div className="admin-btn-left">
                      <div className="admin-btn-icon-wrap">
                        <Shield className="admin-btn-icon" />
                      </div>
                      <div className="admin-btn-text">
                        <span className="admin-btn-title">System Administrator</span>
                        <span className="admin-btn-desc">Full access to all modules</span>
                      </div>
                    </div>
                    <ChevronRight className="admin-btn-arrow" />
                    <div className="admin-btn-glow" />
                  </button>
                )}

                {/* Department Selector */}
                {selectedRole !== 'ADMIN' && (
                  <div className="dept-selector-section">
                    <label className="dept-label">
                      <Building2 className="w-3 h-3 mr-1.5" />
                      Select Department
                    </label>
                    <div className="dept-dropdown-container">
                      <button
                        type="button"
                        onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                        className="dept-dropdown-trigger"
                      >
                        <div className="dept-selected">
                          <div className="dept-icon-box">
                            <Building2 className="w-4 h-4 text-indigo-500" />
                          </div>
                          <span>{currentDept?.code} - {currentDept?.name}</span>
                        </div>
                        <ChevronDown className={`dept-chevron ${showDeptDropdown ? 'chevron-open' : ''}`} />
                      </button>
                      
                      {showDeptDropdown && (
                        <div className="dept-dropdown-menu">
                          {DEPARTMENTS_LIST.map((dept) => (
                            <button
                              key={dept.code}
                              type="button"
                              onClick={() => {
                                setSelectedDept(dept.code)
                                setShowDeptDropdown(false)
                              }}
                              className={`dept-option ${selectedDept === dept.code ? 'dept-option-active' : ''}`}
                            >
                              <div className={`dept-option-dot ${`dot-${dept.color || 'gray'}`}`} />
                              <span className="dept-option-code">{dept.code}</span>
                              <span className="dept-option-name">{dept.name}</span>
                              {selectedDept === dept.code && <CheckCircle className="dept-option-check" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Role Quick Login Grid */}
                {selectedRole !== 'ADMIN' && (
                  <div className="quick-role-grid">
                    {[
                      { id: 'STUDENT', icon: GraduationCap, label: 'Student', color: 'emerald' },
                      { id: 'STAFF', icon: BookOpen, label: 'Staff', color: 'blue' },
                      { id: 'HOD', icon: UserCheck, label: 'HOD', color: 'purple' },
                    ].map((role) => {
                      const Icon = role.icon
                      const isActive = selectedRole === role.id
                      return (
                        <button
                          key={role.id}
                          onClick={() => quickLogin(getDeptEmail(selectedDept, role.id), getPassword(role.id))}
                          className={`quick-role-btn ${isActive ? `quick-role-active-${role.color}` : ''}`}
                        >
                          <Icon className={`quick-role-icon ${isActive ? `quick-role-icon-active-${role.color}` : ''}`} />
                          <span className={`quick-role-label ${isActive ? `quick-role-label-active-${role.color}` : ''}`}>
                            {role.label}
                          </span>
                          {isActive && <div className={`quick-role-indicator indicator-${role.color}`} />}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Department Pills */}
                {selectedRole !== 'ADMIN' && (
                  <div className="dept-pills-container">
                    {['CSE', 'ECE', 'EEE', 'MECH', 'AI&DS', 'IT', 'AIDS', 'CIVIL'].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setSelectedDept(code)}
                        className={`dept-pill ${selectedDept === code ? 'dept-pill-active' : ''}`}
                      >
                        {selectedDept === code && <span className="pill-glow" />}
                        <span className="pill-text">{code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Card Bottom Accent Line */}
            <div className="card-bottom-accent" />
          </div>

          {/* ====== FOOTER ====== */}
          <footer className="premium-footer">
            <div className="footer-content">
              <Lock className="footer-lock-icon" />
              <span className="footer-text">Secure Authentication • NIET IQAC Enterprise System</span>
              <div className="footer-dots">
                <span className="footer-dot" />
                <span className="footer-dot footer-dot-delay" />
                <span className="footer-dot footer-dot-delay-2" />
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* ====== PREMIUM CSS STYLES ====== */}
      <style jsx>{`
        /* ========== FLOATING ORBS ========== */
        .premium-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          will-change: transform;
        }
        .orb-1 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #818cf8, #6366f1);
          top: -200px;
          right: -150px;
          animation: premiumFloat1 25s ease-in-out infinite;
        }
        .orb-2 {
          width: 450px;
          height: 450px;
          background: linear-gradient(135deg, #22d3ee, #06b6d4);
          bottom: -180px;
          left: -120px;
          animation: premiumFloat2 28s ease-in-out infinite reverse;
        }
        .orb-3 {
          width: 350px;
          height: 350px;
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
          top: 35%;
          left: 5%;
          animation: premiumFloat3 32s ease-in-out infinite;
        }
        .orb-4 {
          width: 280px;
          height: 280px;
          background: linear-gradient(135deg, #34d399, #10b981);
          top: 15%;
          right: 10%;
          animation: premiumFloat4 22s ease-in-out infinite;
        }
        .orb-5 {
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          bottom: 25%;
          right: 20%;
          animation: premiumFloat5 26s ease-in-out infinite;
        }

        @keyframes premiumFloat1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(-50px, 40px) rotate(120deg) scale(1.08); }
          66% { transform: translate(30px, -30px) rotate(240deg) scale(0.94); }
        }
        @keyframes premiumFloat2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(45px, -35px) rotate(-120deg) scale(1.1); }
          66% { transform: translate(-35px, 40px) rotate(-240deg) scale(0.92); }
        }
        @keyframes premiumFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, 45px) scale(1.12); }
        }
        @keyframes premiumFloat4 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-45px, -35px) scale(1.08); }
        }
        @keyframes premiumFloat5 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(35px, -25px) rotate(180deg); }
        }

        /* ========== AURORA EFFECT ========== */
        .aurora-layer {
          position: absolute;
          width: 150%;
          height: 150%;
          top: -25%;
          left: -25%;
          opacity: 0.12;
          mix-blend-mode: screen;
          filter: blur(100px);
        }
        .aurora-1-premium {
          background: conic-gradient(from 0deg at 50% 50%, transparent, #818cf8, transparent, #22d3ee, transparent, #a78bfa, transparent);
          animation: auroraRotate1 40s linear infinite;
        }
        .aurora-2-premium {
          background: conic-gradient(from 180deg at 50% 50%, transparent, #34d399, transparent, #fbbf24, transparent, #f472b6, transparent);
          animation: auroraRotate2 50s linear infinite reverse;
        }

        @keyframes auroraRotate1 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes auroraRotate2 {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        /* ========== PARTICLES ========== */
        .particle-container-premium {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .floating-particle {
          position: absolute;
          background: linear-gradient(135deg, #818cf8, #22d3ee);
          border-radius: 50%;
          animation: particleDrift linear infinite;
          pointer-events: none;
        }
        @keyframes particleDrift {
          0%, 100% { 
            transform: translateY(0) translateX(0) scale(1) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: var(--tw-opacity); }
          90% { opacity: var(--tw-opacity); }
          50% { transform: translateY(-100vh) translateX(50px) scale(1.5) rotate(180deg); }
          100% { 
            transform: translateY(-120vh) translateX(-30px) scale(0.5) rotate(360deg);
            opacity: 0;
          }
        }

        /* ========== GRID PATTERN ========== */
        .grid-pattern-premium {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: 
            linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent);
        }

        /* ========== GEOMETRIC SHAPES ========== */
        .geo-shape {
          position: absolute;
          border: 1px solid rgba(99,102,241,0.15);
          opacity: 0.6;
        }
        .geo-shape-1 {
          width: 80px;
          height: 80px;
          top: 15%;
          left: 8%;
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          animation: geoMorph1 20s ease-in-out infinite;
        }
        .geo-shape-2 {
          width: 60px;
          height: 60px;
          top: 25%;
          right: 12%;
          border-radius: 50%;
          animation: geoMorph2 18s ease-in-out infinite;
        }
        .geo-shape-3 {
          width: 100px;
          height: 100px;
          bottom: 20%;
          left: 15%;
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          animation: geoMorph3 25s ease-in-out infinite reverse;
        }
        .geo-shape-4 {
          width: 40px;
          height: 40px;
          bottom: 30%;
          right: 18%;
          transform: rotate(45deg);
          animation: geoMorph4 15s ease-in-out infinite;
        }

        @keyframes geoMorph1 {
          0%, 100% { transform: rotate(0deg) scale(1); border-color: rgba(129,140,248,0.15); }
          50% { transform: rotate(180deg) scale(1.1); border-color: rgba(34,211,238,0.2); }
        }
        @keyframes geoMorph2 {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(90deg); }
        }
        @keyframes geoMorph3 {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(-120deg) scale(1.15); }
        }
        @keyframes geoMorph4 {
          0%, 100% { transform: rotate(45deg) scale(1); opacity: 0.6; }
          50% { transform: rotate(225deg) scale(1.3); opacity: 0.3; }
        }

        /* ========== RADIAL GRADIENT DEPTH ========== */
        .bg-gradient-radial-depth {
          background: radial-gradient(ellipse at center, transparent 0%, rgba(248,250,252,0.4) 100%);
        }

        /* ========== STATUS BAR ========== */
        .premium-status-bar {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(226,232,240,0.6);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .premium-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .naac-badge {
          background: linear-gradient(135deg, rgba(209,250,229,0.8), rgba(167,243,208,0.6));
          border: 1px solid rgba(16,185,129,0.25);
          color: #047857;
        }
        .nirf-badge {
          background: linear-gradient(135deg, rgba(219,234,254,0.8), rgba(191,219,254,0.6));
          border: 1px solid rgba(59,130,246,0.25);
          color: #1d4ed8;
        }
        .aicte-badge {
          background: linear-gradient(135deg, rgba(233,213,255,0.8), rgba(216,180,254,0.6));
          border: 1px solid rgba(139,92,246,0.25);
          color: #7c3aed;
        }
        .badge-pulse-ring {
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: inherit;
          opacity: 0.4;
          animation: badgePulse 2s ease-out infinite;
        }
        @keyframes badgePulse {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          animation: badgeDotPulse 2s ease-in-out infinite;
        }
        @keyframes badgeDotPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .badge-text, .badge-text-blue, .badge-text-violet {
          letter-spacing: 0.02em;
        }
        .support-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.2s ease;
        }
        .support-link:hover {
          color: #6366f1;
        }
        .version-badge {
          padding: 4px 10px;
          border-radius: 6px;
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          font-size: 10px;
          font-weight: 600;
          color: #475569;
          letter-spacing: 0.05em;
        }

        /* ========== HEADER ANIMATIONS ========== */
        .premium-header-animate {
          animation: headerReveal 1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        @keyframes headerReveal {
          0% { 
            opacity: 0; 
            transform: translateY(-30px) scale(0.95);
            filter: blur(10px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        /* ========== LOGO CONTAINER ========== */
        .logo-container-premium {
          position: relative;
          display: inline-block;
          margin-bottom: 24px;
          animation: logoFloat 6s ease-in-out infinite;
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .logo-glow-outer {
          position: absolute;
          inset: -20px;
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(34,211,238,0.3));
          filter: blur(30px);
          opacity: 0.7;
          animation: glowPulse 4s ease-in-out infinite;
        }
        .logo-glow-middle {
          position: absolute;
          inset: -10px;
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(129,140,248,0.4), rgba(56,189,248,0.4));
          filter: blur(20px);
          opacity: 0.5;
          animation: glowPulse 4s ease-in-out infinite 1s;
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .logo-border-rotating {
          position: absolute;
          inset: -3px;
          border-radius: 22px;
          background: conic-gradient(from 0deg, #818cf8, #22d3ee, #a78bfa, #34d399, #fbbf24, #818cf8);
          animation: borderRotate 6s linear infinite;
          z-index: -1;
        }
        @keyframes borderRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .logo-main-card {
          position: relative;
          width: 96px;
          height: 96px;
          border-radius: 18px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(226,232,240,0.8);
          box-shadow: 
            0 20px 40px -10px rgba(0,0,0,0.1),
            0 0 0 1px rgba(255,255,255,0.8) inset;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-inner-gradient {
          width: 76px;
          height: 76px;
          border-radius: 14px;
          background: linear-gradient(135deg, #6366f1, #3b82f6, #06b6d4);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 4px 15px -3px rgba(99,102,241,0.4),
            inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .logo-icon {
          width: 38px;
          height: 38px;
          color: white;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
        .logo-reflection {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%);
          pointer-events: none;
        }
        .logo-verify-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(16,185,129,0.4);
          color: white;
          animation: verifyBounce 2s ease-in-out infinite;
        }
        @keyframes verifyBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .orbit-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          z-index: -1;
        }
        .orbit-dot-1 {
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #f472b6, #ec4899);
          animation: orbitPulse1 2s ease-in-out infinite;
        }
        .orbit-dot-2 {
          bottom: 10px;
          left: -4px;
          background: linear-gradient(135deg, #34d399, #10b981);
          animation: orbitPulse2 2s ease-in-out infinite 0.5s;
        }
        .orbit-dot-3 {
          bottom: 10px;
          right: -4px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          animation: orbitPulse3 2s ease-in-out infinite 1s;
        }
        @keyframes orbitPulse1, @keyframes orbitPulse2, @keyframes orbitPulse3 {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.3); opacity: 1; }
        }

        /* ========== TITLE & SUBTITLE ========== */
        .premium-title {
          margin-bottom: 8px;
        }
        .title-text-gradient {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #1e293b 0%, #4f46e5 50%, #06b6d4 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: titleShine 5s linear infinite;
          letter-spacing: -0.02em;
        }
        @keyframes titleShine {
          to { background-position: 200% center; }
        }
        .premium-subtitle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.95rem;
          color: #64748b;
          font-weight: 500;
        }
        .subtitle-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: linear-gradient(135deg, #eef2ff, #e0e7ff);
          color: #6366f1;
        }
        .tagline-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 12px;
        }
        .tagline-line {
          width: 30px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #cbd5e1);
        }
        .tagline-line:last-child {
          background: linear-gradient(90deg, #cbd5e1, transparent);
        }
        .tagline-text {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* ========== PREMIUM CARD ========== */
        .premium-card-container {
          position: relative;
          animation: cardEntrance 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }
        @keyframes cardEntrance {
          0% { 
            opacity: 0; 
            transform: translateY(40px) scale(0.96);
            filter: blur(10px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        .card-animated-border {
          position: absolute;
          inset: 0;
          border-radius: 28px;
          padding: 1.5px;
          background: linear-gradient(
            var(--mouse-x, 50%) var(--mouse-y, 50%),
            #818cf8 0%,
            #22d3ee 25%,
            #a78bfa 50%,
            #34d399 75%,
            #818cf8 100%
          );
          background-size: 300% 300%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.8;
          transition: background-position 0.5s ease;
          pointer-events: none;
        }
        .card-spotlight {
          position: absolute;
          inset: 0;
          border-radius: 28px;
          background: radial-gradient(
            600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(99,102,241,0.06),
            transparent 40%
          );
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .premium-card-container:hover .card-spotlight {
          opacity: 1;
        }
        .premium-card-content {
          position: relative;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border-radius: 28px;
          border: 1px solid rgba(226,232,240,0.7);
          box-shadow: 
            0 4px 6px -1px rgba(0,0,0,0.05),
            0 20px 50px -12px rgba(0,0,0,0.1),
            0 0 0 1px rgba(255,255,255,0.8) inset;
          overflow: hidden;
        }
        .premium-card-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent);
        }
        .card-bottom-accent {
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #818cf8, #22d3ee, transparent);
          opacity: 0.5;
        }

        /* ========== ROLE TABS ========== */
        .role-section {
          padding: 24px 24px 0;
        }
        .role-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 14px;
        }
        .role-label-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 6px;
          background: linear-gradient(135deg, #eef2ff, #e0e7ff);
          color: #6366f1;
        }
        .role-label-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, #e2e8f0, transparent);
          margin-left: 8px;
        }
        .role-tabs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .role-tab-button {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 14px 8px 12px;
          border-radius: 16px;
          border: 1.5px solid #e2e8f0;
          background: white;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }
        .role-tab-button:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -8px rgba(0,0,0,0.1);
        }
        .role-tab-button[class*="active"] {
          border-color: transparent;
          transform: translateY(-3px);
          box-shadow: 0 12px 28px -10px var(--glow-color, rgba(99,102,241,0.25));
        }
        .active-glow {
          position: absolute;
          inset: 0;
          opacity: 0.15;
          transition: opacity 0.3s ease;
        }
        .active-border-gradient {
          position: absolute;
          inset: 0;
          opacity: 0.5;
        }
        .role-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          transition: all 0.3s ease;
        }
        .role-tab-button:hover .role-icon-wrap {
          background: #e2e8f0;
        }
        .role-icon-active {
          background: transparent !important;
        }
        .icon-gradient-bg {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px -2px rgba(0,0,0,0.15);
        }
        .role-icon-active-svg {
          width: 20px;
          height: 20px;
          color: white;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
        }
        .role-icon-inactive {
          width: 20px;
          height: 20px;
          color: #94a3b8;
          transition: color 0.3s ease;
        }
        .role-tab-button:hover .role-icon-inactive {
          color: #64748b;
        }
        .role-label-text {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          transition: color 0.3s ease;
        }
        .role-label-active-emerald { color: #059669; }
        .role-label-active-blue { color: #2563eb; }
        .role-label-active-purple { color: #9333ea; }
        .role-label-active-amber { color: #d97706; }
        .active-indicator-bar {
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 3px;
          border-radius: 3px 3px 0 0;
        }

        /* ========== ERROR MESSAGE ========== */
        .error-container-premium {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 16px 24px;
          padding: 14px 16px;
          border-radius: 14px;
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border: 1px solid #fecaca;
          animation: errorSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1), errorShake 0.5s ease-out 0.4s;
        }
        @keyframes errorSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(4px); }
        }
        .error-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .error-icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, #fecaca, #fca5a5);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .error-icon {
          width: 16px;
          height: 16px;
          color: #dc2626;
        }
        .error-text {
          font-size: 13px;
          font-weight: 600;
          color: #991b1b;
        }
        .error-close {
          padding: 4px;
          color: #dc2626;
          opacity: 0.6;
          transition: opacity 0.2s ease;
        }
        .error-close:hover {
          opacity: 1;
        }

        /* ========== FORM INPUTS ========== */
        .form-space-premium {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .input-group-premium {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-label-premium {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          transition: color 0.3s ease;
        }
        .input-label-focused {
          color: #6366f1;
        }
        .input-label-icon {
          width: 16px;
          height: 16px;
          color: #94a3b8;
          transition: color 0.3s ease;
        }
        .input-label-focused .input-label-icon {
          color: #6366f1;
        }
        .input-required-mark {
          color: #ef4444;
          margin-left: 2px;
        }
        .input-wrapper-premium {
          position: relative;
          display: flex;
          align-items: center;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
          background: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        .input-wrapper-focused {
          border-color: #818cf8;
          box-shadow: 
            0 0 0 4px rgba(99,102,241,0.08),
            0 4px 12px -4px rgba(99,102,241,0.15);
        }
        .input-prefix {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 100%;
          flex-shrink: 0;
        }
        .input-prefix-icon {
          width: 18px;
          height: 18px;
          color: #94a3b8;
          transition: all 0.3s ease;
        }
        .prefix-icon-focused {
          color: #6366f1;
          transform: scale(1.1);
        }
        .premium-input-field {
          flex: 1;
          height: 52px;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
          background: transparent;
          border: none;
          outline: none;
        }
        .premium-input-field::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }
        .input-focus-line {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #818cf8, #22d3ee);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        .input-wrapper-focused .input-focus-line {
          width: 100%;
        }
        .input-glow-effect {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(34,211,238,0.08));
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .input-wrapper-focused .input-glow-effect {
          opacity: 1;
        }
        .password-toggle-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          padding: 6px;
          color: #94a3b8;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .password-toggle-btn:hover {
          color: #6366f1;
          background: rgba(99,102,241,0.08);
        }

        /* ========== SUBMIT BUTTON ========== */
        .premium-submit-btn {
          position: relative;
          width: 100%;
          height: 54px;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .premium-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 8px 25px -8px rgba(99,102,241,0.5),
            0 4px 10px -4px rgba(0,0,0,0.1);
        }
        .premium-submit-btn:active {
          transform: translateY(0) scale(0.98);
        }
        .btn-bg-base {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
        }
        .btn-bg-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #818cf8, #6366f1, #3b82f6, #06b6d4);
          background-size: 300% 300%;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .premium-submit-btn:hover .btn-bg-gradient {
          opacity: 1;
          animation: btnGradientShift 3s ease infinite;
        }
        @keyframes btnGradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .btn-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        .premium-submit-btn:hover .btn-shimmer {
          transform: translateX(100%);
        }
        .btn-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.01em;
        }
        .btn-spinner {
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .btn-arrow {
          width: 18px;
          height: 18px;
          transition: transform 0.3s ease;
        }
        .premium-submit-btn:hover .btn-arrow {
          transform: translateX(4px);
        }
        .btn-hover-glow {
          position: absolute;
          inset: -2px;
          border-radius: 16px;
          background: linear-gradient(135deg, #818cf8, #22d3ee);
          opacity: 0;
          filter: blur(15px);
          z-index: -1;
          transition: opacity 0.4s ease;
        }
        .premium-submit-btn:hover .btn-hover-glow {
          opacity: 0.4;
        }

        /* ========== DIVIDER ========== */
        .divider-premium {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 20px 24px;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
        }
        .divider-text {
          display: flex;
          align-items: center;
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          white-space: nowrap;
        }

        /* ========== QUICK ACCESS ========== */
        .quick-access-section {
          padding: 0 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .admin-quick-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1.5px solid #fde68a;
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .admin-quick-btn:hover {
          border-color: #fcd34d;
          box-shadow: 0 8px 20px -8px rgba(245,158,11,0.3);
          transform: translateY(-1px);
        }
        .admin-btn-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .admin-btn-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px -2px rgba(245,158,11,0.4);
        }
        .admin-btn-icon {
          width: 20px;
          height: 20px;
          color: white;
        }
        .admin-btn-title {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #92400e;
        }
        .admin-btn-desc {
          display: block;
          font-size: 11px;
          color: #b45309;
        }
        .admin-btn-arrow {
          width: 18px;
          height: 18px;
          color: #d97706;
          transition: transform 0.3s ease;
        }
        .admin-quick-btn:hover .admin-btn-arrow {
          transform: translateX(4px);
        }
        .admin-btn-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(251,191,36,0.2), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .admin-quick-btn:hover .admin-btn-glow {
          opacity: 1;
        }

        /* ========== DEPARTMENT SELECTOR ========== */
        .dept-selector-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .dept-label {
          display: flex;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .dept-dropdown-container {
          position: relative;
        }
        .dept-dropdown-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .dept-dropdown-trigger:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px -4px rgba(0,0,0,0.08);
        }
        .dept-selected {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }
        .dept-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #eef2ff, #e0e7ff);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #c7d2fe;
        }
        .dept-chevron {
          width: 16px;
          height: 16px;
          color: #94a3b8;
          transition: transform 0.3s ease;
        }
        .chevron-open {
          transform: rotate(180deg);
        }
        .dept-dropdown-menu {
          position: absolute;
          z-index: 50;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(20px);
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 40px -12px rgba(0,0,0,0.15);
          max-height: 220px;
          overflow-y: auto;
          animation: dropdownOpen 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes dropdownOpen {
          from { opacity: 0; transform: translateY(-10px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .dept-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: #475569;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .dept-option:first-child {
          border-radius: 14px 14px 0 0;
        }
        .dept-option:last-child {
          border-radius: 0 0 14px 14px;
        }
        .dept-option:hover {
          background: #f8fafc;
        }
        .dept-option-active {
          background: linear-gradient(135deg, #eef2ff, #e0e7ff);
          color: #4f46e5;
        }
        .dept-option-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-blue { background: #3b82f6; }
        .dot-green { background: #10b981; }
        .dot-purple { background: #8b5cf6; }
        .dot-orange { background: #f97316; }
        .dot-pink { background: #ec4899; }
        .dot-cyan { background: #06b6d4; }
        .dot-red { background: #ef4444; }
        .dot-gray { background: #6b7280; }
        .dept-option-code {
          font-weight: 600;
        }
        .dept-option-name {
          color: #94a3b8;
          font-size: 12px;
        }
        .dept-option-check {
          width: 16px;
          height: 16px;
          color: #4f46e5;
          margin-left: auto;
        }

        /* ========== QUICK ROLE GRID ========== */
        .quick-role-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .quick-role-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 8px;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
          background: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }
        .quick-role-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px -6px rgba(0,0,0,0.1);
        }
        .quick-role-active-emerald {
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border-color: #6ee7b7;
        }
        .quick-role-active-blue {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border-color: #93c5fd;
        }
        .quick-role-active-purple {
          background: linear-gradient(135deg, #faf5ff, #ede9fe);
          border-color: #c4b5fd;
        }
        .quick-role-icon {
          width: 22px;
          height: 22px;
          color: #94a3b8;
          transition: all 0.3s ease;
        }
        .quick-role-icon-active-emerald { color: #059669; }
        .quick-role-icon-active-blue { color: #2563eb; }
        .quick-role-icon-active-purple { color: #9333ea; }
        .quick-role-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          transition: color 0.3s ease;
        }
        .quick-role-label-active-emerald { color: #047857; }
        .quick-role-label-active-blue { color: #1d4ed8; }
        .quick-role-label-active-purple { color: #7c3aed; }
        .quick-role-indicator {
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 3px;
          border-radius: 3px 3px 0 0;
        }
        .indicator-emerald { background: linear-gradient(90deg, #10b981, #34d399); }
        .indicator-blue { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
        .indicator-purple { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }

        /* ========== DEPARTMENT PILLS ========== */
        .dept-pills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        .dept-pill {
          position: relative;
          padding: 8px 14px;
          border-radius: 9999px;
          border: 1.5px solid #e2e8f0;
          background: white;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .dept-pill:hover {
          border-color: #cbd5e1;
          color: #475569;
        }
        .dept-pill-active {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px -4px rgba(99,102,241,0.5);
        }
        .pill-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
        }
        .pill-text {
          position: relative;
          z-index: 1;
        }

        /* ========== FOOTER ========== */
        .premium-footer {
          margin-top: 24px;
          animation: footerFadeIn 0.6s ease-out 0.5s both;
        }
        @keyframes footerFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .footer-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .footer-lock-icon {
          width: 14px;
          height: 14px;
          color: #94a3b8;
        }
        .footer-text {
          font-size: 11px;
          font-weight: 500;
          color: #94a3b8;
        }
        .footer-dots {
          display: flex;
          gap: 4px;
          margin-left: 8px;
        }
        .footer-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #cbd5e1;
        }
        .footer-dot-delay {
          animation: dotPulse 1.5s ease-in-out infinite 0.2s;
        }
        .footer-dot-delay-2 {
          animation: dotPulse 1.5s ease-in-out infinite 0.4s;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
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

  // HOD Dashboard - Use separate component for hooks compliance
  if (user.role === 'HOD') {
    return <HodDashboardContent user={user} setActiveTab={setActiveTab} />
  }

  // Staff Dashboard - Use separate component for hooks compliance
  if (user.role === 'STAFF') {
    return <StaffDashboardContent user={user} setActiveTab={setActiveTab} />
  }

  // Student Dashboard - Use separate component for hooks compliance
  return <StudentDashboardContent user={user} setActiveTab={setActiveTab} />
}

// ============ STUDENT DASHBOARD COMPONENT (Separate for Hooks Compliance) ============
function StudentDashboardContent({ user, setActiveTab }: { user: User; setActiveTab: (tab: TabType) => void }) {
  const [allStudentAchievements, setAllStudentAchievements] = useState<any[]>([])
  const [selectedDashboardType, setSelectedDashboardType] = useState<string | null>(null)
  
  // Load achievements from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('student_achievements')
    if (saved) {
      try {
        setAllStudentAchievements(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse achievements:', e)
      }
    }
  }, [])
  
  // IMPORTANT: Filter to show ONLY current student's achievements
  // Each student can only see their own records, not other students'
  const studentAchievements = allStudentAchievements.filter((a: any) => 
    a.studentId === user.id || a.studentEmail === user.email || a.studentName === user.name
  )
  
  // Calculate stats from actual data (filtered for current student only)
  const totalRecords = studentAchievements.length
  const pendingCount = studentAchievements.filter((a: any) => 
    a.status === 'pending_staff' || a.status === 'pending_hod'
  ).length
  const approvedCount = studentAchievements.filter((a: any) => 
    a.status === 'hod_approved' || a.status === 'staff_approved'
  ).length
  const rejectedCount = studentAchievements.filter((a: any) => 
    a.status === 'rejected'
  ).length
  
  // Calculate counts per achievement type (for current student only)
  const getTypeCount = (typeKey: string) => {
    return studentAchievements.filter((a: any) => a.type === typeKey).length
  }
  
  // Get max count for bar graph scaling
  const maxTypeCount = Math.max(
    ...Object.keys(ACHIEVEMENT_TYPES).map(key => getTypeCount(key)),
    1
  )
  
  // Get achievements for selected type (for current student only)
  const selectedTypeAchievements = selectedDashboardType 
    ? studentAchievements.filter((a: any) => a.type === selectedDashboardType)
    : []

  return (
    <div className="space-y-6">
      {/* Stats Cards Row - With Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records */}
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden cursor-pointer" onClick={() => setSelectedDashboardType(null)}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">TOTAL RECORDS</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{totalRecords}</p>
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
                <p className="text-3xl font-bold text-gray-800 mt-1">{pendingCount}</p>
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
                <p className="text-3xl font-bold text-gray-800 mt-1">{approvedCount}</p>
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
                <p className="text-3xl font-bold text-gray-800 mt-1">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <CloseIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-gradient-to-r from-red-400 to-red-500" />
        </Card>
      </div>

      {/* Charts Section - Achievement Types Bar Graph & Flow Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievement Types Bar Chart - With Real Data */}
        <Card className="border border-gray-200 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-500" /> Achievements by Type
              {selectedDashboardType && (
                <span className="text-sm font-normal text-cyan-600 cursor-pointer hover:underline ml-2" onClick={() => setSelectedDashboardType(null)}>
                  (Click to clear filter)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-end justify-between gap-1 px-2 overflow-x-auto">
              {Object.entries(ACHIEVEMENT_TYPES).map(([key, type]) => {
                const Icon = type.icon
                const colors = [
                  'from-blue-500 to-blue-400',
                  'from-purple-500 to-purple-400', 
                  'from-amber-500 to-orange-400',
                  'from-green-500 to-teal-400',
                  'from-pink-500 to-rose-400',
                  'from-cyan-500 to-cyan-400',
                  'from-indigo-500 to-violet-400',
                  'from-yellow-500 to-amber-400',
                  'from-emerald-500 to-green-400',
                  'from-violet-500 to-purple-400',
                  'from-red-500 to-pink-400',
                  'from-slate-500 to-gray-400',
                  'from-gray-400 to-gray-300'
                ]
                const colorIndex = Object.keys(ACHIEVEMENT_TYPES).indexOf(key) % colors.length
                // Use real count for height
                const count = getTypeCount(key)
                const height = maxTypeCount > 0 ? Math.max((count / maxTypeCount) * 100, count > 0 ? 8 : 2) : 2
                const isSelected = selectedDashboardType === key
                return (
                  <div 
                    key={key} 
                    className={`flex-1 min-w-[50px] flex flex-col items-center gap-1.5 ${isSelected ? 'ring-2 ring-cyan-500 rounded-lg' : ''}`}
                  >
                    <div className="w-full flex items-end justify-center h-52">
                      <div 
                        onClick={() => setSelectedDashboardType(isSelected ? null : key)}
                        className={`w-full max-w-[45px] bg-gradient-to-t ${colors[colorIndex]} ${isSelected ? 'ring-2 ring-offset-1 ring-cyan-500' : ''} rounded-t-md hover:opacity-80 transition-all cursor-pointer relative group`}
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {count} {count === 1 ? 'item' : 'items'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <Icon className={`w-4 h-4 ${count > 0 ? 'text-cyan-600' : 'text-gray-400'}`} />
                      <span className="text-[9px] text-gray-600 text-center leading-tight line-clamp-2">{type.label.split(' ')[0]}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Flow / Trend Graph */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" /> Achievement Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 relative">
              {/* Simple SVG Line Chart */}
              <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                  <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#f0f0f0" strokeWidth="0.5" />
                ))}
                {/* Area fill */}
                <path
                  d="M0,80 Q25,70 50,55 T100,40 T150,30 T200,15 L200,100 L0,100 Z"
                  fill="url(#gradient)"
                  opacity="0.3"
                />
                {/* Line */}
                <path
                  d="M0,80 Q25,70 50,55 T100,40 T150,30 T200,15"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Data points */}
                {[[0,80], [50,55], [100,40], [150,30], [200,15]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="3" fill="#06b6d4" className="hover:r-4 transition-all cursor-pointer" />
                ))}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-gray-400 px-1">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-around text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-gray-500">Submissions</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-600">+23%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Type Summary Cards - Clickable with Real Data */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-500" /> Achievement Overview by Category
            {selectedDashboardType && (
              <span className="text-sm font-normal text-purple-600 cursor-pointer hover:underline ml-2" onClick={() => setSelectedDashboardType(null)}>
                (Showing: {ACHIEVEMENT_TYPES[selectedDashboardType]?.label})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(ACHIEVEMENT_TYPES).map(([key, type]) => {
              const Icon = type.icon
              const count = getTypeCount(key)
              const isSelected = selectedDashboardType === key
              return (
                <div 
                  key={key} 
                  onClick={() => setSelectedDashboardType(isSelected ? null : key)}
                  className={`p-3 rounded-xl bg-gradient-to-br ${type.color} hover:shadow-lg transition-all cursor-pointer ${isSelected ? 'ring-4 ring-cyan-400 scale-105' : 'hover:scale-102'}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg font-bold text-white">{count}</p>
                  <p className="text-[10px] text-white/80 leading-tight line-clamp-2">{type.label}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Type Detail View */}
      {selectedDashboardType && (
        <Card className="border border-cyan-200 bg-gradient-to-r from-cyan-50 to-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                {(() => {
                  const SelectedIcon = ACHIEVEMENT_TYPES[selectedDashboardType]?.icon
                  return SelectedIcon ? <SelectedIcon className="w-5 h-5 text-cyan-600" /> : null
                })()}
                {ACHIEVEMENT_TYPES[selectedDashboardType]?.label} - Details
              </CardTitle>
              <button 
                onClick={() => setSelectedDashboardType(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedTypeAchievements.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">
                  Showing <span className="font-semibold text-cyan-600">{selectedTypeAchievements.length}</span> achievement(s) in this category
                </p>
                <div className="grid gap-3 max-h-64 overflow-y-auto">
                  {selectedTypeAchievements.map((achievement: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-cyan-200 transition-colors">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${ACHIEVEMENT_TYPES[selectedDashboardType]?.color || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                        {(() => {
                          const TypeIcon = ACHIEVEMENT_TYPES[selectedDashboardType]?.icon
                          return TypeIcon ? <TypeIcon className="w-5 h-5 text-white" /> : null
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{achievement.title || 'Untitled'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(achievement.submittedAt || Date.now()).toLocaleDateString()} • 
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ml-1 ${
                            achievement.status?.includes('approved') ? 'bg-green-100 text-green-700' :
                            achievement.status?.includes('pending') ? 'bg-orange-100 text-orange-700' :
                            achievement.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {achievement.status?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No achievements in this category yet</p>
                <p className="text-sm text-gray-400 mt-1">Click "Submit New" to add your first achievement</p>
                <button 
                  onClick={() => setActiveTab('student_achievement_view')}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all"
                >
                  Add Achievement
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

// ============ HOD DASHBOARD COMPONENT (Department-Specific with User Management & Analytics) ============
function HodDashboardContent({ user, setActiveTab }: { user: User; setActiveTab: (tab: TabType) => void }) {
  const [activeTab, setActiveTabLocal] = useState<'overview' | 'students' | 'staff'>('overview')
  const [studentAchievements, setStudentAchievements] = useState<any[]>([])
  const [staffAchievements, setStaffAchievements] = useState<any[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [searchUser, setSearchUser] = useState('')
  
  // Department users (filtered by HOD's department)
  const [departmentStudents, setDepartmentStudents] = useState<any[]>([])
  const [departmentStaff, setDepartmentStaff] = useState<any[]>([])

  // CRUD Modal States
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'student' | 'staff', id: number} | null>(null)

  // Form States
  const [studentForm, setStudentForm] = useState({ name: '', regNo: '', year: 'I Year', email: '', status: 'active' })
  const [staffForm, setStaffForm] = useState({ name: '', designation: '', email: '', status: 'active', phone: '' })

  // Load achievements from localStorage on mount
  useEffect(() => {
    try {
      const savedStudent = localStorage.getItem('student_achievements')
      if (savedStudent) {
        const parsed = JSON.parse(savedStudent)
        // Filter for current department only
        const deptStudent = parsed.filter((a: any) => a.dept === user.departmentName || a.department === user.departmentName)
        setStudentAchievements(deptStudent)
      }
      
      const savedStaff = localStorage.getItem('staff_achievements')
      if (savedStaff) {
        const parsed = JSON.parse(savedStaff)
        // Filter for current department only
        const deptStaff = parsed.filter((a: any) => a.dept === user.departmentName || a.department === user.departmentName)
        setStaffAchievements(deptStaff)
      }
    } catch (e) {
      console.error('Failed to parse achievements:', e)
    }
  }, [user.departmentName])

  // Load department users from localStorage or use defaults
  useEffect(() => {
    const storageKey = `hod_users_${user.departmentName}`
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.students) setDepartmentStudents(parsed.students)
        if (parsed.staff) setDepartmentStaff(parsed.staff)
        return
      }
    } catch (e) {
      console.error('Failed to load department users:', e)
    }

    // Default demo data - in real app this would come from API/database filtered by department
    const demoStudents = [
      { id: 1, name: 'Bhavani S', regNo: 'CSE001', year: 'III Year', email: 'bhavani@niet.ac.in', status: 'active' },
      { id: 2, name: 'Arun Kumar', regNo: 'CSE002', year: 'IV Year', email: 'arun@niet.ac.in', status: 'active' },
      { id: 3, name: 'Priya R', regNo: 'CSE003', year: 'II Year', email: 'priya@niet.ac.in', status: 'active' },
      { id: 4, name: 'Karthik M', regNo: 'CSE004', year: 'I Year', email: 'karthik@niet.ac.in', status: 'inactive' },
      { id: 5, name: 'Deepa L', regNo: 'CSE005', year: 'III Year', email: 'deepa@niet.ac.in', status: 'active' },
      { id: 6, name: 'Rahul V', regNo: 'CSE006', year: 'IV Year', email: 'rahul@niet.ac.in', status: 'active' },
      { id: 7, name: 'Sneha K', regNo: 'CSE007', year: 'II Year', email: 'sneha@niet.ac.in', status: 'active' },
      { id: 8, name: 'Vijay S', regNo: 'CSE008', year: 'I Year', email: 'vijay@niet.ac.in', status: 'active' },
    ]
    
    const demoStaff = [
      { id: 1, name: 'Dr. Ramesh Kumar', designation: 'Professor & HOD', email: 'ramesh@niet.ac.in', status: 'active', phone: '+91 98765 43210' },
      { id: 2, name: 'Dr. Lakshmi Devi', designation: 'Associate Professor', email: 'lakshmi@niet.ac.in', status: 'active', phone: '+91 98765 43211' },
      { id: 3, name: 'Mr. Suresh Babu', designation: 'Assistant Professor', email: 'suresh@niet.ac.in', status: 'active', phone: '+91 98765 43212' },
      { id: 4, name: 'Ms. Anitha Reddy', designation: 'Assistant Professor', email: 'anitha@niet.ac.in', status: 'on_leave', phone: '+91 98765 43213' },
      { id: 5, name: 'Dr. Venkat Rao', designation: 'Associate Professor', email: 'venkat@niet.ac.in', status: 'active', phone: '+91 98765 43214' },
    ]
    
    setDepartmentStudents(demoStudents)
    setDepartmentStaff(demoStaff)
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify({ students: demoStudents, staff: demoStaff }))
  }, [user.departmentName])

  // Save department users to localStorage whenever they change
  useEffect(() => {
    if (departmentStudents.length > 0 || departmentStaff.length > 0) {
      const storageKey = `hod_users_${user.departmentName}`
      localStorage.setItem(storageKey, JSON.stringify({ students: departmentStudents, staff: departmentStaff }))
    }
  }, [departmentStudents, departmentStaff, user.departmentName])

  // ==================== STUDENT CRUD OPERATIONS ====================
  const handleAddStudent = () => {
    setEditingStudent(null)
    setStudentForm({ name: '', regNo: '', year: 'I Year', email: '', status: 'active' })
    setShowStudentModal(true)
  }

  const handleEditStudent = (student: any) => {
    setEditingStudent(student)
    setStudentForm({ 
      name: student.name, 
      regNo: student.regNo, 
      year: student.year, 
      email: student.email, 
      status: student.status 
    })
    setShowStudentModal(true)
  }

  const handleSaveStudent = () => {
    if (!studentForm.name.trim() || !studentForm.regNo.trim()) {
      alert('Please fill in all required fields')
      return
    }

    if (editingStudent) {
      // Update existing student
      setDepartmentStudents(prev => prev.map(s => 
        s.id === editingStudent.id ? { ...s, ...studentForm } : s
      ))
    } else {
      // Add new student
      const newId = Math.max(...departmentStudents.map(s => s.id), 0) + 1
      setDepartmentStudents(prev => [...prev, { id: newId, ...studentForm }])
    }
    
    setShowStudentModal(false)
    setEditingStudent(null)
  }

  const handleDeleteStudent = (id: number) => {
    setDeleteConfirm({ type: 'student', id })
  }

  const confirmDelete = () => {
    if (!deleteConfirm) return
    
    if (deleteConfirm.type === 'student') {
      setDepartmentStudents(prev => prev.filter(s => s.id !== deleteConfirm.id))
    } else {
      setDepartmentStaff(prev => prev.filter(s => s.id !== deleteConfirm.id))
    }
    
    setDeleteConfirm(null)
  }

  // ==================== STAFF CRUD OPERATIONS ====================
  const handleAddStaff = () => {
    setEditingStaff(null)
    setStaffForm({ name: '', designation: '', email: '', status: 'active', phone: '' })
    setShowStaffModal(true)
  }

  const handleEditStaff = (staffMember: any) => {
    setEditingStaff(staffMember)
    setStaffForm({ 
      name: staffMember.name, 
      designation: staffMember.designation, 
      email: staffMember.email, 
      status: staffMember.status,
      phone: staffMember.phone || ''
    })
    setShowStaffModal(true)
  }

  const handleSaveStaff = () => {
    if (!staffForm.name.trim() || !staffForm.designation.trim()) {
      alert('Please fill in all required fields')
      return
    }

    if (editingStaff) {
      // Update existing staff
      setDepartmentStaff(prev => prev.map(s => 
        s.id === editingStaff.id ? { ...s, ...staffForm } : s
      ))
    } else {
      // Add new staff
      const newId = Math.max(...departmentStaff.map(s => s.id), 0) + 1
      setDepartmentStaff(prev => [...prev, { id: newId, ...staffForm, achievements: 0 }])
    }
    
    setShowStaffModal(false)
    setEditingStaff(null)
  }

  const handleDeleteStaff = (id: number) => {
    setDeleteConfirm({ type: 'staff', id })
  }

  // Calculate department stats
  const totalStudents = departmentStudents.length
  const totalStaff = departmentStaff.length
  const totalStudentAchievements = studentAchievements.length
  const totalStaffAchievements = staffAchievements.length
  
  const pendingStudentApprovals = studentAchievements.filter(a => 
    a.status === 'pending_staff' || a.status === 'pending_hod'
  ).length
  const pendingStaffApprovals = staffAchievements.filter(a => 
    a.status === 'pending_staff' || a.status === 'pending_hod'
  ).length

  // Get unique years from achievements
  const availableYears = ['all', ...new Set([
    ...studentAchievements.map(a => a.data?.year || a.year),
    ...staffAchievements.map(a => a.data?.year_pub || a.year)
  ].filter(Boolean))]

  // Filter achievements by selected year
  const filteredStudentAchievements = selectedYear === 'all' 
    ? studentAchievements 
    : studentAchievements.filter(a => (a.data?.year || a.year) === selectedYear)
  
  const filteredStaffAchievements = selectedYear === 'all'
    ? staffAchievements
    : staffAchievements.filter(a => (a.data?.year_pub || a.year) === selectedYear)

  // Filter users by search
  const filteredStudents = departmentStudents.filter(s => 
    s.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    s.regNo.toLowerCase().includes(searchUser.toLowerCase())
  )
  const filteredStaffList = departmentStaff.filter(s =>
    s.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    s.designation.toLowerCase().includes(searchUser.toLowerCase())
  )

  // Student achievement counts by type
  const getStudentTypeCount = (typeKey: string) => {
    return filteredStudentAchievements.filter(a => a.type === typeKey).length
  }

  // Staff achievement counts by type
  const getStaffTypeCount = (typeKey: string) => {
    return filteredStaffAchievements.filter(a => a.type === typeKey).length
  }

  // Student counts by year
  const studentsByYear = departmentStudents.reduce((acc, s) => {
    const year = s.year || 'Unknown'
    acc[year] = (acc[year] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">HOD Dashboard</h2>
            <p className="text-violet-100">{user.departmentName || 'Your Department'} • Head of Department</p>
            <p className="text-violet-200 text-sm mt-2">Welcome, {user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
              <Building2 className="w-4 h-4 mr-2" />
              {user.departmentName}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'students', label: 'Students', icon: GraduationCap, count: totalStudents },
          { id: 'staff', label: 'Staff', icon: Users, count: totalStaff },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTabLocal(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-violet-700 shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {'count' in tab && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-violet-100 text-violet-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200 hover:shadow-lg transition-all overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Students</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{totalStudents}</p>
                    <p className="text-xs text-green-600 mt-1">{studentsByYear['IV Year'] || 0} Final Year</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
              <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-500" />
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-all overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Faculty Members</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{totalStaff}</p>
                    <p className="text-xs text-green-600 mt-1">{departmentStaff.filter(s => s.status === 'active').length} Active</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
              <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-all overflow-hidden cursor-pointer" onClick={() => setActiveTab('analytics')}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Achievements</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{totalStudentAchievements + totalStaffAchievements}</p>
                    <p className="text-xs text-violet-600 mt-1">{totalStudentAchievements} Students • {totalStaffAchievements} Staff</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-violet-600" />
                  </div>
                </div>
              </CardContent>
              <div className="h-1 bg-gradient-to-r from-violet-400 to-violet-500" />
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-all overflow-hidden cursor-pointer" onClick={() => setActiveTab('students')}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pending Approvals</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{pendingStudentApprovals + pendingStaffApprovals}</p>
                    <p className="text-xs text-orange-600 mt-1">{pendingStudentApprovals} Students • {pendingStaffApprovals} Staff</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
              <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-500" />
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-violet-500" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button 
                  onClick={() => setActiveTab('students')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                >
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900 text-sm">Review Student Submissions</p>
                    <p className="text-xs text-blue-600">{pendingStudentApprovals} pending approval</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-400 ml-auto" />
                </button>
                <button 
                  onClick={() => setActiveTab('staff')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors text-left"
                >
                  <Users className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-900 text-sm">View Staff Achievements</p>
                    <p className="text-xs text-emerald-600">{totalStaffAchievements} total submissions</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400 ml-auto" />
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-violet-50 hover:bg-violet-100 transition-colors text-left"
                >
                  <BarChart3 className="w-5 h-5 text-violet-600" />
                  <div>
                    <p className="font-medium text-violet-900 text-sm">Department Analytics</p>
                    <p className="text-xs text-violet-600">View detailed reports</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-violet-400 ml-auto" />
                </button>
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-500" /> Recent Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[220px] overflow-y-auto">
                  {[...studentAchievements.slice(0, 3), ...staffAchievements.slice(0, 3)]
                    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                    .slice(0, 5)
                    .map(entry => (
                      <div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          entry.studentName ? 'bg-blue-100' : 'bg-emerald-100'
                        }`}>
                          {entry.studentName ? 
                            <GraduationCap className="w-4 h-4 text-blue-600" /> :
                            <Users className="w-4 h-4 text-emerald-600" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {entry.studentName || entry.submittedBy || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">{entry.typeName || entry.title}</p>
                        </div>
                        <Badge className={
                          entry.status === 'pending_hod' ? 'bg-amber-100 text-amber-700' :
                          entry.status.includes('approved') ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-600'
                        }>
                          {entry.status?.replace('_', ' ') || 'Pending'}
                        </Badge>
                      </div>
                    ))
                  }
                  {(studentAchievements.length + staffAchievements.length) === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No submissions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* STUDENTS TAB - User Management with CRUD */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Search, Filter and Add Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name or register number..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
              />
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
            >
              <option value="all">All Years</option>
              <option value="I Year">I Year</option>
              <option value="II Year">II Year</option>
              <option value="III Year">III Year</option>
              <option value="IV Year">IV Year</option>
            </select>
            <Button
              onClick={handleAddStudent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add Student
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Students List */}
            <Card className="border border-gray-200 lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-500" /> 
                    Department Students ({filteredStudents.length})
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">{user.departmentName}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Reg No</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Year</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(student => {
                        const studentAchievementCount = studentAchievements.filter(
                          a => a.studentName === student.name || a.reg === student.regNo
                        ).length
                        return (
                          <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm font-mono text-gray-700">{student.regNo}</td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{student.name}</p>
                                <p className="text-xs text-gray-500">{student.email}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{student.year}</td>
                            <td className="py-3 px-4">
                              <Badge className={
                                student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }>
                                {student.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium mr-2">
                                  <Trophy className="w-3 h-3" />
                                  {studentAchievementCount}
                                </span>
                                <button
                                  onClick={() => handleEditStudent(student)}
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Student"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(student.id)}
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Student"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-12">
                      <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No students found</p>
                      <p className="text-sm text-gray-400 mt-1">Add students to your department or adjust your search</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Student Achievements Summary */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" /> Achievement Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Total Student Achievements</p>
                    <p className="text-2xl font-bold text-blue-700">{filteredStudentAchievements.length}</p>
                  </div>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {Object.entries(ACHIEVEMENT_TYPES).map(([key, type]) => {
                      const count = getStudentTypeCount(key)
                      if (count === 0) return null
                      const Icon = type.icon
                      return (
                        <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-700 truncate max-w-[120px]">{type.label}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-800">{count}</span>
                        </div>
                      )
                    })}
                    {filteredStudentAchievements.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No achievements yet</p>
                    )}
                  </div>

                  {/* Students by Year */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Students by Year</p>
                    <div className="space-y-2">
                      {Object.entries(studentsByYear).map(([year, count]) => (
                        <div key={year} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{year}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(count / totalStudents) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700 w-6 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* STAFF TAB - User Management with CRUD */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Search and Add Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff by name or designation..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
              />
            </div>
            <Button
              onClick={handleAddStaff}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add Faculty
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Staff List */}
            <Card className="border border-gray-200 lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" /> 
                    Department Faculty ({filteredStaffList.length})
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">{user.departmentName}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredStaffList.map(staffMember => {
                    const staffAchievementCount = staffAchievements.filter(
                      a => a.submittedBy === staffMember.name
                    ).length
                    return (
                      <div key={staffMember.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {staffMember.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{staffMember.name}</p>
                                <p className="text-xs text-gray-500">{staffMember.designation}</p>
                                <p className="text-xs text-gray-400 mt-1">{staffMember.email}</p>
                                {staffMember.phone && (
                                  <p className="text-xs text-gray-400">{staffMember.phone}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditStaff(staffMember)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Staff"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStaff(staffMember.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Staff"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={
                                staffMember.status === 'active' ? 'bg-green-100 text-green-700' : 
                                staffMember.status === 'on_leave' ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-600'
                              }>
                                {staffMember.status.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-emerald-600 font-medium">
                                <Trophy className="w-3 h-3 inline mr-1" />
                                {staffAchievementCount} achievements
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {filteredStaffList.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No faculty members found</p>
                    <p className="text-sm text-gray-400 mt-1">Add faculty to your department</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Staff Achievements Summary */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-violet-500" /> Staff Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-emerald-600 font-medium">Total Staff Achievements</p>
                    <p className="text-2xl font-bold text-emerald-700">{filteredStaffAchievements.length}</p>
                  </div>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {Object.entries(STAFF_ACHIEVEMENT_TYPES).map(([key, type]) => {
                      const count = getStaffTypeCount(key)
                      if (count === 0) return null
                      const Icon = type.icon
                      return (
                        <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-700 truncate max-w-[120px]">{type.label}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-800">{count}</span>
                        </div>
                      )
                    })}
                    {filteredStaffAchievements.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No achievements yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Note: Analytics moved to Department Analytics in sidebar - accessible via setActiveTab('analytics') */}

      {/* ==================== MODALS ==================== */}
      
      {/* Student Add/Edit Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h3>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">{user.departmentName} Department</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                  placeholder="Enter student full name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Register Number *</label>
                <input
                  type="text"
                  value={studentForm.regNo}
                  onChange={(e) => setStudentForm({...studentForm, regNo: e.target.value.toUpperCase()})}
                  placeholder="e.g., CSE001"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={studentForm.year}
                    onChange={(e) => setStudentForm({...studentForm, year: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                  >
                    <option value="I Year">I Year</option>
                    <option value="II Year">II Year</option>
                    <option value="III Year">III Year</option>
                    <option value="IV Year">IV Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={studentForm.status}
                    onChange={(e) => setStudentForm({...studentForm, status: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                  placeholder="student@niet.ac.in"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowStudentModal(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveStudent}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                {editingStudent ? 'Update Student' : 'Add Student'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Add/Edit Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingStaff ? 'Edit Faculty Member' : 'Add New Faculty'}
                </h3>
                <button
                  onClick={() => setShowStaffModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">{user.departmentName} Department</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({...staffForm, name: e.target.value})}
                  placeholder="Enter faculty full name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                <input
                  type="text"
                  value={staffForm.designation}
                  onChange={(e) => setStaffForm({...staffForm, designation: e.target.value})}
                  placeholder="e.g., Assistant Professor"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({...staffForm, email: e.target.value})}
                    placeholder="faculty@niet.ac.in"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({...staffForm, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={staffForm.status}
                  onChange={(e) => setStaffForm({...staffForm, status: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowStaffModal(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveStaff}
                className="px-6 bg-emerald-600 hover:bg-emerald-700"
              >
                {editingStaff ? 'Update Faculty' : 'Add Faculty'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to delete this {deleteConfirm.type === 'student' ? 'student' : 'faculty member'}? 
                This action cannot be undone.
              </p>
            </div>
            <div className="p-6 pt-0 flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="px-6 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ STAFF DASHBOARD COMPONENT (Separate for Hooks Compliance) ============
function StaffDashboardContent({ user, setActiveTab }: { user: User; setActiveTab: (tab: TabType) => void }) {
  const [staffAchievements, setStaffAchievements] = useState<any[]>([])
  const [selectedDashboardType, setSelectedDashboardType] = useState<string | null>(null)
  
  // Load achievements from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('staff_achievements')
    if (saved) {
      try {
        setStaffAchievements(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse staff achievements:', e)
      }
    }
  }, [])
  
  // Calculate stats from actual data
  const totalRecords = staffAchievements.length
  const pendingCount = staffAchievements.filter((a: any) => 
    a.status === 'pending_staff' || a.status === 'pending_hod'
  ).length
  const approvedCount = staffAchievements.filter((a: any) => 
    a.status === 'hod_approved' || a.status === 'staff_approved'
  ).length
  const rejectedCount = staffAchievements.filter((a: any) => 
    a.status === 'rejected'
  ).length
  
  // Calculate counts per achievement type
  const getTypeCount = (typeKey: string) => {
    return staffAchievements.filter((a: any) => a.type === typeKey).length
  }
  
  // Get max count for bar graph scaling
  const maxTypeCount = Math.max(
    ...Object.keys(STAFF_ACHIEVEMENT_TYPES).map(key => getTypeCount(key)),
    1
  )
  
  // Get achievements for selected type
  const selectedTypeAchievements = selectedDashboardType 
    ? staffAchievements.filter((a: any) => a.type === selectedDashboardType)
    : []

  return (
    <div className="space-y-6">
      {/* Stats Cards Row - With Real Data */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Staff Portal</h2>
        <p className="text-emerald-100">Welcome, {user.name} • {user.departmentName}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records */}
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden cursor-pointer" onClick={() => setSelectedDashboardType(null)}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">TOTAL RECORDS</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{totalRecords}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
        </Card>

        {/* Pending Approval */}
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">PENDING APPROVAL</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{pendingCount}</p>
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
                <p className="text-3xl font-bold text-gray-800 mt-1">{approvedCount}</p>
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
                <p className="text-3xl font-bold text-gray-800 mt-1">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <CloseIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-gradient-to-r from-red-400 to-red-500" />
        </Card>
      </div>

      {/* Charts Section - Achievement Types Bar Graph & Flow Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievement Types Bar Chart - With Real Data */}
        <Card className="border border-gray-200 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" /> Achievements by Type
              {selectedDashboardType && (
                <span className="text-sm font-normal text-emerald-600 cursor-pointer hover:underline ml-2" onClick={() => setSelectedDashboardType(null)}>
                  (Click to clear filter)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-end justify-between gap-1 px-2 overflow-x-auto">
              {Object.entries(STAFF_ACHIEVEMENT_TYPES).map(([key, type]) => {
                const Icon = type.icon
                const colors = [
                  'from-emerald-500 to-teal-400',
                  'from-yellow-500 to-amber-400', 
                  'from-pink-500 to-rose-400',
                  'from-green-500 to-green-400',
                  'from-blue-500 to-indigo-400',
                  'from-cyan-500 to-blue-400',
                  'from-amber-500 to-orange-400',
                  'from-red-500 to-pink-400'
                ]
                const colorIndex = Object.keys(STAFF_ACHIEVEMENT_TYPES).indexOf(key) % colors.length
                // Use real count for height
                const count = getTypeCount(key)
                const height = maxTypeCount > 0 ? Math.max((count / maxTypeCount) * 100, count > 0 ? 8 : 2) : 2
                const isSelected = selectedDashboardType === key
                return (
                  <div 
                    key={key} 
                    className={`flex-1 min-w-[50px] flex flex-col items-center gap-1.5 ${isSelected ? 'ring-2 ring-emerald-500 rounded-lg' : ''}`}
                  >
                    <div className="w-full flex items-end justify-center h-52">
                      <div 
                        onClick={() => setSelectedDashboardType(isSelected ? null : key)}
                        className={`w-full max-w-[45px] bg-gradient-to-t ${colors[colorIndex]} ${isSelected ? 'ring-2 ring-offset-1 ring-emerald-500' : ''} rounded-t-md hover:opacity-80 transition-all cursor-pointer relative group`}
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {count} {count === 1 ? 'item' : 'items'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <Icon className={`w-4 h-4 ${count > 0 ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span className="text-[9px] text-gray-600 text-center leading-tight line-clamp-2">{type.label.split(' ')[0]}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Flow / Trend Graph */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" /> Submission Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 relative">
              <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="none">
                {[0, 25, 50, 75, 100].map(y => (
                  <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#f0f0f0" strokeWidth="0.5" />
                ))}
                <path
                  d="M0,85 Q30,75 60,60 T120,45 T180,25 L200,20 L200,100 L0,100 Z"
                  fill="url(#staffGradient)"
                  opacity="0.3"
                />
                <path
                  d="M0,85 Q30,75 60,60 T120,45 T180,25 L200,20"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {[[0,85], [60,60], [120,45], [180,25], [200,20]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="3" fill="#10b981" />
                ))}
                <defs>
                  <linearGradient id="staffGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-gray-400 px-1">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-around text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-500">Submissions</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-600">+{totalRecords > 0 ? Math.round((approvedCount / totalRecords) * 100) : 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Type Summary Cards - Clickable with Real Data */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-emerald-500" /> Achievement Overview by Category
            {selectedDashboardType && (
              <span className="text-sm font-normal text-emerald-600 cursor-pointer hover:underline ml-2" onClick={() => setSelectedDashboardType(null)}>
                (Showing: {STAFF_ACHIEVEMENT_TYPES[selectedDashboardType]?.label})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {Object.entries(STAFF_ACHIEVEMENT_TYPES).map(([key, type]) => {
              const Icon = type.icon
              const count = getTypeCount(key)
              const isSelected = selectedDashboardType === key
              return (
                <div 
                  key={key} 
                  onClick={() => setSelectedDashboardType(isSelected ? null : key)}
                  className={`p-3 rounded-xl bg-gradient-to-br ${type.color} hover:shadow-lg transition-all cursor-pointer ${isSelected ? 'ring-4 ring-emerald-400 scale-105' : 'hover:scale-102'}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg font-bold text-white">{count}</p>
                  <p className="text-[10px] text-white/80 leading-tight line-clamp-2">{type.label}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Type Detail View */}
      {selectedDashboardType && (
        <Card className="border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                {(() => {
                  const SelectedIcon = STAFF_ACHIEVEMENT_TYPES[selectedDashboardType]?.icon
                  return SelectedIcon ? <SelectedIcon className="w-5 h-5 text-emerald-600" /> : null
                })()}
                {STAFF_ACHIEVEMENT_TYPES[selectedDashboardType]?.label} - Details
              </CardTitle>
              <button 
                onClick={() => setSelectedDashboardType(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedTypeAchievements.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">
                  Showing <span className="font-semibold text-emerald-600">{selectedTypeAchievements.length}</span> achievement(s) in this category
                </p>
                <div className="grid gap-3 max-h-64 overflow-y-auto">
                  {selectedTypeAchievements.map((achievement: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-emerald-200 transition-colors">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${STAFF_ACHIEVEMENT_TYPES[selectedDashboardType]?.color || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                        {(() => {
                          const TypeIcon = STAFF_ACHIEVEMENT_TYPES[selectedDashboardType]?.icon
                          return TypeIcon ? <TypeIcon className="w-5 h-5 text-white" /> : null
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{achievement.title || 'Untitled'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(achievement.submittedAt || Date.now()).toLocaleDateString()} • 
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ml-1 ${
                            achievement.status?.includes('approved') ? 'bg-green-100 text-green-700' :
                            achievement.status?.includes('pending') ? 'bg-orange-100 text-orange-700' :
                            achievement.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {achievement.status?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No achievements in this category yet</p>
                <p className="text-sm text-gray-400 mt-1">Click "Submit New" to add your first achievement</p>
                <button 
                  onClick={() => setActiveTab('staff_achievement')}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all"
                >
                  Add Achievement
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <ActionCard 
          icon={Plus} 
          title="Submit New Activity" 
          description="Report a new activity or event"
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
          onClick={() => setActiveTab('staff_achievement')}
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
// ============ HOD DEPARTMENT ANALYTICS PAGE WITH CHARTS ============
function HODDepartmentAnalyticsPage({ user }: { user: User }) {
  const [studentAchievements, setStudentAchievements] = useState<any[]>([])
  const [staffAchievements, setStaffAchievements] = useState<any[]>([])
  const [expandedStudentType, setExpandedStudentType] = useState<string | null>(null)
  const [expandedStaffType, setExpandedStaffType] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'students' | 'staff' | 'overview'>('overview')
  const [chartView, setChartView] = useState<'bar' | 'horizontal' | 'donut'>('bar')

  // Load achievements from localStorage on mount
  useEffect(() => {
    try {
      const savedStudent = localStorage.getItem('student_achievements')
      if (savedStudent) {
        const parsed = JSON.parse(savedStudent)
        const deptStudent = parsed.filter((a: any) => a.dept === user.departmentName || a.department === user.departmentName)
        setStudentAchievements(deptStudent)
      }
      
      const savedStaff = localStorage.getItem('staff_achievements')
      if (savedStaff) {
        const parsed = JSON.parse(savedStaff)
        const deptStaff = parsed.filter((a: any) => a.dept === user.departmentName || a.department === user.departmentName)
        setStaffAchievements(deptStaff)
      }
    } catch (e) {
      console.error('Failed to parse achievements:', e)
    }
  }, [user.departmentName])

  // Student achievement counts by type
  const getStudentTypeCount = (typeKey: string) => {
    return studentAchievements.filter(a => a.type === typeKey).length
  }

  // Staff achievement counts by type
  const getStaffTypeCount = (typeKey: string) => {
    return staffAchievements.filter(a => a.type === typeKey).length
  }

  // Get achievements for a specific type
  const getStudentAchievementsByType = (typeKey: string) => {
    return studentAchievements.filter(a => a.type === typeKey)
  }

  const getStaffAchievementsByType = (typeKey: string) => {
    return staffAchievements.filter(a => a.type === typeKey)
  }

  // Calculate totals
  const totalStudentAchievements = studentAchievements.length
  const totalStaffAchievements = staffAchievements.length
  const totalAllAchievements = totalStudentAchievements + totalStaffAchievements

  // Status breakdown
  const studentStatusBreakdown = {
    approved: studentAchievements.filter(a => a.status?.includes('approved')).length,
    pending: studentAchievements.filter(a => a.status?.includes('pending')).length,
    rejected: studentAchievements.filter(a => a.status?.includes('rejected')).length,
  }
  
  const staffStatusBreakdown = {
    approved: staffAchievements.filter(a => a.status?.includes('approved')).length,
    pending: staffAchievements.filter(a => a.status?.includes('pending')).length,
    rejected: staffAchievements.filter(a => a.status?.includes('rejected')).length,
  }

  // Year-wise breakdown for students
  const studentYearBreakdown = ['I Year', 'II Year', 'III Year', 'IV Year'].map(year => ({
    year,
    count: studentAchievements.filter(a => a.data?.year === year || a.year === year).length
  }))

  // Year-wise breakdown for staff
  const staffYearBreakdown = ['2023', '2024', '2025'].map(year => ({
    year,
    count: staffAchievements.filter(a => a.data?.year === year || a.year_pub === year).length
  }))

  // Get max value for chart scaling
  const maxStudentTypeCount = Math.max(...Object.keys(ACHIEVEMENT_TYPES).map(k => getStudentTypeCount(k)), 1)
  const maxStaffTypeCount = Math.max(...Object.keys(STAFF_ACHIEVEMENT_TYPES).map(k => getStaffTypeCount(k)), 1)

  // Chart colors - professional palette
  const chartColors = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
    '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#A855F7', '#22C55E'
  ]

  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">📊 Department Analytics</h2>
            <p className="text-violet-100 text-lg">{user.departmentName} • Achievement Analysis & Reports</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Department-Specific View
            </Badge>
            <Badge className="bg-emerald-400/20 text-white border-emerald-300/30 px-4 py-2 text-sm">
              {totalAllAchievements} Total Records
            </Badge>
          </div>
        </div>
      </div>

      {/* Summary Cards - Enhanced Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all group">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Student Records</p>
                <p className="text-4xl font-bold text-gray-800 mt-1">{totalStudentAchievements}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {Object.keys(ACHIEVEMENT_TYPES).length} types available
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all group">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Staff Records</p>
                <p className="text-4xl font-bold text-gray-800 mt-1">{totalStaffAchievements}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {Object.keys(STAFF_ACHIEVEMENT_TYPES).length} types available
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all group">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending Review</p>
                <p className="text-4xl font-bold text-gray-800 mt-1">{studentStatusBreakdown.pending + staffStatusBreakdown.pending}</p>
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Requires attention
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all group">
          <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Approved</p>
                <p className="text-4xl font-bold text-gray-800 mt-1">{studentStatusBreakdown.approved + staffStatusBreakdown.approved}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified records
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Toggle & Chart View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveSection('overview')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeSection === 'overview'
                ? 'bg-white text-violet-700 shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveSection('students')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeSection === 'students'
                ? 'bg-white text-blue-700 shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Students
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeSection === 'students' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
            }`}>{totalStudentAchievements}</span>
          </button>
          <button
            onClick={() => setActiveSection('staff')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeSection === 'staff'
                ? 'bg-white text-emerald-700 shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Users className="w-4 h-4" />
            Staff
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeSection === 'staff' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
            }`}>{totalStaffAchievements}</span>
          </button>
        </div>

        {(activeSection === 'students' || activeSection === 'staff') && (
          <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
            <button
              onClick={() => setChartView('bar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                chartView === 'bar' ? 'bg-white shadow-md text-violet-700' : 'text-gray-600 hover:bg-white/50'
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartView('horizontal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                chartView === 'horizontal' ? 'bg-white shadow-md text-violet-700' : 'text-gray-600 hover:bg-white/50'
              }`}
              title="Horizontal Bar"
            >
              <BarChart3 className="w-4 h-4 rotate-90" />
            </button>
            <button
              onClick={() => setChartView('donut')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                chartView === 'donut' ? 'bg-white shadow-md text-violet-700' : 'text-gray-600 hover:bg-white/50'
              }`}
              title="Donut Chart"
            >
              <PieChartIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ==================== OVERVIEW SECTION ==================== */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Charts Row 1: Status Distribution Donuts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Status Donut */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" /> Student Achievement Status
                </h3>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-8">
                  {/* Donut Chart CSS */}
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                      {totalStudentAchievements > 0 && (
                        <>
                          <circle 
                            cx="50" cy="50" r="40" fill="none" 
                            stroke="#10B981" strokeWidth="12"
                            strokeDasharray={`${(studentStatusBreakdown.approved / totalStudentAchievements) * 251.2} 251.2`}
                            strokeDashoffset="0"
                            className="transition-all duration-1000 ease-out"
                          />
                          <circle 
                            cx="50" cy="50" r="40" fill="none" 
                            stroke="#F59E0B" strokeWidth="12"
                            strokeDasharray={`${(studentStatusBreakdown.pending / totalStudentAchievements) * 251.2} 251.2`}
                            strokeDashoffset={`${-(studentStatusBreakdown.approved / totalStudentAchievements) * 251.2}`}
                            className="transition-all duration-1000 ease-out"
                          />
                          <circle 
                            cx="50" cy="50" r="40" fill="none" 
                            stroke="#EF4444" strokeWidth="12"
                            strokeDasharray={`${(studentStatusBreakdown.rejected / totalStudentAchievements) * 251.2} 251.2`}
                            strokeDashoffset={`${-((studentStatusBreakdown.approved + studentStatusBreakdown.pending) / totalStudentAchievements) * 251.2}`}
                            className="transition-all duration-1000 ease-out"
                          />
                        </>
                      )}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">{totalStudentAchievements}</p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-600">Approved</span>
                      <span className="ml-auto font-bold text-green-600">{studentStatusBreakdown.approved}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-amber-500" />
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="ml-auto font-bold text-amber-600">{studentStatusBreakdown.pending}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                      <span className="text-sm text-gray-600">Rejected</span>
                      <span className="ml-auto font-bold text-red-600">{studentStatusBreakdown.rejected}</span>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bars */}
                <div className="mt-6 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Approval Rate</span>
                      <span className="font-semibold text-green-600">
                        {totalStudentAchievements > 0 ? Math.round((studentStatusBreakdown.approved / totalStudentAchievements) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${totalStudentAchievements > 0 ? (studentStatusBreakdown.approved / totalStudentAchievements) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staff Status Donut */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5" /> Staff Achievement Status
                </h3>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-8">
                  {/* Donut Chart CSS */}
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                      {totalStaffAchievements > 0 && (
                        <>
                          <circle 
                            cx="50" cy="50" r="40" fill="none" 
                            stroke="#10B981" strokeWidth="12"
                            strokeDasharray={`${(staffStatusBreakdown.approved / totalStaffAchievements) * 251.2} 251.2`}
                            strokeDashoffset="0"
                            className="transition-all duration-1000 ease-out"
                          />
                          <circle 
                            cx="50" cy="50" r="40" fill="none" 
                            stroke="#F59E0B" strokeWidth="12"
                            strokeDasharray={`${(staffStatusBreakdown.pending / totalStaffAchievements) * 251.2} 251.2`}
                            strokeDashoffset={`${-(staffStatusBreakdown.approved / totalStaffAchievements) * 251.2}`}
                            className="transition-all duration-1000 ease-out"
                          />
                          <circle 
                            cx="50" cy="50" r="40" fill="none" 
                            stroke="#EF4444" strokeWidth="12"
                            strokeDasharray={`${(staffStatusBreakdown.rejected / totalStaffAchievements) * 251.2} 251.2`}
                            strokeDashoffset={`${-((staffStatusBreakdown.approved + staffStatusBreakdown.pending) / totalStaffAchievements) * 251.2}`}
                            className="transition-all duration-1000 ease-out"
                          />
                        </>
                      )}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">{totalStaffAchievements}</p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-600">Approved</span>
                      <span className="ml-auto font-bold text-green-600">{staffStatusBreakdown.approved}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-amber-500" />
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="ml-auto font-bold text-amber-600">{staffStatusBreakdown.pending}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                      <span className="text-sm text-gray-600">Rejected</span>
                      <span className="ml-auto font-bold text-red-600">{staffStatusBreakdown.rejected}</span>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bars */}
                <div className="mt-6 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Approval Rate</span>
                      <span className="font-semibold text-green-600">
                        {totalStaffAchievements > 0 ? Math.round((staffStatusBreakdown.approved / totalStaffAchievements) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${totalStaffAchievements > 0 ? (staffStatusBreakdown.approved / totalStaffAchievements) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Combined Bar Chart - Types Comparison */}
          <Card className="border-0 shadow-lg">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Achievement Types Distribution
              </h3>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Student Types Bar Chart */}
                <div>
                  <h4 className="text-sm font-semibold text-blue-600 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Student Achievement Types
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(ACHIEVEMENT_TYPES).slice(0, 7).map(([key, type], idx) => {
                      const count = getStudentTypeCount(key)
                      const percentage = (count / maxStudentTypeCount) * 100
                      return (
                        <div key={key} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600 truncate max-w-[140px]" title={type.label}>{type.label}</span>
                            <span className="text-xs font-bold text-gray-800">{count}</span>
                          </div>
                          <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700 ease-out group-hover:opacity-80"
                              style={{ 
                                width: `${Math.max(percentage, count > 0 ? 15 : 0)}%`,
                                background: `linear-gradient(90deg, ${chartColors[idx % chartColors.length]}99, ${chartColors[idx % chartColors.length]}66)`
                              }}
                            >
                              {count > 0 && percentage > 20 && (
                                <span className="text-[10px] font-bold text-white">{count}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Staff Types Bar Chart */}
                <div>
                  <h4 className="text-sm font-semibold text-emerald-600 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Staff Achievement Types
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(STAFF_ACHIEVEMENT_TYPES).slice(0, 7).map(([key, type], idx) => {
                      const count = getStaffTypeCount(key)
                      const percentage = (count / Math.max(maxStaffTypeCount, 1)) * 100
                      return (
                        <div key={key} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600 truncate max-w-[140px]" title={type.label}>{type.label}</span>
                            <span className="text-xs font-bold text-gray-800">{count}</span>
                          </div>
                          <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700 ease-out group-hover:opacity-80"
                              style={{ 
                                width: `${Math.max(percentage, count > 0 ? 15 : 0)}%`,
                                background: `linear-gradient(90deg, ${chartColors[(idx + 7) % chartColors.length]}99, ${chartColors[(idx + 7) % chartColors.length]}66)`
                              }}
                            >
                              {count > 0 && percentage > 20 && (
                                <span className="text-[10px] font-bold text-white">{count}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Year-wise Analysis */}
          <Card className="border-0 shadow-lg">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Year-wise Distribution
              </h3>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Student Year Chart */}
                <div>
                  <h4 className="text-sm font-semibold text-blue-600 mb-4">Students by Year of Study</h4>
                  <div className="flex items-end justify-around h-48 gap-2">
                    {studentYearBreakdown.map((item, idx) => {
                      const maxYearCount = Math.max(...studentYearBreakdown.map(y => y.count), 1)
                      const height = (item.count / maxYearCount) * 100
                      return (
                        <div key={item.year} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full relative" style={{ height: '160px' }}>
                            <div 
                              className="absolute bottom-0 w-full rounded-t-lg transition-all duration-700 ease-out hover:opacity-80 cursor-pointer"
                              style={{ 
                                height: `${Math.max(height, item.count > 0 ? 8 : 2)}%`,
                                background: `linear-gradient(180deg, ${chartColors[idx]}88, ${chartColors[idx]})`
                              }}
                            >
                              {item.count > 0 && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md font-bold whitespace-nowrap">
                                  {item.count}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-600 text-center">{item.year.replace(' ', '\n')}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Staff Year Chart */}
                <div>
                  <h4 className="text-sm font-semibold text-emerald-600 mb-4">Staff Submissions by Year</h4>
                  <div className="flex items-end justify-around h-48 gap-2">
                    {staffYearBreakdown.map((item, idx) => {
                      const maxYearCount = Math.max(...staffYearBreakdown.map(y => y.count), 1)
                      const height = (item.count / maxYearCount) * 100
                      return (
                        <div key={item.year} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full relative" style={{ height: '160px' }}>
                            <div 
                              className="absolute bottom-0 w-full rounded-t-lg transition-all duration-700 ease-out hover:opacity-80 cursor-pointer"
                              style={{ 
                                height: `${Math.max(height, item.count > 0 ? 8 : 2)}%`,
                                background: `linear-gradient(180deg, ${chartColors[idx + 3]}88, ${chartColors[idx + 3]})`
                              }}
                            >
                              {item.count > 0 && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md font-bold whitespace-nowrap">
                                  {item.count}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-600">{item.year}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ==================== STUDENT ANALYTICS SECTION WITH CHARTS ==================== */}
      {activeSection === 'students' && (
        <div className="space-y-6">
          {/* Status Cards Row */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-green-500" />
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{studentStatusBreakdown.approved}</p>
                  <p className="text-sm text-gray-500">Approved</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-amber-500" />
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{studentStatusBreakdown.pending}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-red-500" />
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{studentStatusBreakdown.rejected}</p>
                  <p className="text-sm text-gray-500">Rejected</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BAR CHART VIEW */}
          {chartView === 'bar' && (
            <Card className="border-0 shadow-lg">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" /> Student Achievements by Type (Vertical Bar)
                </h3>
              </div>
              <CardContent className="p-6">
                <div className="flex items-end justify-around h-72 gap-3">
                  {Object.entries(ACHIEVEMENT_TYPES).slice(0, 10).map(([key, type], idx) => {
                    const count = getStudentTypeCount(key)
                    const height = (count / Math.max(maxStudentTypeCount, 1)) * 100
                    const Icon = type.icon
                    return (
                      <div key={key} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full relative flex items-end justify-center" style={{ height: '220px' }}>
                          <div 
                            className="w-full max-w-[50px] rounded-t-lg transition-all duration-500 ease-out cursor-pointer hover:opacity-80 relative"
                            style={{ 
                              height: `${Math.max(height, count > 0 ? 10 : 4)}%`,
                              background: `linear-gradient(180deg, ${chartColors[idx % chartColors.length]}, ${chartColors[idx % chartColors.length]}aa)`
                            }}
                          >
                            {count > 0 && (
                              <>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  {count}
                                </div>
                                <div className="absolute inset-x-0 -bottom-1 mx-auto w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </>
                            )}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center" title={type.label}>
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-[9px] text-gray-500 text-center leading-tight line-clamp-2">{type.label.split(' ')[0]}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* HORIZONTAL BAR CHART VIEW */}
          {chartView === 'horizontal' && (
            <Card className="border-0 shadow-lg">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 rotate-90" /> Student Achievements by Type (Horizontal)
                </h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {Object.entries(ACHIEVEMENT_TYPES).map(([key, type], idx) => {
                    const count = getStudentTypeCount(key)
                    const percentage = (count / Math.max(maxStudentTypeCount, 1)) * 100
                    const Icon = type.icon
                    return (
                      <div key={key} className="group cursor-pointer" onClick={() => setExpandedStudentType(expandedStudentType === key ? null : key)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${chartColors[idx % chartColors.length]}22` }}>
                            <Icon className="w-4 h-4" style={{ color: chartColors[idx % chartColors.length] }} />
                          </div>
                          <span className="text-sm text-gray-700 w-40 truncate flex-shrink-0">{type.label}</span>
                          <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                            <div 
                              className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-500 group-hover:brightness-110"
                              style={{ 
                                width: `${Math.max(percentage, count > 0 ? 8 : 2)}%`,
                                background: `linear-gradient(90deg, ${chartColors[idx % chartColors.length]}44, ${chartColors[idx % chartColors.length]})`
                              }}
                            >
                              {count > 0 && (
                                <span className="text-sm font-bold text-white drop-shadow-md">{count}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedStudentType === key ? 'rotate-90' : ''}`} />
                        </div>
                        
                        {/* Expanded Content */}
                        {expandedStudentType === key && (
                          <div className="ml-11 mt-2 p-4 bg-gray-50 rounded-lg animate-in slide-in-from-top-2">
                            {getStudentAchievementsByType(key).length > 0 ? (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {getStudentAchievementsByType(key).map((ach, i) => (
                                  <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg text-sm">
                                    <span className="font-medium text-gray-700">{ach.data?.name || ach.studentName}</span>
                                    <Badge variant={ach.status?.includes('approved') ? 'default' : 'secondary'} className={
                                      ach.status?.includes('approved') ? 'bg-green-100 text-green-700' :
                                      ach.status?.includes('pending') ? 'bg-amber-100 text-amber-700' :
                                      'bg-gray-100 text-gray-600'
                                    }>
                                      {ach.status || 'Pending'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 text-center py-4">No submissions yet</p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* DONUT CHART VIEW */}
          {chartView === 'donut' && (
            <Card className="border-0 shadow-lg">
              <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" /> Student Achievement Distribution (Donut)
                </h3>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Donut SVG */}
                  <div className="relative w-64 h-64 mx-auto">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      {(() => {
                        let cumulativeOffset = 0
                        const total = totalStudentAchievements || 1
                        return Object.entries(ACHIEVEMENT_TYPES).map(([key, type], idx) => {
                          const count = getStudentTypeCount(key)
                          if (count === 0) return null
                          const percentage = count / total
                          const dashArray = `${percentage * 251.2} 251.2`
                          const dashOffset = -cumulativeOffset * 251.2
                          cumulativeOffset += percentage
                          
                          return (
                            <circle
                              key={key}
                              cx="50" cy="50" r="40"
                              fill="none"
                              stroke={chartColors[idx % chartColors.length]}
                              strokeWidth="20"
                              strokeDasharray={dashArray}
                              strokeDashoffset={dashOffset}
                              className="transition-all duration-1000 ease-out cursor-pointer hover:stroke-width-[25]"
                            />
                          )
                        })
                      })()}
                      {/* Background circle for empty state */}
                      {totalStudentAchievements === 0 && (
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="20" />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">{totalStudentAchievements}</p>
                        <p className="text-sm text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(ACHIEVEMENT_TYPES).map(([key, type], idx) => {
                      const count = getStudentTypeCount(key)
                      if (count === 0) return null
                      return (
                        <div 
                          key={key} 
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setExpandedStudentType(expandedStudentType === key ? null : key)}
                        >
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: chartColors[idx % chartColors.length] }} />
                          <span className="text-sm text-gray-700 flex-1 truncate">{type.label}</span>
                          <span className="text-sm font-bold text-gray-800">{count}</span>
                        </div>
                      )
                    })}
                    {totalStudentAchievements === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No data to display</p>
                    )}
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedStudentType && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      {ACHIEVEMENT_TYPES[expandedStudentType as keyof typeof ACHIEVEMENT_TYPES]?.label} - Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {getStudentAchievementsByType(expandedStudentType).map((ach, i) => (
                        <div key={i} className="p-3 bg-white rounded-lg text-sm">
                          <p className="font-medium text-gray-800">{ach.data?.name || ach.studentName}</p>
                          <p className="text-xs text-gray-500">Reg: {ach.data?.reg || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ==================== STAFF ANALYTICS SECTION WITH CHARTS ==================== */}
      {activeSection === 'staff' && (
        <div className="space-y-6">
          {/* Status Cards Row */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-green-500" />
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{staffStatusBreakdown.approved}</p>
                  <p className="text-sm text-gray-500">Approved</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-amber-500" />
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{staffStatusBreakdown.pending}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-red-500" />
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{staffStatusBreakdown.rejected}</p>
                  <p className="text-sm text-gray-500">Rejected</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BAR CHART VIEW */}
          {chartView === 'bar' && (
            <Card className="border-0 shadow-lg">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" /> Staff Achievements by Type (Vertical Bar)
                </h3>
              </div>
              <CardContent className="p-6">
                <div className="flex items-end justify-around h-72 gap-3">
                  {Object.entries(STAFF_ACHIEVEMENT_TYPES).slice(0, 10).map(([key, type], idx) => {
                    const count = getStaffTypeCount(key)
                    const height = (count / Math.max(maxStaffTypeCount, 1)) * 100
                    const Icon = type.icon
                    return (
                      <div key={key} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full relative flex items-end justify-center" style={{ height: '220px' }}>
                          <div 
                            className="w-full max-w-[50px] rounded-t-lg transition-all duration-500 ease-out cursor-pointer hover:opacity-80 relative"
                            style={{ 
                              height: `${Math.max(height, count > 0 ? 10 : 4)}%`,
                              background: `linear-gradient(180deg, ${chartColors[(idx + 3) % chartColors.length]}, ${chartColors[(idx + 3) % chartColors.length]}aa)`
                            }}
                          >
                            {count > 0 && (
                              <>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  {count}
                                </div>
                                <div className="absolute inset-x-0 -bottom-1 mx-auto w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </>
                            )}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center" title={type.label}>
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-[9px] text-gray-500 text-center leading-tight line-clamp-2">{type.label.split(' ')[0]}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* HORIZONTAL BAR CHART VIEW */}
          {chartView === 'horizontal' && (
            <Card className="border-0 shadow-lg">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 rotate-90" /> Staff Achievements by Type (Horizontal)
                </h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {Object.entries(STAFF_ACHIEVEMENT_TYPES).map(([key, type], idx) => {
                    const count = getStaffTypeCount(key)
                    const percentage = (count / Math.max(maxStaffTypeCount, 1)) * 100
                    const Icon = type.icon
                    return (
                      <div key={key} className="group cursor-pointer" onClick={() => setExpandedStaffType(expandedStaffType === key ? null : key)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${chartColors[(idx + 3) % chartColors.length]}22` }}>
                            <Icon className="w-4 h-4" style={{ color: chartColors[(idx + 3) % chartColors.length] }} />
                          </div>
                          <span className="text-sm text-gray-700 w-40 truncate flex-shrink-0">{type.label}</span>
                          <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                            <div 
                              className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-500 group-hover:brightness-110"
                              style={{ 
                                width: `${Math.max(percentage, count > 0 ? 8 : 2)}%`,
                                background: `linear-gradient(90deg, ${chartColors[(idx + 3) % chartColors.length]}44, ${chartColors[(idx + 3) % chartColors.length]})`
                              }}
                            >
                              {count > 0 && (
                                <span className="text-sm font-bold text-white drop-shadow-md">{count}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedStaffType === key ? 'rotate-90' : ''}`} />
                        </div>
                        
                        {/* Expanded Content */}
                        {expandedStaffType === key && (
                          <div className="ml-11 mt-2 p-4 bg-gray-50 rounded-lg animate-in slide-in-from-top-2">
                            {getStaffAchievementsByType(key).length > 0 ? (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {getStaffAchievementsByType(key).map((ach, i) => (
                                  <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg text-sm">
                                    <span className="font-medium text-gray-700">{ach.data?.faculty_name || ach.submittedBy}</span>
                                    <Badge variant={ach.status?.includes('approved') ? 'default' : 'secondary'} className={
                                      ach.status?.includes('approved') ? 'bg-green-100 text-green-700' :
                                      ach.status?.includes('pending') ? 'bg-amber-100 text-amber-700' :
                                      'bg-gray-100 text-gray-600'
                                    }>
                                      {ach.status || 'Pending'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 text-center py-4">No submissions yet</p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* DONUT CHART VIEW */}
          {chartView === 'donut' && (
            <Card className="border-0 shadow-lg">
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" /> Staff Achievement Distribution (Donut)
                </h3>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Donut SVG */}
                  <div className="relative w-64 h-64 mx-auto">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      {(() => {
                        let cumulativeOffset = 0
                        const total = totalStaffAchievements || 1
                        return Object.entries(STAFF_ACHIEVEMENT_TYPES).map(([key, type], idx) => {
                          const count = getStaffTypeCount(key)
                          if (count === 0) return null
                          const percentage = count / total
                          const dashArray = `${percentage * 251.2} 251.2`
                          const dashOffset = -cumulativeOffset * 251.2
                          cumulativeOffset += percentage
                          
                          return (
                            <circle
                              key={key}
                              cx="50" cy="50" r="40"
                              fill="none"
                              stroke={chartColors[(idx + 3) % chartColors.length]}
                              strokeWidth="20"
                              strokeDasharray={dashArray}
                              strokeDashoffset={dashOffset}
                              className="transition-all duration-1000 ease-out cursor-pointer hover:stroke-width-[25]"
                            />
                          )
                        })
                      })()}
                      {totalStaffAchievements === 0 && (
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="20" />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">{totalStaffAchievements}</p>
                        <p className="text-sm text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(STAFF_ACHIEVEMENT_TYPES).map(([key, type], idx) => {
                      const count = getStaffTypeCount(key)
                      if (count === 0) return null
                      return (
                        <div 
                          key={key} 
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setExpandedStaffType(expandedStaffType === key ? null : key)}
                        >
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: chartColors[(idx + 3) % chartColors.length] }} />
                          <span className="text-sm text-gray-700 flex-1 truncate">{type.label}</span>
                          <span className="text-sm font-bold text-gray-800">{count}</span>
                        </div>
                      )
                    })}
                    {totalStaffAchievements === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No data to display</p>
                    )}
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedStaffType && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      {STAFF_ACHIEVEMENT_TYPES[expandedStaffType as keyof typeof STAFF_ACHIEVEMENT_TYPES]?.label} - Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {getStaffAchievementsByType(expandedStaffType).map((ach, i) => (
                        <div key={i} className="p-3 bg-white rounded-lg text-sm">
                          <p className="font-medium text-gray-800">{ach.data?.faculty_name || ach.submittedBy}</p>
                          <p className="text-xs text-gray-500">{ach.data?.designation || 'Faculty'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
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

// ============ ROLE-BASED SIDEBAR CONFIG ============
interface MenuItem {
  id: TabType;
  icon: React.ElementType;
  label: string;
  badge?: string;
  description?: string;
}

// Role-specific configurations
const ROLE_SIDEBAR_CONFIG = {
  STUDENT: {
    brandColor: 'from-emerald-500 via-teal-500 to-cyan-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    accentColor: 'emerald',
    roleLabel: 'Student Portal',
    roleIcon: GraduationCap,
    menuItems: [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'achievements', icon: Trophy, label: 'My Achievements', badge: 'New' },
      { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
    ] as MenuItem[],
  },
  STAFF: {
    brandColor: 'from-blue-500 via-indigo-500 to-violet-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    accentColor: 'blue',
    roleLabel: 'Staff Portal',
    roleIcon: BookOpen,
    menuItems: [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Overview & Stats' },
      { id: 'staff_achievement', icon: Award, label: 'Staff Achievements', badge: 'New', description: 'Your achievements' },
      { id: 'student_achievement_view', icon: GraduationCap, label: 'Student Achievements', badge: 'View', description: 'View student data' },
      { id: 'feedback', icon: MessageSquare, label: 'Feedback', description: 'Send feedback' },
    ] as MenuItem[],
  },
  HOD: {
    brandColor: 'from-purple-500 via-fuchsia-500 to-pink-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    accentColor: 'purple',
    roleLabel: 'HOD Portal',
    roleIcon: UserCheck,
    menuItems: [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Department Overview' },
      { id: 'hod_student_approval', icon: GraduationCap, label: 'Student Approvals', badge: 'Pending', description: 'Review student submissions' },
      { id: 'hod_staff_approval', icon: BookOpen, label: 'Staff Approvals', badge: 'Pending', description: 'Review staff submissions' },
      { id: 'my_achievement', icon: Trophy, label: 'My Achievements', description: 'Personal achievements' },
      { id: 'analytics', icon: BarChart3, label: 'Department Analytics', description: 'Stats & Reports' },
      { id: 'settings', icon: Settings, label: 'Settings', description: 'Preferences' },
    ] as MenuItem[],
  },
  ADMIN: {
    brandColor: 'from-amber-500 via-orange-500 to-red-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    accentColor: 'amber',
    roleLabel: 'Admin Portal',
    roleIcon: Shield,
    menuItems: [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'System Overview' },
      { id: 'departments', icon: Building2, label: 'Departments', description: 'Manage departments' },
      { id: 'faculty', icon: Users, label: 'Faculty', description: 'Faculty management' },
      { id: 'students', icon: GraduationCap, label: 'Students', description: 'Student records' },
      { id: 'activities', icon: Activity, label: 'Activities', description: 'Events & Programs' },
      { id: 'research', icon: Award, label: 'Research', description: 'Research papers' },
      { id: 'achievements', icon: Trophy, label: 'Achievements', badge: 'All', description: 'All achievements' },
      { id: 'approvals', icon: CheckCircle, label: 'Approvals', badge: '12', description: 'Pending approvals' },
      { id: 'analytics', icon: BarChart3, label: 'Analytics', description: 'Reports & Insights' },
      { id: 'documents', icon: FolderOpen, label: 'Documents', description: 'File management' },
      { id: 'feedback', icon: MessageSquare, label: 'Feedback', description: 'User feedback' },
      { id: 'settings', icon: Settings, label: 'Settings', description: 'System settings' },
    ] as MenuItem[],
  }
}

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
  const roleConfig = ROLE_SIDEBAR_CONFIG[user.role as keyof typeof ROLE_SIDEBAR_CONFIG] || ROLE_SIDEBAR_CONFIG.STUDENT
  const menuItems = roleConfig.menuItems
  const RoleIcon = roleConfig.roleIcon

  // Mobile: sidebar is overlay (hidden or shown), Desktop: sidebar always visible but collapses to icons
  return (
    <>
      {/* Mobile Overlay Backdrop - only show when open on mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      <aside className={`${
        // Mobile behavior:
        // - open: full width overlay (w-72), visible
        // - closed: hidden off-screen (-translate-x-full)
        //
        // Desktop behavior (lg+):
        // - open: expanded (w-72) with labels
        // - closed: icon-only mode (w-20), always visible
        open 
          ? 'w-72 max-lg:w-72 translate-x-0' 
          : 'max-lg:-translate-x-full max-lg:w-72 lg:w-20 lg:translate-x-0'
      } bg-white/95 backdrop-blur-xl border-r border-gray-200 flex flex-col z-50 transition-all duration-300 fixed inset-y-0 left-0 shadow-2xl sidebar-shadow`}>
    
    {/* ====== ROLE-BASED HEADER ====== */}
    <div className={`p-4 border-b border-gray-100 bg-gradient-to-r ${roleConfig.brandColor} bg-opacity-5 relative ${!open ? 'flex items-center justify-center' : ''}`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-colors z-10 ${!open ? 'top-1/2 -translate-y-1/2 right-1/2 translate-x-1/2' : ''}`}
        title={open ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {open ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      
      {open ? (
        <div className="flex items-center gap-3 pr-8">
          {/* Role-Specific Logo */}
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${roleConfig.brandColor} flex items-center justify-center shadow-lg logo-glow relative overflow-hidden`}>
            <RoleIcon className="w-6 h-6 text-white" />
            <div className="absolute inset-0 bg-white/20 rounded-xl" />
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm block truncate">NIET IQAC</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${roleConfig.bgColor} ${roleConfig.textColor}`}>
                {user.role}
              </span>
            </div>
            <span className={`text-xs ${roleConfig.textColor} font-medium flex items-center gap-1 mt-0.5`}>
              <RoleIcon className="w-3 h-3" />
              {roleConfig.roleLabel}
            </span>
          </div>
        </div>
      ) : (
        /* Icon only mode - just show small logo */
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleConfig.brandColor} flex items-center justify-center shadow-lg`}>
          <RoleIcon className="w-5 h-5 text-white" />
        </div>
      )}
      
      {/* User Info - only in expanded mode */}
      {open && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${roleConfig.bgColor} flex items-center justify-center`}>
              <span className={`text-sm font-bold ${roleConfig.textColor}`}>{user.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user.departmentName || 'Department'}</p>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* ====== MENU SECTION LABEL - Only show when open ====== */}
    {open && (
      <div className="px-4 pt-4 pb-2">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Main Menu</span>
      </div>
    )}

    {/* ====== MENU ITEMS ====== */}
    <nav className={`flex-1 ${open ? 'p-3' : 'p-2'} space-y-1 overflow-y-auto custom-scrollbar`}>
      {menuItems.map((item, index) => {
        const Icon = item.icon
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={(e) => {
              e.stopPropagation()
              setActiveTab(item.id)
            }}
            className={`w-full flex items-center ${open ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
              isActive 
                ? `${roleConfig.bgColor} ${roleConfig.textColor} shadow-sm border border-${roleConfig.accentColor}-200`
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            title={!open ? item.label : undefined}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* Icon Container */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              isActive 
                ? `bg-gradient-to-br ${roleConfig.brandColor} shadow-md`
                : 'bg-gray-100 group-hover:bg-gray-200'
            }`}>
              <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
            </div>
            
            {/* Label & Badge - Only show when open */}
            {open && (
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`truncate ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                  {item.badge && (
                    <span className={`ml-auto px-2 py-0.5 text-[10px] rounded-full font-bold shrink-0 ${
                      isActive ? `bg-white/30 text-current` : 'bg-red-50 text-red-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                {!isActive && item.description && (
                  <span className="text-[10px] text-gray-400 truncate block mt-0.5">{item.description}</span>
                )}
              </div>
            )}
            
            {/* Active Left Border */}
            {isActive && open && (
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b ${roleConfig.brandColor}`} />
            )}
            
            {/* Active indicator dot for collapsed mode */}
            {isActive && !open && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            )}
          </button>
        )
      })}
    </nav>

    {/* ====== BOTTOM SECTION - Only show when open ====== */}
    {open && (
      <div className="p-3 border-t border-gray-100 space-y-2">
        {/* Quick Stats Card */}
        <div className={`p-3 rounded-xl bg-gradient-to-br ${roleConfig.brandColor} bg-opacity-5 border border-${roleConfig.accentColor}-100`}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className={`w-4 h-4 ${roleConfig.textColor}`} />
            <span className={`text-xs font-bold ${roleConfig.textColor}`}>Quick Info</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-white/60 rounded-lg">
              <span className="text-lg font-bold text-gray-900">{user.role === 'ADMIN' ? '20' : user.role === 'HOD' ? '1' : 'CSE'}</span>
              <p className="text-[9px] text-gray-500">{user.role === 'ADMIN' ? 'Depts' : user.role === 'HOD' ? 'Dept' : 'Code'}</p>
            </div>
            <div className="text-center p-2 bg-white/60 rounded-lg">
              <span className="text-lg font-bold text-gray-900">{user.role === 'STUDENT' ? '13' : user.role === 'STAFF' ? '13' : user.role === 'HOD' ? '50+' : '150+'}</span>
              <p className="text-[9px] text-gray-500">{user.role === 'ADMIN' ? 'Users' : user.role === 'HOD' ? 'Faculty' : 'Types'}</p>
            </div>
          </div>
        </div>
      </div>
    )}
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
  
  // Drag and Drop State - Achievement Cards Reordering
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
  // Drag and Drop State - Achievement Types Order (for reordering type cards)
  const [achievementTypesOrder, setAchievementTypesOrder] = useState<string[]>(Object.keys(ACHIEVEMENT_TYPES))
  const [draggedTypeIndex, setDraggedTypeIndex] = useState<number | null>(null)
  const [dragOverTypeIndex, setDragOverTypeIndex] = useState<number | null>(null)
  
  // File Upload with Drag & Drop
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  // Load achievements from localStorage on mount (filtered for current student)
  useEffect(() => {
    const saved = localStorage.getItem('student_achievements')
    if (saved) {
      try {
        const allAchievements = JSON.parse(saved)
        // Only load current student's own records
        const myAchievements = allAchievements.filter((a: any) => 
          a.studentId === user.id || a.studentEmail === user.email || a.studentName === user.name
        )
        setAchievements(myAchievements)
      } catch (e) {
        console.error('Failed to parse achievements:', e)
      }
    }
  }, [user.id, user.email, user.name])

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
      title: formData.title || formData.award_name || formData.prog_name || formData.course || formData.event_name || formData.paper_title || formData.invention_title || 'Untitled',
      dept: user.departmentName,
      studentName: user.name,
      studentEmail: user.email,
      studentId: user.id,
      date: new Date().toISOString().split('T')[0],
      status: 'pending_staff',  // First goes to same-department Staff/Faculty for review
      submittedAt: new Date().toISOString(),
      data: formData,
      // Routing info - will be reviewed by same dept faculty then HOD
      reviewRoute: {
        current: 'staff',
        next: 'hod',
        department: user.departmentName
      }
    }
    
    setAchievements(prev => {
      const updatedAchievements = [newAchievement, ...prev]
      // Save to localStorage for dashboard to read
      localStorage.setItem('student_achievements', JSON.stringify(updatedAchievements))
      return updatedAchievements
    })
    
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

  // ============ DRAG AND DROP HANDLERS FOR REORDERING ============
  const handleDragStart = (index: number) => {
    setDraggedItem(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (dropIndex: number) => {
    if (draggedItem === null || draggedItem === dropIndex) return
    
    const newAchievements = [...filteredAchievements]
    const draggedAchievement = newAchievements[draggedItem]
    newAchievements.splice(draggedItem, 1)
    newAchievements.splice(dropIndex, 0, draggedAchievement)
    
    // Update the original achievements array with new order
    const achievementIds = newAchievements.map(a => a.id)
    const reorderedAchievements = achievementIds.map(id => 
      achievements.find(a => a.id === id)
    ).filter(Boolean)
    
    setAchievements(reorderedAchievements)
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  // ============ FILE UPLOAD WITH DRAG & DROP ============
  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // ============ DRAG AND DROP HANDLERS FOR ACHIEVEMENT TYPE CARDS ============
  const handleTypeDragStart = (index: number) => {
    setDraggedTypeIndex(index)
  }

  const handleTypeDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverTypeIndex(index)
  }

  const handleTypeDrop = (dropIndex: number) => {
    if (draggedTypeIndex === null || draggedTypeIndex === dropIndex) return
    
    const newOrder = [...achievementTypesOrder]
    const draggedType = newOrder[draggedTypeIndex]
    newOrder.splice(draggedTypeIndex, 1)
    newOrder.splice(dropIndex, 0, draggedType)
    
    setAchievementTypesOrder(newOrder)
    setDraggedTypeIndex(null)
    setDragOverTypeIndex(null)
  }

  const handleTypeDragEnd = () => {
    setDraggedTypeIndex(null)
    setDragOverTypeIndex(null)
  }

  // Allow dropping on the container for reordering
  const handleTypeContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const currentTypeConfig = selectedType ? ACHIEVEMENT_TYPES[selectedType] : null

  // Filter achievements
  const filteredAchievements = achievements.filter(a => {
    // IMPORTANT: Only show current student's own records
    const isOwnRecord = a.studentId === user.id || a.studentEmail === user.email || a.studentName === user.name
    if (!isOwnRecord) return false
    
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.typeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || a.type === filterType
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Back to Types Button - Above Add Achievement (shown when type is selected) */}
      {selectedType && (
        <button
          onClick={() => { setSelectedType(''); setFormData({}); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Types
        </button>
      )}

      {/* Add Student Achievement Card */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-500" /> Add Student Achievement
          </h3>
          
          {/* Type Selector - DRAGGABLE CARDS */}
          <div className="space-y-4">
            {!selectedType ? (
              /* Draggable Achievement Type Cards Grid */
              <div
                onDragOver={handleTypeContainerDragOver}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {achievementTypesOrder.map((typeKey, index) => {
                  const typeConfig = ACHIEVEMENT_TYPES[typeKey]
                  if (!typeConfig) return null
                  
                  const Icon = typeConfig.icon
                  const isSelected = selectedType === typeKey
                  const isDragging = draggedTypeIndex === index
                  const isDragOver = dragOverTypeIndex === index
                  
                  return (
                    <div
                      key={typeKey}
                      draggable
                      onDragStart={() => handleTypeDragStart(index)}
                      onDragOver={(e) => handleTypeDragOver(e, index)}
                      onDrop={() => handleTypeDrop(index)}
                      onDragEnd={handleTypeDragEnd}
                      onClick={() => setSelectedType(typeKey)}
                      className={`relative p-4 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all duration-200 group ${
                        isDragging 
                          ? 'opacity-40 scale-95 rotate-2 shadow-lg z-10' 
                          : isDragOver 
                            ? 'border-cyan-400 bg-cyan-50 scale-[1.02] shadow-md border-dashed' 
                            : 'border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/50 hover:shadow-md'
                      }`}
                    >
                      {/* Drag Handle Indicator */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      {/* Type Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeConfig.color} flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${isDragging ? 'scale-90' : ''}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Type Label */}
                      <span className="text-sm font-semibold text-gray-800 block">{typeConfig.label}</span>
                      
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      {/* Drag Overlay for visual feedback */}
                      {isDragOver && !isDragging && (
                        <div className="absolute inset-0 border-2 border-cyan-400 border-dashed rounded-xl pointer-events-none" />
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Dynamic Form Fields - Selected Type */
              <div className="space-y-4 border-t pt-4">
                {/* Selected Type Header with Back Button */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentTypeConfig?.color} flex items-center justify-center`}>
                      {(() => {
                        const Icon = currentTypeConfig?.icon
                        return Icon ? <Icon className="w-5 h-5 text-white" /> : null
                      })()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{currentTypeConfig?.label}</h4>
                      <p className="text-xs text-gray-500">{currentTypeConfig?.fields.length} fields to complete</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentTypeConfig?.fields.filter(field => field.type !== 'textarea').map((field) => (
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

                      {field.type === 'constant' && field.value && (
                        <div className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {field.value}
                        </div>
                      )}

                      {field.type === 'select_with_other' && (
                        <div className="space-y-2">
                          <select
                            value={formData[field.id] || ''}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 bg-white"
                          >
                            <option value="">Select {field.label}</option>
                            {field.options?.map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                            <option value="Other">Other</option>
                          </select>
                          {formData[field.id] === 'Other' && (
                            <input
                              type="text"
                              value={formData[`${field.id}_other`] || ''}
                              onChange={(e) => handleFieldChange(`${field.id}_other`, e.target.value)}
                              placeholder="Please specify..."
                              className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 bg-cyan-50"
                            />
                          )}
                        </div>
                      )}

                      {field.type === 'publisher_select' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {field.options?.map((opt: string) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  handleFieldChange(field.id, opt)
                                  if (opt !== 'Other') {
                                    handleFieldChange(`${field.id}_other`, '')
                                  }
                                }}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  formData[field.id] === opt
                                    ? 'bg-cyan-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                } ${opt === 'Other' && formData[field.id] === 'Other' ? 'col-span-2' : ''}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          {formData[field.id] === 'Other' && (
                            <input
                              type="text"
                              value={formData[`${field.id}_other`] || ''}
                              onChange={(e) => handleFieldChange(`${field.id}_other`, e.target.value)}
                              placeholder="Enter publisher name..."
                              className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 bg-cyan-50"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* File Upload with Drag & Drop - Above Submit Button */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-cyan-500" /> Attachments
                  </h4>
                  
                  {/* Drop Zone */}
                  <div
                    onDragOver={handleFileDragOver}
                    onDragLeave={handleFileDragLeave}
                    onDrop={handleFileDrop}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      isDragOver 
                        ? 'border-cyan-400 bg-cyan-50 scale-[1.02]' 
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    {isDragOver ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-full bg-cyan-100 flex items-center justify-center animate-bounce">
                          <Upload className="w-6 h-6 text-cyan-500" />
                        </div>
                        <p className="text-sm font-semibold text-cyan-600">Drop files here!</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600 font-medium">
                          Drag & drop or <span className="text-cyan-600 underline">browse</span>
                        </p>
                        <p className="text-xs text-gray-400">PDF, Images, Docs (Max 10MB)</p>
                      </div>
                    )}
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div 
                          key={`${file.name}-${index}`}
                          className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg group hover:border-cyan-300 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                          <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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

      {/* My Achievements - Drag & Drop Cards */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          {/* Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-cyan-500" /> My Achievements
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

          {/* Drag and Drop Achievement Cards */}
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No achievements yet</p>
              <p className="text-sm mt-1">Submit your first achievement above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAchievements.map((achievement, index) => (
                <div
                  key={achievement.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing ${
                    draggedItem === index 
                      ? 'opacity-50 scale-95 border-cyan-300 bg-cyan-50 shadow-lg' 
                      : dragOverIndex === index 
                        ? 'border-cyan-400 bg-cyan-50 border-dashed' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {/* Drag Handle */}
                  <div className="text-gray-400 hover:text-gray-600 touch-none">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  {/* Index Badge */}
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  
                  {/* Achievement Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-medium text-xs">{achievement.typeName}</Badge>
                      <span className="text-sm font-medium text-gray-800 truncate">{achievement.title}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{achievement.dept}</span>
                      <span>•</span>
                      <span>{achievement.date}</span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
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
                  
                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-amber-600 transition-colors" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
  },
  // Resource Person Engagement
  resource_person: {
    label: 'Resource Person Engagement',
    icon: Presentation,
    color: 'from-violet-500 to-purple-600',
    category: 'achievement',
    headerTitle: 'Add Resource Person Record',
    headerIcon: PlusCircle,
    fields: [
      { id: 'faculty_name', label: 'FACULTY NAME', type: 'text', required: true, full: false },
      { id: 'dept', label: 'DEPT', type: 'dept_select', required: true, full: false },
      { id: 'designation', label: 'DESIGNATION', type: 'text', required: false, full: false },
      { id: 'event_title', label: 'EVENT / SESSION TITLE', type: 'text', required: true, full: true },
      { id: 'organizing_institute', label: 'ORGANIZING INSTITUTE', type: 'text', required: false, full: false },
      { id: 'event_type', label: 'EVENT TYPE', type: 'select', options: ['Workshop', 'Seminar', 'FDP', 'STTP', 'Guest Lecture', 'Webinar', 'Conference', 'Hackathon', 'Other'], full: false },
      { id: 'topic', label: 'TOPIC / AREA OF EXPERTISE', type: 'text', required: true, full: true },
      { id: 'session_type', label: 'SESSION TYPE', type: 'select', options: ['Keynote Address', 'Technical Session', 'Panel Discussion', 'Hands-on Session', 'Invited Talk', 'Tutorial', 'Other'], full: false },
      { id: 'from_date', label: 'FROM DATE', type: 'date', required: false, full: false },
      { id: 'to_date', label: 'TO DATE', type: 'date', required: false, full: false },
      { id: 'mode', label: 'MODE', type: 'select', options: ['Online', 'Offline', 'Hybrid'], full: false },
      { id: 'no_of_participants', label: 'NO. OF PARTICIPANTS', type: 'number', required: false, full: false },
      { id: 'duration_hours', label: 'DURATION (HOURS)', type: 'number', required: false, full: false },
      { id: 'certificate_link', label: 'CERTIFICATE / INVITATION LINK', type: 'url', required: false, placeholder: 'https://...', full: true },
      { id: 'description', label: 'DESCRIPTION / REMARKS', type: 'textarea', required: false, full: true }
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
  
  // Search and expand states for Total Achievements section
  const [searchAchievement, setSearchAchievement] = useState('')
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set())

  // Toggle expand/collapse for achievement type
  const toggleAchievementType = (typeKey: string) => {
    setExpandedTypes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(typeKey)) {
        newSet.delete(typeKey)
      } else {
        newSet.add(typeKey)
      }
      return newSet
    })
  }

  // Load saved achievements from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('staff_achievements')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Only load entries for current user
        const myEntries = parsed.filter((a: any) => 
          a.submittedBy === user.name || a.dept === user.departmentName
        )
        setSubmittedEntries(myEntries)
      }
    } catch (e) {
      console.error('Failed to parse achievements:', e)
    }
  }, [user.name, user.departmentName])

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
    
    setSubmittedEntries(prev => {
      const updatedEntries = [newEntry, ...prev]
      // Save to localStorage for dashboard to read
      localStorage.setItem('staff_achievements', JSON.stringify(updatedEntries))
      return updatedEntries
    })
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

      {/* Total Achievements Summary - White Background with Search */}
      <Card className="mt-8 border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Total Achievements</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">{submittedEntries.length} record(s) submitted</p>
              </div>
            </div>
            
            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search achievements..."
                onChange={(e) => setSearchAchievement(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {(() => {
            // Filter entries based on search term
            const filteredTypes = Object.entries(STAFF_ACHIEVEMENT_TYPES).filter(([key, typeConfig]) => {
              if (!searchAchievement.trim()) return true
              const searchTermLower = searchAchievement.toLowerCase()
              return (
                typeConfig.label.toLowerCase().includes(searchTermLower) ||
                key.toLowerCase().includes(searchTermLower)
              )
            })

            if (submittedEntries.length === 0) {
              return (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <ClipboardList className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No achievements submitted yet</p>
                  <p className="text-sm text-gray-400 mt-1">Submit your first achievement to see it here</p>
                </div>
              )
            }

            return (
              <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                {filteredTypes.map(([key, typeConfig]) => {
                  const count = submittedEntries.filter(e => e.type === key).length
                  const Icon = typeConfig.icon
                  
                  // Get entries for this type
                  const typeEntries = submittedEntries.filter(e => e.type === key)
                  
                  return (
                    <div 
                      key={key} 
                      className={`border rounded-lg transition-all hover:shadow-md ${
                        count > 0 ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'
                      }`}
                    >
                      {/* Type Header Row */}
                      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => toggleAchievementType(key)}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${typeConfig.color} flex items-center justify-center shadow-sm`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{typeConfig.label}</p>
                            <p className="text-xs text-gray-500">{typeConfig.category === 'achievement' ? 'Achievement' : 'Research & Publication'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            count > 0 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {count}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedTypes.has(key) ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Expandable Entry List */}
                      {expandedTypes.has(key) && count > 0 && (
                        <div className="border-t border-gray-100 bg-gray-50/50">
                          {typeEntries.map((entry, idx) => (
                            <div key={entry.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-100/50 transition-colors">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-700 truncate">{entry.title}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(entry.submittedAt).toLocaleDateString('en-IN', { 
                                      day: 'numeric', 
                                      month: 'short', 
                                      year: 'numeric' 
                                    })}
                                  </p>
                                </div>
                              </div>
                              <Badge className={
                                entry.status === 'pending_staff' ? 'bg-amber-100 text-amber-700 border-amber-200 ml-3' :
                                entry.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200 ml-3' :
                                'bg-gray-100 text-gray-600 border-gray-200 ml-3'
                              } flex-shrink-0>
                                {entry.status === 'pending_staff' ? 'Pending' : entry.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                {filteredTypes.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No results found for "{searchAchievement}"</p>
                  </div>
                )}
              </div>
            )
          })()}
        </CardContent>
      </Card>
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
  const [sidebarOpen, setSidebarOpen] = useState(true) // Sidebar open by default

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
      case 'analytics': return user?.role === 'HOD' ? <HODDepartmentAnalyticsPage user={user} /> : <AnalyticsPage />
      case 'documents': return <DocumentsPage />
      case 'settings': return <SettingsPage user={user} />
      case 'achievements': return user?.role === 'STUDENT' 
        ? <StudentAchievementsPage user={user} />
        : <AchievementForm user={user} onBack={() => setActiveTab('dashboard')} />
      case 'staff_achievement': return <StaffAchievementPage user={user} />
      case 'student_achievement_view': return user?.role === 'STUDENT' 
        ? <StudentAchievementsPage user={user} />
        : <StudentAchievementViewPage user={user} />
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
      
      {/* Main Content Area - responsive margins based on screen size and sidebar state */}
      <div className={`flex-1 flex flex-col min-h-screen main-content-wrapper transition-all duration-300 ${
        // Mobile: no margin (sidebar is overlay), Desktop: margin based on sidebar state
        sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
      }`}>
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-30 header-shadow">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            {/* Sidebar Toggle Button - Top Left with Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#0a2a5e] to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105"
                title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
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
          width: 100%;
        }
        
        .dark-theme .main-content-wrapper {
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 1024px) {
          /* On mobile/tablet, main content takes full width (no margin for overlay sidebar) */
          .main-content-wrapper {
            margin-left: 0 !important;
          }
          
          /* Ensure content doesn't overflow */
          .content-area {
            padding: 16px;
          }
          
          /* Grid adjustments for mobile */
          .grid-cols-3, .grid-cols-4 {
            grid-template-columns: 1fr;
          }
          
          /* Cards full width on mobile - disable hover transforms */
          .stat-card-hover:hover,
          .dept-card-hover:hover,
          .action-card-hover:hover {
            transform: none !important;
          }
        }
        
        @media (min-width: 640px) and (max-width: 1024px) {
          /* Tablet: 2 columns for grids */
          .grid-cols-3, .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 640px) {
          /* Mobile specific adjustments */
          header .hidden.md\\:flex {
            display: none !important;
          }
          
          /* Smaller text on mobile */
          .text-lg {
            font-size: 1rem;
          }
          
          /* Full width inputs on mobile */
          input[type="text"], 
          input[type="email"], 
          input[type="password"],
          input[type="number"],
          input[type="url"],
          select,
          textarea {
            font-size: 16px; /* Prevent zoom on iOS */
          }
        }
        
        /* Smooth transitions for sidebar */
        aside {
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Mobile sidebar slide animation */
        @media (max-width: 1024px) {
          aside {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
      `}</style>
    </div>
  )
}
