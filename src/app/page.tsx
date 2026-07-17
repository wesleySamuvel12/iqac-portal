'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building2, Users, GraduationCap, FileText, BarChart3, Settings, Bell,
  LogOut, Search, Menu, X, Home, UserCheck, BookOpen, Award, TrendingUp,
  Calendar, CheckCircle, Clock, AlertCircle, Plus, Download, Eye,
  ChevronRight, Shield, Target, Star, Activity as ActivityIcon, Zap,
  Layers, Database, Lock, Mail, Phone, MapPin, Globe, Briefcase,
  Trophy, ClipboardList, LayoutDashboard, FolderOpen,
  MessageSquare, ThumbsUp, ThumbsDown, RefreshCw, Filter, Grid3X3,
  List, Upload, Image, Video, FileArchive, Table, FileSpreadsheet,
  Send, Edit3, Trash2, Save, XCircle, CheckSquare, Square,
  ArrowLeft, MoreVertical, ExternalLink, Copy, Printer, Share2,
  Heart, Bookmark, Flag, Tag, Package, Truck, Wrench, Cpu,
  Microscope, FlaskConical, Atom, Calculator, PenTool, Palette,
  Music, Drama, Dumbbell, TreePine, HandHeart, Rocket, Lightbulb,
  Brain, Fingerprint, Wifi, Server, Cloud, Code, Terminal
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

// Login Component
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000" />
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
          }}
        />
      ))}

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 mb-4 shadow-lg shadow-purple-500/30">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">IQAC Portal</h1>
            <p className="text-white/70 text-sm">Nehru Institute of Engineering and Technology</p>
            <p className="text-white/50 text-xs mt-1">(Autonomous)</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
              <p className="text-red-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-12 py-3 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-12 py-3 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Quick Login Options */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-white/50 text-xs text-center mb-4">Quick Login (Demo)</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setEmail('admin@niet.ac.in'); setPassword('admin123'); }}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs transition-all border border-white/10"
              >
                🔐 Admin
              </button>
              <button
                onClick={() => { setEmail('hod_cse@niet.ac.in'); setPassword('hod123'); }}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs transition-all border border-white/10"
              >
                👨‍🏫 HOD CSE
              </button>
              <button
                onClick={() => { setEmail('staff_cse1@niet.ac.in'); setPassword('staff123'); }}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs transition-all border border-white/10"
              >
                👨‍🔧 Staff
              </button>
              <button
                onClick={() => { setEmail('student_cse1@niet.ac.in'); setPassword('student123'); }}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs transition-all border border-white/10"
              >
                🎓 Student
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-6">
          © 2024 NIET IQAC Management System
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

