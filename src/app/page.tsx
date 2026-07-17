'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  Target, Lightbulb, HeartHandshake, Trophy
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

type TabType = 'dashboard' | 'departments' | 'faculty' | 'students' | 'activities' | 'research' | 'approvals' | 'analytics' | 'documents' | 'settings'

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
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-2xl shadow-blue-500/30 mb-6 backdrop-blur-sm border border-white/10">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">IQAC Portal</h1>
          <p className="text-blue-200 text-lg">Nehru Institute of Engineering and Technology</p>
          <Badge className="mt-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 px-4 py-1">
            Autonomous Institution
          </Badge>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-8">
            {/* Error Message */}
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
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-12 py-6 h-auto border-white/20 bg-white/5 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl text-base text-white placeholder:text-blue-300/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-12 pr-12 py-6 h-auto border-white/20 bg-white/5 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl text-base text-white placeholder:text-blue-300/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 text-base"
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
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-blue-300/70 text-center mb-4 uppercase tracking-wider font-medium">Quick Demo Access</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => quickLogin('admin@niet.ac.in', 'admin123')}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-blue-500/20 text-blue-100 hover:text-white text-sm font-medium transition-all border border-white/10 hover:border-blue-400/30"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
                <button
                  onClick={() => quickLogin('hod_cse@niet.ac.in', 'hod123')}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-purple-500/20 text-purple-200 hover:text-white text-sm font-medium transition-all border border-white/10 hover:border-purple-400/30"
                >
                  <UserCheck className="w-4 h-4" />
                  HOD CSE
                </button>
                <button
                  onClick={() => quickLogin('staff_cse1@niet.ac.in', 'staff123')}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-emerald-200 hover:text-white text-sm font-medium transition-all border border-white/10 hover:border-emerald-400/30"
                >
                  <BookOpen className="w-4 h-4" />
                  Staff
                </button>
                <button
                  onClick={() => quickLogin('student_cse1@niet.ac.in', 'student123')}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-amber-500/20 text-amber-200 hover:text-white text-sm font-medium transition-all border border-white/10 hover:border-amber-400/30"
                >
                  <GraduationCap className="w-4 h-4" />
                  Student
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-blue-300/50 text-sm mt-8">
          © 2024 NIET IQAC Management System. All rights reserved.
        </p>
      </div>
    </div>
  )
}

