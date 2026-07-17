'use client'

import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, Mail, Lock, Eye, EyeOff, Loader2, 
  LayoutDashboard, Users, GraduationCap, FileText,
  BarChart3, Settings, Bell, LogOut, Menu, X,
  Home, UserCheck, BookOpen, Award, TrendingUp,
  CheckCircle, Clock, AlertCircle, ChevronRight,
  Shield, Star, Activity, Zap, Database
} from 'lucide-react'

// Types
interface Department {
  id: string
  name: string
  code: string
  vision?: string
  mission?: string
  _count?: {
    faculty: number
    students: number
    activities: number
  }
}

interface DashboardStats {
  totalDepartments: number
  totalFaculty: number
  totalStudents: number
  totalActivities: number
  totalResearch: number
  pendingApprovals: number
}

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

    const result = await login(email, password)
    
    if (!result.success) {
      setError(result.error || 'Login failed')
    }
    setIsLoading(false)
  }

  const quickLogin = (emailVal: string, passVal: string) => {
    setEmail(emailVal)
    setPassword(passVal)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/25 mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">IQAC Portal</h1>
          <p className="text-gray-600 text-base">Nehru Institute of Engineering and Technology</p>
          <Badge variant="secondary" className="mt-2 bg-indigo-100 text-indigo-700 border-0">Autonomous</Badge>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-12 py-6 h-auto border-gray-200 bg-white/50 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-12 pr-12 py-6 h-auto border-gray-200 bg-white/50 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 text-base"
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

            {/* Quick Login */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center mb-4 uppercase tracking-wider">Quick Demo Access</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => quickLogin('admin@niet.ac.in', 'admin123')}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-gray-600 text-sm font-medium transition-all border border-gray-100 hover:border-blue-200"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
                <button
                  onClick={() => quickLogin('hod_cse@niet.ac.in', 'hod123')}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-gray-600 text-sm font-medium transition-all border border-gray-100 hover:border-purple-200"
                >
                  <UserCheck className="w-4 h-4" />
                  HOD CSE
                </button>
                <button
                  onClick={() => quickLogin('staff_cse1@niet.ac.in', 'staff123')}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 hover:bg-green-50 hover:text-green-700 text-gray-600 text-sm font-medium transition-all border border-gray-100 hover:border-green-200"
                >
                  <BookOpen className="w-4 h-4" />
                  Staff
                </button>
                <button
                  onClick={() => quickLogin('student_cse1@niet.ac.in', 'student123')}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-gray-600 text-sm font-medium transition-all border border-gray-100 hover:border-amber-200"
                >
                  <GraduationCap className="w-4 h-4" />
                  Student
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          © 2024 NIET IQAC Management System. All rights reserved.
        </p>
      </div>
    </div>
  )
}