// Sidebar Component
function Sidebar({ isOpen, onClose, activeTab, setActiveTab, userRole }: {
  isOpen: boolean
  onClose: () => void
  activeTab: string
  setActiveTab: (tab: string) => void
  userRole: string
}) {
  const isAdmin = userRole === 'ADMIN'
  const isHOD = userRole === 'HOD'
  const isStaff = userRole === 'STAFF'
  const isStudent = userRole === 'STUDENT'

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'faculty', label: 'Faculty', icon: Users },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'activities', label: 'Activities', icon: Calendar },
    { id: 'research', label: 'Research', icon: BookOpen },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const hodMenu = [
    { id: 'dashboard', label: 'My Department', icon: LayoutDashboard },
    { id: 'faculty', label: 'Faculty', icon: Users },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'activities', label: 'Activities', icon: Calendar },
    { id: 'research', label: 'Research', icon: BookOpen },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'analytics', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  const staffMenu = [
    { id: 'dashboard', label: 'My Activities', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'activities', label: 'Activities', icon: Calendar },
    { id: 'research', label: 'Research', icon: BookOpen },
    { id: 'approvals', label: 'Reviews', icon: CheckCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  const studentMenu = [
    { id: 'dashboard', label: 'My Profile', icon: LayoutDashboard },
    { id: 'submissions', label: 'My Submissions', icon: Upload },
    { id: 'activities', label: 'Activities', icon: Calendar },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  const menu = isAdmin ? adminMenu : isHOD ? hodMenu : isStaff ? staffMenu : studentMenu

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full z-50 w-72 backdrop-blur-xl bg-slate-900/90 border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">IQAC ERP</h2>
                <p className="text-white/50 text-xs">NIET Autonomous</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 text-white border border-purple-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
              {userRole[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate capitalize">{userRole}</p>
              <p className="text-white/50 text-xs">Online</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, color, trend }: {
  title: string
  value: number | string
  icon: any
  color: string
  trend?: string
}) {
  return (
    <Card className="backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 group hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-white/60 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {trend && (
              <p className="text-emerald-400 text-xs flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Department Card Component
function DepartmentCard({ dept, onView }: { dept: Department; onView: () => void }) {
  return (
    <Card className="backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10" onClick={onView}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
            {dept.code.substring(0, 2)}
          </div>
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            Active
          </Badge>
        </div>
        <CardTitle className="text-white text-lg mt-3 line-clamp-1">{dept.name}</CardTitle>
        <CardDescription className="text-white/50 text-sm">{dept.code}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-xl bg-white/5">
            <Users className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
            <p className="text-white font-bold">{dept._count?.faculty || 0}</p>
            <p className="text-white/50 text-xs">Faculty</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <GraduationCap className="w-5 h-5 mx-auto mb-1 text-purple-400" />
            <p className="text-white font-bold">{dept._count?.students || 0}</p>
            <p className="text-white/50 text-xs">Students</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-pink-400" />
            <p className="text-white font-bold">{dept._count?.activities || 0}</p>
            <p className="text-white/50 text-xs">Activities</p>
          </div>
        </div>
        <button className="w-full mt-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium transition-all flex items-center justify-center gap-2">
          View Department <ChevronRight className="w-4 h-4" />
        </button>
      </CardContent>
    </Card>
  )
}

// Admin Dashboard Component
function AdminDashboard({ departments, stats }: { departments: Department[]; stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 p-8">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, Administrator</h1>
          <p className="text-white/80 max-w-xl">Complete control over your institution&apos;s IQAC management system. Monitor all departments, faculty, students, and activities from this central dashboard.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="Departments" value={stats.totalDepartments} icon={Building2} color="bg-blue-500" />
        <StatsCard title="Faculty" value={stats.totalFaculty} icon={Users} color="bg-purple-500" />
        <StatsCard title="Students" value={stats.totalStudents} icon={GraduationCap} color="bg-emerald-500" />
        <StatsCard title="Activities" value={stats.totalActivities} icon={Calendar} color="bg-orange-500" />
        <StatsCard title="Research" value={stats.totalResearch} icon={BookOpen} color="bg-pink-500" />
        <StatsCard title="Pending Approvals" value={stats.pendingApprovals} icon={Clock} color="bg-yellow-500" trend="+12%" />
      </div>

      {/* Departments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Department Overview</h2>
            <p className="text-white/60 text-sm">Manage and monitor all {departments.length} departments</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
              <Plus className="w-4 h-4 mr-2" /> Add Department
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {departments.map((dept) => (
            <DepartmentCard key={dept.id} dept={dept} onView={() => {}} />
          ))}
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-purple-400" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: 'New research paper submitted', dept: 'CSE', time: '2 mins ago', type: 'research' },
              { action: 'Student registration approved', dept: 'AI&DS', time: '15 mins ago', type: 'student' },
              { action: 'Workshop completed', dept: 'ECE', time: '1 hour ago', type: 'activity' },
              { action: 'FDP proposal submitted', dept: 'IT', time: '2 hours ago', type: 'fdp' },
              { action: 'Placement update received', dept: 'CSE', time: '3 hours ago', type: 'placement' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activity.type === 'research' ? 'bg-pink-500/20' :
                  activity.type === 'student' ? 'bg-emerald-500/20' :
                  activity.type === 'activity' ? 'bg-blue-500/20' :
                  activity.type === 'fdp' ? 'bg-orange-500/20' : 'bg-purple-500/20'
                }`}>
                  {activity.type === 'research' ? <BookOpen className="w-5 h-5 text-pink-400" /> :
                   activity.type === 'student' ? <GraduationCap className="w-5 h-5 text-emerald-400" /> :
                   activity.type === 'activity' ? <Calendar className="w-5 h-5 text-blue-400" /> :
                   activity.type === 'fdp' ? <Award className="w-5 h-5 text-orange-400" /> :
                   <Briefcase className="w-5 h-5 text-purple-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{activity.action}</p>
                  <p className="text-white/50 text-xs">{activity.dept}</p>
                </div>
                <span className="text-white/40 text-xs whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: UserPlus, label: 'Add Faculty', color: 'from-blue-500 to-cyan-500' },
                { icon: GraduationCap, label: 'Add Student', color: 'from-emerald-500 to-teal-500' },
                { icon: Calendar, label: 'Create Event', color: 'from-purple-500 to-pink-500' },
                { icon: BookOpen, label: 'Add Research', color: 'from-orange-500 to-red-500' },
                { icon: FileText, label: 'Generate Report', color: 'from-indigo-500 to-purple-500' },
                { icon: Download, label: 'Export Data', color: 'from-green-500 to-emerald-500' },
              ].map((action, i) => (
                <button key={i} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group">
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white/80 text-sm font-medium">{action.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// HOD Dashboard Component
function HODDashboard({ department, stats }: { department: Department; stats: any }) {
  return (
    <div className="space-y-6">
      {/* Department Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-3xl shadow-xl">
            {department.code.substring(0, 2)}
          </div>
          <div className="flex-1">
            <Badge className="mb-2 bg-white/20 text-white border-0">Department Head</Badge>
            <h1 className="text-3xl font-bold text-white mb-1">{department.name}</h1>
            <p className="text-white/80">{department.mission}</p>
            <div className="flex items-center gap-4 mt-4">
              <span className="flex items-center gap-1 text-white/70 text-sm"><Calendar className="w-4 h-4" /> AY 2024-2025</span>
              <span className="flex items-center gap-1 text-white/70 text-sm"><Users className="w-4 h-4" /> Odd Semester</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Faculty Count" value={stats.facultyCount || 12} icon={Users} color="bg-blue-500" />
        <StatsCard title="Student Count" value={stats.studentCount || 120} icon={GraduationCap} color="bg-emerald-500" />
        <StatsCard title="Pending Approvals" value={stats.pendingApprovals || 5} icon={Clock} color="bg-yellow-500" />
        <StatsCard title="Approved Activities" value={stats.approvedActivities || 18} icon={CheckCircle} color="bg-green-500" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faculty List */}
        <Card className="lg:col-span-2 backdrop-blur-xl bg-white/10 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Faculty Members
            </CardTitle>
            <Button size="sm" variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Dr. Ramesh Kumar', 'Dr. Priya Sharma', 'Prof. Suresh Babu', 'Dr. Lakshmi Devi'].map((name, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{name}</p>
                    <p className="text-white/50 text-xs">{['Professor', 'Associate Professor', 'Assistant Professor'][i]}</p>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" /> Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: 'Internship Application', student: 'John Doe', type: 'internship' },
              { title: 'Conference Paper', student: 'Jane Smith', type: 'research' },
              { title: 'Award Upload', student: 'Bob Wilson', type: 'certificate' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <p className="text-white text-sm font-medium">{item.title}</p>
                <p className="text-white/50 text-xs">{item.student}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button size="sm" className="h-7 text-xs bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-red-300 hover:bg-red-500/20">
                    <XCircle className="w-3 h-3 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Staff Dashboard Component
function StaffDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      {/* Staff Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user.name}</h1>
          <p className="text-white/80">Manage your activities, review student submissions, and track your contributions.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="My Activities" value={8} icon={Calendar} color="bg-blue-500" />
        <StatsCard title="Student Submissions" value={24} icon={Upload} color="bg-purple-500" />
        <StatsCard title="Pending Reviews" value={5} icon={Clock} color="bg-yellow-500" />
        <StatsCard title="Publications" value={3} icon={BookOpen} color="bg-pink-500" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Student Submissions */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" /> Pending Student Submissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { student: 'Alice Johnson', item: 'Internship Report', date: 'Today' },
              { student: 'Bob Smith', item: 'Project Report', date: 'Yesterday' },
              { student: 'Carol Williams', item: 'Competition Entry', date: '2 days ago' },
              { student: 'David Brown', item: 'Award Upload', date: '3 days ago' },
            ].map((submission, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {submission.student.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{submission.item}</p>
                  <p className="text-white/50 text-xs">{submission.student} • {submission.date}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-cyan-400 hover:bg-cyan-500/20">
                  Review
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* My Research & Publications */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-400" /> My Publications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: 'Machine Learning in Healthcare', journal: 'IEEE Access', year: '2024', citations: 12 },
              { title: 'IoT-Based Smart Systems', journal: 'Springer', year: '2023', citations: 8 },
              { title: 'Deep Learning Applications', journal: 'Elsevier', year: '2024', citations: 5 },
            ].map((pub, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <p className="text-white text-sm font-medium">{pub.title}</p>
                <p className="text-white/50 text-xs">{pub.journal} • {pub.year}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Star className="w-3 h-3" /> {pub.citations} citations
                  </span>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 text-xs">
                    Scopus Indexed
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Student Dashboard Component
function StudentDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      {/* Student Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 p-8">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-3xl shadow-xl">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <Badge className="mb-2 bg-white/20 text-white border-0">Student</Badge>
            <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
            <p className="text-white/80">Computer Science and Engineering • Semester 5</p>
            <div className="flex items-center gap-4 mt-4">
              <span className="flex items-center gap-1 text-white/70 text-sm"><Trophy className="w-4 h-4" /> CGPA: 8.5</span>
              <span className="flex items-center gap-1 text-white/70 text-sm"><Calendar className="w-4 h-4" /> Batch: 2024-2028</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Submissions" value={12} icon={Upload} color="bg-blue-500" />
        <StatsCard title="Approved" value={10} icon={CheckCircle} color="bg-emerald-500" />
        <StatsCard title="Pending" value={2} icon={Clock} color="bg-yellow-500" />
        <StatsCard title="Achievements" value={5} icon={Trophy} color="bg-pink-500" />
      </div>

      {/* Submission Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: 'Journal Paper', count: 2, color: 'from-pink-500 to-rose-500' },
          { icon: Calendar, label: 'Conference', count: 1, color: 'from-purple-500 to-indigo-500' },
          { icon: Award, label: 'Patent', count: 0, color: 'from-blue-500 to-cyan-500' },
          { icon: Briefcase, label: 'Internship', count: 1, color: 'from-emerald-500 to-teal-500' },
          { icon: GraduationCap, label: 'NPTEL', count: 3, color: 'from-orange-500 to-red-500' },
          { icon: Trophy, label: 'Hackathon', count: 2, color: 'from-yellow-500 to-orange-500' },
          { icon: Dumbbell, label: 'Sports', count: 1, color: 'from-green-500 to-emerald-500' },
          { icon: Music, label: 'Cultural', count: 1, color: 'from-violet-500 to-purple-500' },
          { icon: Award, label: 'Certifications', count: 4, color: 'from-cyan-500 to-blue-500' },
        ].map((category, i) => (
          <Card key={i} className="backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/15 transition-all cursor-pointer group hover:-translate-y-1">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{category.label}</p>
                  <p className="text-white/50 text-sm">{category.count} submissions</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Submission Button */}
      <Card className="backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-lg">Ready to submit something new?</h3>
              <p className="text-white/60 text-sm">Add your achievements, publications, certifications, and more.</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
              <Plus className="w-4 h-4 mr-2" /> New Submission
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main App Component
export default function IQACPortal() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/departments')
      const data = await res.json()
      if (data.success) {
        setDepartments(data.departments)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }, [])

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      if (data.success) {
        setDashboardStats(data.data.stats)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    }
  }, [])

  // Fetch data on mount when authenticated
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
          if (deptData.success) {
            setDepartments(deptData.departments)
          }
          
          const dashData = await dashRes.json()
          if (dashData.success) {
            setDashboardStats(dashData.data.stats)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    
    loadData()
    
    return () => { isMounted = false }
  }, [isAuthenticated])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginPage />
  }

  // Get user's department
  const userDepartment = departments.find(d => d.id === user.departmentId)

  // Render dashboard based on role
  const renderDashboard = () => {
    switch (user.role) {
      case 'ADMIN':
        return <AdminDashboard departments={departments} stats={dashboardStats || { totalDepartments: 0, totalFaculty: 0, totalStudents: 0, totalActivities: 0, totalResearch: 0, pendingApprovals: 0 }} />
      case 'HOD':
        return <HODDashboard department={userDepartment || { name: 'My Department', code: 'DEPT', mission: '' }} stats={{}} />
      case 'STAFF':
        return <StaffDashboard user={user} />
      case 'STUDENT':
        return <StudentDashboard user={user} />
      default:
        return <AdminDashboard departments={departments} stats={dashboardStats || { totalDepartments: 0, totalFaculty: 0, totalStudents: 0, totalActivities: 0, totalResearch: 0, pendingApprovals: 0 }} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={user.role}
      />

      {/* Main Content */}
      <div className="lg:ml-72 min-h-screen">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-white/50 text-sm">
                <Home className="w-4 h-4" />
                <span>/</span>
                <span className="capitalize text-white/80">{activeTab}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="bg-transparent text-white placeholder:text-white/40 text-sm outline-none w-48"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-white text-sm font-medium">{user.name}</p>
                  <p className="text-white/50 text-xs capitalize">{user.role.toLowerCase()}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 relative z-10">
          {renderDashboard()}
        </main>

        {/* Footer */}
        <footer className="mt-auto py-6 px-6 border-t border-white/10 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-sm">
            <p>© 2024 NIET IQAC Enterprise Management System</p>
            <p>Nehru Institute of Engineering and Technology (Autonomous)</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

// Missing icon component
function UserPlus(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="16" x2="22" y1="11" y2="11"/></svg>
}