// ============ STAT CARD COMPONENT ============
function StatCard({ title, value, icon: Icon, color, trend, subtitle }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string;
  trend?: string;
  subtitle?: string;
}) {
  const colorConfig: Record<string, { gradient: string; shadow: string; bg: string }> = {
    blue: { gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/30', bg: 'bg-blue-50' },
    green: { gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/30', bg: 'bg-emerald-50' },
    purple: { gradient: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/30', bg: 'bg-purple-50' },
    amber: { gradient: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/30', bg: 'bg-amber-50' },
    rose: { gradient: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-500/30', bg: 'bg-rose-50' },
    indigo: { gradient: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/30', bg: 'bg-indigo-50' },
    cyan: { gradient: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-500/30', bg: 'bg-cyan-50' },
  }

  const config = colorConfig[color] || colorConfig.blue

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400">{subtitle}</p>
            )}
            {trend && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg ${config.shadow}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ DEPARTMENT CARD ============
function DeptCard({ dept, onClick }: { dept: Department; onClick?: () => void }) {
  return (
    <Card 
      className="border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden bg-white"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-lg`}>
            {dept.code}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{dept.name}</h3>
        {dept.hod && (
          <p className="text-sm text-gray-500 mb-3">HOD: {dept.hod}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4 text-blue-500" /> 
            <span className="font-medium text-gray-700">{dept.facultyCount || 0}</span> Faculty
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap className="w-4 h-4 text-purple-500" /> 
            <span className="font-medium text-gray-700">{dept.studentCount || 0}</span> Students
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ ACTIVITY CARD ============
function ActivityCard({ activity }: { activity: any }) {
  return (
    <Card className="border border-gray-100 hover:shadow-md transition-all bg-white">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-blue-50">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{activity.title || 'Department Activity'}</h4>
            <p className="text-sm text-gray-500 mt-1">{activity.description || 'Activity description'}</p>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant={activity.status === 'Completed' ? 'default' : 'secondary'} 
                     className={activity.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                {activity.status || 'Pending'}
              </Badge>
              <span className="text-xs text-gray-400">{activity.date || 'Today'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ ACTION CARD ============
function ActionCard({ title, description, icon: Icon, color, onClick }: {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}) {
  const colors: Record<string, string> = {
    blue: 'hover:bg-blue-50 hover:border-blue-200 group-hover:text-blue-600',
    purple: 'hover:bg-purple-50 hover:border-purple-200 group-hover:text-purple-600',
    green: 'hover:bg-emerald-50 hover:border-emerald-200 group-hover:text-emerald-600',
    amber: 'hover:bg-amber-50 hover:border-amber-200 group-hover:text-amber-600',
    rose: 'hover:bg-rose-50 hover:border-rose-200 group-hover:text-rose-600',
  }

  const iconColors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
  }

  return (
    <Card 
      className={`border border-gray-100 hover:shadow-lg transition-all cursor-pointer group ${colors[color] || colors.blue}`}
      onClick={onClick}
    >
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${iconColors[color] || iconColors.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-transition-colors">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:text-current transition-all" />
      </CardContent>
    </Card>
  )
}

// ============ DATA TABLE ============
function DataTable({ 
  data, 
  columns, 
  title,
  onAdd,
  onEdit,
  onDelete,
  onExport
}: {
  data: any[];
  columns: { key: string; label: string; render?: (val: any) => React.ReactNode }[];
  title: string;
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onExport?: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredData = data.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          {onAdd && (
            <Button size="sm" onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4 text-sm text-gray-700">
                      {col.render ? col.render(item[col.key]) : item[col.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => onDelete(item)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Database className="w-12 h-12 text-gray-300 mb-3" />
                      <p>No data found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ============ DASHBOARD CONTENT BY ROLE ============
function DashboardContent({ user, departments, stats, setActiveTab }: {
  user: User;
  departments: Department[];
  stats: DashboardStats;
  setActiveTab: (tab: TabType) => void;
}) {
  // Admin Dashboard
  if (user.role === 'ADMIN') {
    return (
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, Administrator</h1>
              <p className="text-blue-100 text-lg">Here's what's happening across all departments today.</p>
              <div className="flex items-center gap-4 mt-6">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setActiveTab('analytics')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <Building2 className="w-32 h-32 text-white/10" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Departments" value={stats.totalDepartments} icon={Database} color="blue" subtitle="Total academic units" />
          <StatCard title="Faculty" value={stats.totalFaculty} icon={UserCheck} color="green" subtitle="Teaching staff" />
          <StatCard title="Students" value={stats.totalStudents} icon={GraduationCap} color="purple" subtitle="Enrolled students" />
          <StatCard title="Activities" value={stats.totalActivities} icon={Activity} color="amber" subtitle="This semester" />
          <StatCard title="Research" value={stats.totalResearch} icon={FileText} color="rose" subtitle="Publications" />
          <StatCard title="Pending" value={stats.pendingApprovals} icon={Clock} color="indigo" trend="Needs review" subtitle="Awaiting action" />
        </div>

        {/* Departments & Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Departments Overview */}
          <Card className="xl:col-span-2 border border-gray-100">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Departments Overview</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{departments.length} academic departments</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('departments')}>
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departments.slice(0, 6).map(dept => (
                  <DeptCard key={dept.id} dept={dept} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="border border-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ActionCard 
                  title="Manage Users" 
                  description="Add or modify accounts" 
                  icon={Users} 
                  color="blue"
                  onClick={() => setActiveTab('faculty')}
                />
                <ActionCard 
                  title="Approvals" 
                  description="Review submissions" 
                  icon={CheckCircle} 
                  color="purple"
                  onClick={() => setActiveTab('approvals')}
                />
                <ActionCard 
                  title="Analytics" 
                  description="View reports & insights" 
                  icon={BarChart3} 
                  color="green"
                  onClick={() => setActiveTab('analytics')}
                />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border border-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'New faculty added', dept: 'CSE', time: '2 hours ago', color: 'bg-blue-500' },
                    { action: 'Research paper approved', dept: 'ECE', time: '4 hours ago', color: 'bg-emerald-500' },
                    { action: 'Activity report submitted', dept: 'IT', time: '6 hours ago', color: 'bg-purple-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.action}</p>
                        <p className="text-xs text-gray-500">{item.dept} • {item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // HOD Dashboard
  if (user.role === 'HOD') {
    const dept = departments.find(d => d.id === user.departmentId)
    return (
      <div className="space-y-8">
        <div className="rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-medium uppercase tracking-wide">Department Head Dashboard</p>
              <h1 className="text-3xl font-bold mt-2">{dept?.name || 'My Department'}</h1>
              <p className="text-purple-100 mt-2">Manage your department activities and faculty</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold">{dept?.facultyCount || 12}</p>
                <p className="text-purple-200 text-sm">Faculty Members</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Faculty" value={dept?.facultyCount || 12} icon={UserCheck} color="green" />
          <StatCard title="Students" value={dept?.studentCount || 156} icon={GraduationCap} color="purple" />
          <StatCard title="Activities" value={dept?.activityCount || 24} icon={Activity} color="blue" />
          <StatCard title="Research Papers" value={18} icon={FileText} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1,2,3,4].map(i => (
                <ActivityCard key={i} activity={{
                  title: `Department Activity #${i}`,
                  status: i === 1 ? 'Completed' : i === 2 ? 'Ongoing' : 'Pending',
                  date: `${i} day(s) ago`
                }} />
              ))}
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Faculty Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Dr. Kumar', 'Prof. Sharma', 'Dr. Ravi', 'Prof. Priya'].map((name, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                      {name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${85 - i * 10}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{85 - i * 10}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Staff Dashboard
  if (user.role === 'STAFF') {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Staff Portal</p>
              <h1 className="text-3xl font-bold mt-2">Welcome, {user.name}</h1>
              <p className="text-emerald-100 mt-2">{user.departmentName || 'Your Department'} • Faculty Member</p>
            </div>
            <div className="hidden md:block">
              <Award className="w-20 h-20 text-white/20" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="My Activities" value="8" icon={Activity} color="blue" />
          <StatCard title="Publications" value="5" icon={FileText} color="purple" />
          <StatCard title="Certifications" value="3" icon={Award} color="amber" />
          <StatCard title="Hours Logged" value="128" icon={Clock} color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-gray-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Add Activity', icon: Plus, color: 'blue' },
                  { label: 'Submit Research', icon: Send, color: 'purple' },
                  { label: 'Upload Document', icon: Upload, color: 'green' },
                  { label: 'View Reports', icon: BarChart3, color: 'amber' },
                ].map(action => (
                  <button 
                    key={action.label}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-left transition-all group"
                  >
                    <div className={`p-2 rounded-lg bg-${action.color}-100 text-${action.color}-600 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-emerald-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold">My Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Workshop Report', date: 'Today', status: 'Approved', color: 'emerald' },
                { name: 'Conference Paper', date: 'Yesterday', status: 'Under Review', color: 'amber' },
                { name: 'Student Mentorship Log', date: '2 days ago', status: 'Draft', color: 'gray' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                  </div>
                  <Badge variant="outline" className={
                    item.color === 'emerald' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' :
                    item.color === 'amber' ? 'border-amber-300 text-amber-700 bg-amber-50' :
                    'border-gray-300 text-gray-700 bg-gray-50'
                  }>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Student Dashboard
  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-100 text-sm font-medium uppercase tracking-wide">Student Portal</p>
            <h1 className="text-3xl font-bold mt-2">Welcome, {user.name}</h1>
            <p className="text-amber-100 mt-2">{user.departmentName || 'Your Department'} • Student</p>
          </div>
          <div className="hidden md:block">
            <GraduationCap className="w-20 h-20 text-white/20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Current CGPA" value="8.5" icon={Star} color="amber" />
        <StatCard title="Attendance" value="92%" icon={CheckCircle} color="green" />
        <StatCard title="Courses" value="6" icon={BookOpen} color="blue" />
        <StatCard title="Achievements" value="4" icon={Trophy} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold">My Submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Project Report', status: 'Approved', color: 'emerald' },
              { name: 'Internship Certificate', status: 'Pending', color: 'amber' },
              { name: 'Course Feedback', status: 'Draft', color: 'gray' },
              { name: 'Assignment 3', status: 'Submitted', color: 'blue' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    item.color === 'emerald' ? 'bg-emerald-500' :
                    item.color === 'amber' ? 'bg-amber-500' :
                    item.color === 'blue' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <Badge variant="outline" className={
                  item.color === 'emerald' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' :
                  item.color === 'amber' ? 'border-amber-300 text-amber-700 bg-amber-50' :
                  item.color === 'blue' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                  'border-gray-300 text-gray-700 bg-gray-50'
                }>
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: 'Technical Symposium', date: 'Dec 15, 2024', type: 'Academic' },
              { title: 'Workshop on AI', date: 'Dec 18, 2024', type: 'Workshop' },
              { title: 'Semester Exams', date: 'Jan 5, 2025', type: 'Exam' },
              { title: 'Cultural Fest', date: 'Jan 20, 2025', type: 'Event' },
            ].map((event, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{event.date}</p>
                </div>
                <Badge variant="secondary">{event.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============ DEPARTMENTS PAGE ============
function DepartmentsPage({ departments }: { departments: Department[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1">Manage all academic departments</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {departments.map(dept => (
          <DeptCard key={dept.id} dept={dept} />
        ))}
      </div>
    </div>
  )
}

// ============ FACULTY PAGE ============
function FacultyPage() {
  const facultyData = [
    { id: '1', name: 'Dr. Ramesh Kumar', email: 'ramesh@niet.ac.in', department: 'CSE', role: 'Professor', status: 'Active' },
    { id: '2', name: 'Prof. Sita Lakshmi', email: 'sita@niet.ac.in', department: 'ECE', role: 'Associate Professor', status: 'Active' },
    { id: '3', name: 'Dr. Arun Prakash', email: 'arun@niet.ac.in', department: 'IT', role: 'Assistant Professor', status: 'On Leave' },
    { id: '4', name: 'Prof. Divya Reddy', email: 'divya@niet.ac.in', department: 'EEE', role: 'Professor', status: 'Active' },
    { id: '5', name: 'Dr. Karthik Rajan', email: 'karthik@niet.ac.in', department: 'MECH', role: 'Associate Professor', status: 'Active' },
  ]

  return (
    <DataTable
      data={facultyData}
      title="Faculty Members"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'department', label: 'Department', render: (v) => <Badge variant="secondary">{v}</Badge> },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status', render: (v) => (
          <Badge className={v === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>{v}</Badge>
        )},
      ]}
      onAdd={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
      onExport={() => {}}
    />
  )
}

// ============ STUDENTS PAGE ============
function StudentsPage() {
  const studentData = [
    { id: '1', name: 'Arun Kumar', regNo: '2024CS001', department: 'CSE', year: 'II', cgpa: '8.5' },
    { id: '2', name: 'Priya Sharma', regNo: '2024CS002', department: 'CSE', year: 'II', cgpa: '9.1' },
    { id: '3', name: 'Rahul Dev', regNo: '2024EC001', department: 'ECE', year: 'III', cgpa: '7.8' },
    { id: '4', name: 'Sneha Patel', regNo: '2024IT001', department: 'IT', year: 'II', cgpa: '8.9' },
    { id: '5', name: 'Mohammed Ali', regNo: '2024ME001', department: 'MECH', year: 'IV', cgpa: '7.5' },
  ]

  return (
    <DataTable
      data={studentData}
      title="Students"
      columns={[
        { key: 'regNo', label: 'Reg. No.' },
        { key: 'name', label: 'Name' },
        { key: 'department', label: 'Dept.', render: (v) => <Badge variant="secondary">{v}</Badge> },
        { key: 'year', label: 'Year' },
        { key: 'cgpa', label: 'CGPA', render: (v) => <span className="font-semibold text-emerald-600">{v}</span> },
      ]}
      onAdd={() => {}}
      onEdit={() => {}}
      onExport={() => {}}
    />
  )
}

// ============ ACTIVITIES PAGE ============
function ActivitiesPage() {
  const activityData = [
    { id: '1', title: 'Workshop on AI/ML', department: 'CSE', date: '2024-12-10', participants: 45, status: 'Completed' },
    { id: '2', title: 'Industry Visit - TCS', department: 'IT', date: '2024-12-15', participants: 60, status: 'Upcoming' },
    { id: '3', title: 'Hackathon 2024', department: 'CSE', date: '2024-12-20', participants: 120, status: 'Planning' },
    { id: '4', title: 'Guest Lecture - Cloud Computing', department: 'ECE', date: '2024-12-08', participants: 80, status: 'Completed' },
    { id: '5', title: 'Technical Symposium', department: 'All', date: '2024-12-25', participants: 200, status: 'Planning' },
  ]

  return (
    <DataTable
      data={activityData}
      title="Activities & Events"
      columns={[
        { key: 'title', label: 'Activity' },
        { key: 'department', label: 'Department', render: (v) => <Badge variant="secondary">{v}</Badge> },
        { key: 'date', label: 'Date' },
        { key: 'participants', label: 'Participants', render: (v) => `${v} students` },
        { key: 'status', label: 'Status', render: (v) => (
          <Badge className={
            v === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
            v === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
            'bg-amber-100 text-amber-700'
          }>{v}</Badge>
        )},
      ]}
      onAdd={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
      onExport={() => {}}
    />
  )
}

// ============ RESEARCH PAGE ============
function ResearchPage() {
  const researchData = [
    { id: '1', title: 'Deep Learning for Medical Imaging', authors: 'Dr. Ramesh, Prof. Sita', journal: 'IEEE Transactions', year: '2024', citations: 15 },
    { id: '2', title: 'IoT-Based Smart Agriculture', authors: 'Dr. Arun, Prof. Divya', journal: 'Springer', year: '2024', citations: 8 },
    { id: '3', title: 'Blockchain in Supply Chain', authors: 'Dr. Karthik', journal: 'Elsevier', year: '2023', citations: 32 },
    { id: '4', title: 'Renewable Energy Systems', authors: 'Prof. Mohan, Dr. Lakshmi', journal: 'Taylor & Francis', year: '2024', citations: 5 },
  ]

  return (
    <DataTable
      data={researchData}
      title="Research Publications"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'authors', label: 'Authors' },
        { key: 'journal', label: 'Journal/Publisher' },
        { key: 'year', label: 'Year' },
        { key: 'citations', label: 'Citations', render: (v) => <span className="font-semibold text-blue-600">{v}</span> },
      ]}
      onAdd={() => {}}
      onEdit={() => {}}
      onExport={() => {}}
    />
  )
}

// ============ APPROVALS PAGE ============
function ApprovalsPage() {
  const approvalData = [
    { id: '1', type: 'Activity Report', submittedBy: 'Prof. Sita', department: 'ECE', date: '2024-12-10', status: 'Pending' },
    { id: '2', type: 'Research Paper', submittedBy: 'Dr. Arun', department: 'IT', date: '2024-12-09', status: 'Pending' },
    { id: '3', type: 'Leave Request', submittedBy: 'Prof. Divya', department: 'EEE', date: '2024-12-08', status: 'Approved' },
    { id: '4', type: 'Budget Request', submittedBy: 'Dr. Karthik', department: 'MECH', date: '2024-12-07', status: 'Rejected' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-500 mt-1">Review and manage pending requests</p>
      </div>

      <div className="grid gap-4">
        {approvalData.map(item => (
          <Card key={item.id} className="border border-gray-100 hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    item.type === 'Activity Report' ? 'bg-blue-100 text-blue-600' :
                    item.type === 'Research Paper' ? 'bg-purple-100 text-purple-600' :
                    item.type === 'Leave Request' ? 'bg-amber-100 text-amber-600' :
                    'bg-rose-100 text-rose-600'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.type}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted by {item.submittedBy} • {item.department}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={
                    item.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  }>{item.status}</Badge>
                  {item.status === 'Pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============ ANALYTICS PAGE ============
function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1">Comprehensive insights and statistics</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Activities</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">156</p>
                <p className="text-xs text-emerald-600 mt-1">+12% from last month</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Participation Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">87%</p>
                <p className="text-xs text-emerald-600 mt-1">+5% from last month</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Research Output</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">42</p>
                <p className="text-xs text-emerald-600 mt-1">+8 new papers</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. CGPA</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">8.2</p>
                <p className="text-xs text-amber-600 mt-1">+0.3 improvement</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Activities by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chart visualization area</p>
                <p className="text-sm text-gray-400">Integration with Chart.js available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Line chart visualization area</p>
                <p className="text-sm text-gray-400">Integration with Chart.js available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============ DOCUMENTS PAGE ============
function DocumentsPage() {
  const documents = [
    { id: '1', name: 'AQAR 2023-24.pdf', type: 'PDF', size: '2.4 MB', uploadedBy: 'IQAC Cell', date: '2024-01-15' },
    { id: '2', name: 'NAAC Criteria Report.docx', type: 'DOCX', size: '1.8 MB', uploadedBy: 'Dr. Ramesh', date: '2024-02-20' },
    { id: '3', name: 'SSR Documentation.xlsx', type: 'XLSX', size: '856 KB', uploadedBy: 'Prof. Sita', date: '2024-03-10' },
    { id: '4', name: 'Meeting Minutes Dec.pdf', type: 'PDF', size: '425 KB', uploadedBy: 'HOD-CSE', date: '2024-12-05' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">Manage and upload institutional documents</p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-4">
        {documents.map(doc => (
          <Card key={doc.id} className="border border-gray-100 hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    doc.type === 'PDF' ? 'bg-red-100 text-red-600' :
                    doc.type === 'DOCX' ? 'bg-blue-100 text-blue-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Uploaded by {doc.uploadedBy} • {doc.size} • {doc.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============ SETTINGS PAGE ============
function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage system configuration and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <Input defaultValue="Administrator" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input defaultValue="admin@niet.ac.in" />
              </div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Email notifications for approvals', checked: true },
              { label: 'Weekly activity digest', checked: true },
              { label: 'System announcements', checked: false },
              { label: 'Deadline reminders', checked: true },
            ].map((pref, i) => (
              <label key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="text-gray-700">{pref.label}</span>
                <input type="checkbox" defaultChecked={pref.checked} className="w-5 h-5 rounded text-blue-600" />
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============ SIDEBAR ============
function Sidebar({ isOpen, onClose, activeTab, setActiveTab, userRole }: {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole: string;
}) {
  const menuItems: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'departments', label: 'Departments', icon: Database },
    { id: 'faculty', label: 'Faculty', icon: Users },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'research', label: 'Research', icon: FileText },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const filteredMenu = menuItems.filter(item => {
    if (userRole === 'ADMIN') return true
    if (userRole === 'HOD') return ['dashboard','departments','faculty','students','activities','research','approvals','analytics'].includes(item.id)
    if (userRole === 'STAFF') return ['dashboard','activities','research','documents','settings'].includes(item.id)
    return ['dashboard','activities','documents'].includes(item.id)
  })

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">IQAC Portal</h1>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white" />
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <p className="text-xs text-gray-500">Need help?</p>
              <p className="text-sm font-semibold text-gray-900">Contact IT Support</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

// ============ MAIN APP COMPONENT ============
export default function IQACPortal() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch data when authenticated
  useEffect(() => {
    if (!isAuthenticated || isInitialized) return
    
    let isMounted = true
    
    const loadData = async () => {
      try {
        const [deptRes, dashRes] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/dashboard')
        ])
        
        if (isMounted) {
          // Process departments
          if (deptRes.ok) {
            const deptData = await deptRes.json()
            if (deptData.success && deptData.departments) {
              // Map _count to expected format
              const mappedDepts = deptData.departments.map((d: any) => ({
                id: d.id,
                name: d.name,
                code: d.code,
                vision: d.vision,
                mission: d.mission,
                hod: d.hod || 'TBA',
                facultyCount: d._count?.faculty || 0,
                studentCount: d._count?.students || 0,
                activityCount: d._count?.activities || 0,
              }))
              setDepartments(mappedDepts)
            }
          }
          
          // Process dashboard stats
          if (dashRes.ok) {
            const dashData = await dashRes.json()
            if (dashData.success && dashData.data?.stats) {
              setDashboardStats(dashData.data.stats)
            }
          }
          
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        // Set default data even on error
        if (isMounted) {
          setIsInitialized(true)
        }
      }
    }
    
    loadData()
    return () => { isMounted = false }
  }, [isAuthenticated, isInitialized])

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-blue-200 font-medium mt-6">Loading IQAC Portal...</p>
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
    totalDepartments: departments.length || 12,
    totalFaculty: 120,
    totalStudents: 1500,
    totalActivities: 45,
    totalResearch: 32,
    pendingApprovals: 8,
  }
  
  const stats = dashboardStats || defaultStats

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent user={user} departments={departments} stats={stats} setActiveTab={setActiveTab} />
      case 'departments':
        return <DepartmentsPage departments={departments} />
      case 'faculty':
        return <FacultyPage />
      case 'students':
        return <StudentsPage />
      case 'activities':
        return <ActivitiesPage />
      case 'research':
        return <ResearchPage />
      case 'approvals':
        return <ApprovalsPage />
      case 'analytics':
        return <AnalyticsPage />
      case 'documents':
        return <DocumentsPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <DashboardContent user={user} departments={departments} stats={stats} setActiveTab={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={user.role}
      />

      <div className="lg:ml-72 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <Home className="w-4 h-4" />
                <span>/</span>
                <span className="text-gray-900 capitalize font-medium">{activeTab}</span>
              </div>
              {/* Mobile Title */}
              <h2 className="lg:hidden font-semibold text-gray-900 capitalize">{activeTab}</h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                <Search className="w-4 h-4" />
                <span className="text-sm">Search...</span>
                <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 rounded bg-gray-200 text-xs text-gray-600">⌘K</kbd>
              </button>

              {/* Notifications */}
              <button className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
              </button>

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
        <main className="flex-1 p-4 lg:p-6 pb-20">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <p>© 2024 NIET IQAC Enterprise Management System</p>
            <p>Nehru Institute of Engineering and Technology (Autonomous)</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