// ============ STAT CARD COMPONENT ============
function StatCard({ title, value, icon: Icon, color, trend }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string;
  trend?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
    rose: 'from-rose-500 to-rose-600 shadow-rose-500/20',
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/20',
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
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
    <Card className="border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm`}>
            {dept.code}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">{dept.name}</h3>
        {dept._count && (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" /> {dept._count.faculty} Faculty
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4" /> {dept._count.students} Students
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============ ADMIN DASHBOARD ============
function AdminDashboard({ departments, stats }: { departments: Department[], stats: DashboardStats }) {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, Administrator</h1>
            <p className="text-blue-100">Here's what's happening across all departments today.</p>
          </div>
          <div className="hidden md:block">
            <Building2 className="w-16 h-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Departments" value={stats.totalDepartments} icon={Database} color="blue" />
        <StatCard title="Faculty" value={stats.totalFaculty} icon={UserCheck} color="green" />
        <StatCard title="Students" value={stats.totalStudents} icon={GraduationCap} color="purple" />
        <StatCard title="Activities" value={stats.totalActivities} icon={Activity} color="amber" />
        <StatCard title="Research" value={stats.totalResearch} icon={FileText} color="rose" />
        <StatCard title="Pending" value={stats.pendingApprovals} icon={Clock} color="indigo" trend="Needs review" />
      </div>

      {/* Departments Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Departments Overview</h2>
            <p className="text-sm text-gray-500 mt-1">{departments.length} academic departments</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg">
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {departments.slice(0, 8).map(dept => (
            <DeptCard key={dept.id} dept={dept} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">Add or modify user accounts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Approvals</h3>
              <p className="text-sm text-gray-500">Review pending submissions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-500">View reports and insights</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============ HOD DASHBOARD ============
function HODDashboard({ department }: { department: any }) {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Department Dashboard</h1>
        <p className="text-purple-100">{department?.name || 'My Department'} - Management View</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Faculty" value="12" icon={UserCheck} color="green" />
        <StatCard title="Students" value="156" icon={GraduationCap} color="purple" />
        <StatCard title="Activities" value="24" icon={Activity} color="blue" />
        <StatCard title="Research" value="18" icon={FileText} color="amber" />
      </div>

      <Card className="border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
              <div className="p-2 rounded-lg bg-blue-100"><Activity className="w-5 h-5 text-blue-600"/></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Department Activity #{i}</p>
                <p className="text-sm text-gray-500">Status: {i === 1 ? 'Completed' : i === 2 ? 'Ongoing' : 'Planned'}</p>
              </div>
              <Badge variant={i === 1 ? 'default' : 'secondary'}>{i === 1 ? 'Done' : i === 2 ? 'Active' : 'Pending'}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ============ STAFF DASHBOARD ============
function StaffDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {user?.name || 'Staff Member'}</h1>
        <p className="text-emerald-100">Your personal dashboard and activity tracker</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Activities" value="8" icon={Activity} color="blue" />
        <StatCard title="Publications" value="5" icon={FileText} color="purple" />
        <StatCard title="Certifications" value="3" icon={Award} color="amber" />
        <StatCard title="Hours Logged" value="128" icon={Clock} color="green" />
      </div>

      <Card className="border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Add Activity', 'Submit Research', 'Upload Document', 'View Reports'].map(action => (
            <button key={action} className="p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-sm font-medium text-gray-700 hover:text-emerald-700 transition-all">
              + {action}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ============ STUDENT DASHBOARD ============
function StudentDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Student Portal</h1>
        <p className="text-amber-100">Welcome, {user?.name || 'Student'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="CGPA" value="8.5" icon={Star} color="amber" />
        <StatCard title="Attendance" value="92%" icon={CheckCircle} color="green" />
        <StatCard title="Courses" value="6" icon={BookOpen} color="blue" />
        <StatCard title="Achievements" value="4" icon={Award} color="purple" />
      </div>

      <Card className="border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Submissions</h2>
        <div className="space-y-3">
          {[
            { name: 'Project Report', status: 'Approved', color: 'emerald' },
            { name: 'Internship Certificate', status: 'Pending', color: 'amber' },
            { name: 'Course Feedback', status: 'Draft', color: 'gray' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
              <span className="font-medium text-gray-900">{item.name}</span>
              <Badge variant="outline" className={`border-${item.color}-300 text-${item.color}-700`}>{item.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ============ SIDEBAR ============
function Sidebar({ isOpen, onClose, activeTab, setActiveTab, userRole }: {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'departments', label: 'Departments', icon: Database },
    { id: 'faculty', label: 'Faculty', icon: Users },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'research', label: 'Research', icon: FileText },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'documents', label: 'Documents', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  // Filter menu based on role
  const filteredMenu = userRole === 'ADMIN' ? menuItems : 
                       userRole === 'HOD' ? menuItems.filter(m => ['dashboard','faculty','students','activities','research','approvals','analytics'].includes(m.id)) :
                       userRole === 'STAFF' ? menuItems.filter(m => ['dashboard','activities','research','documents'].includes(m.id)) :
                       ['dashboard', 'activities', 'documents'].map(id => menuItems.find(m => m.id === id)!).filter(Boolean)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-100 shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">IQAC Portal</h1>
                <p className="text-xs text-gray-500">NIET Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredMenu.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="px-4 py-3 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500">Need help?</p>
              <p className="text-sm font-medium text-gray-900">Contact IT Support</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

// ============ MAIN APP ============
export default function IQACPortal() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)

  // Fetch data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    
    let isMounted = true
    
    const loadData = async () => {
      try {
        const [deptRes, dashRes] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/dashboard')
        ])
        
        if (isMounted) {
          const deptData = await deptRes.json()
          if (deptData.success) setDepartments(deptData.departments)
          
          const dashData = await dashRes.json()
          if (dashData.success) setDashboardStats(dashData.data.stats)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    
    loadData()
    return () => { isMounted = false }
  }, [isAuthenticated])

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginPage />
  }

  // Default stats if not loaded
  const defaultStats: DashboardStats = {
    totalDepartments: departments.length,
    totalFaculty: 120,
    totalStudents: 1500,
    totalActivities: 45,
    totalResearch: 32,
    pendingApprovals: 8,
  }
  
  const stats = dashboardStats || defaultStats

  // Render dashboard by role
  const renderDashboard = () => {
    switch (user.role) {
      case 'ADMIN':
        return <AdminDashboard departments={departments} stats={stats} />
      case 'HOD':
        return <HODDashboard department={departments.find(d => d.id === user.departmentId)} />
      case 'STAFF':
        return <StaffDashboard user={user} />
      case 'STUDENT':
        return <StudentDashboard user={user} />
      default:
        return <AdminDashboard departments={departments} stats={stats} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={user.role}
      />

      <div className="lg:ml-72 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <Home className="w-4 h-4" />
                <span>/</span>
                <span className="text-gray-900 capitalize font-medium">{activeTab}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderDashboard()}
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <p>© 2024 NIET IQAC Enterprise Management System</p>
            <p>Nehru Institute of Engineering and Technology (Autonomous)</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
