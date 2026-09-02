'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from '@/lib/store/auth-store'
import { generateTempPassword } from '@/lib/auth-helpers'
import { CSVImportModal } from '@/components/common/CSVImportModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Users, Shield, UserCheck, BookOpen, GraduationCap,
  Plus, Search, Filter, Download, Upload, RefreshCw,
  Key, Lock, CheckCircle, AlertCircle, Edit3, Trash2,
  X, Loader2, Eye, EyeOff, Building2, UserPlus, FileSpreadsheet,
  AlertTriangle, ArrowRight, Check, Hash
} from 'lucide-react'

interface UserManagementSectionProps {
  user: User
}

const DEPARTMENTS_LIST = [
  { id: 'cm7a1b2c30000abc123456789', name: 'Computer Science and Engineering', code: 'CSE' },
  { id: 'cm7a1b2c30001abc123456789', name: 'Information Technology', code: 'IT' },
  { id: 'cm7a1b2c30002abc123456789', name: 'Electronics and Communication Engineering', code: 'ECE' },
  { id: 'cm7a1b2c30003abc123456789', name: 'Electrical and Electronics Engineering', code: 'EEE' },
  { id: 'cm7a1b2c30004abc123456789', name: 'Mechanical Engineering', code: 'MECH' },
  { id: 'cm7a1b2c30005abc123456789', name: 'Aeronautical Engineering', code: 'AERO' },
  { id: 'cm7a1b2c30006abc123456789', name: 'Mechatronics Engineering', code: 'MCT' },
  { id: 'cm7a1b2c30007abc123456789', name: 'Artificial Intelligence and Data Science', code: 'AI&DS' },
  { id: 'cm7a1b2c30008abc123456789', name: 'Computer Science and Business Systems', code: 'CSBS' },
  { id: 'cm7a1b2c30009abc123456789', name: 'Master of Business Administration', code: 'MBA' },
  { id: 'cm7a1b2c30010abc123456789', name: 'Science and Humanities', code: 'S&H' },
]

export function UserManagementSection({ user }: UserManagementSectionProps) {
  const [activeRoleTab, setActiveRoleTab] = useState<'ADMIN' | 'HOD' | 'STAFF' | 'STUDENT'>('ADMIN')
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [deptFilter, setDeptFilter] = useState<string>('ALL')

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [duplicateModalData, setDuplicateModalData] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  // Selected / Editing User
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF',
    departmentId: DEPARTMENTS_LIST[0].id,
    phone: '',
    registerNumber: '',
    employeeId: '',
    mustChangePassword: true,
  })

  const [resetPasswordVal, setResetPasswordVal] = useState('')
  const [showPasswordText, setShowPasswordText] = useState(false)

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResults, setImportResults] = useState<any>(null)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [activeRoleTab, statusFilter, deptFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      let url = `/api/users?role=${activeRoleTab}&limit=200`
      if (deptFilter !== 'ALL') url += `&departmentId=${deptFilter}`

      const res = await fetch(url, {
        headers: {
          'x-user-role': user.role,
          'x-user-department-id': user.departmentId || ''
        }
      })
      const data = await res.json()
      if (data.success) {
        setUsersList(data.users || [])
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter local users by search query and status
  const filteredUsers = usersList.filter(u => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.faculty?.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.student?.[0]?.registerNumber?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'ALL' ||
      (u.status || (u.isActive ? 'ACTIVE' : 'INACTIVE')) === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleOpenAddModal = (defaultRole?: string) => {
    const targetRole = defaultRole || activeRoleTab
    setFormData({
      name: '',
      email: '',
      password: targetRole === 'STUDENT' ? '12345678' : generateTempPassword(),
      role: targetRole,
      departmentId: user.departmentId || DEPARTMENTS_LIST[0].id,
      phone: '',
      registerNumber: '',
      employeeId: '',
      mustChangePassword: true,
    })
    setShowAddModal(true)
  }

  const handleGeneratePassword = () => {
    setFormData(prev => ({ ...prev, password: generateTempPassword() }))
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          callerId: user.id,
          callerName: user.name,
          callerRole: user.role,
          callerDeptId: user.departmentId
        })
      })

      const data = await res.json()

      if (res.status === 409 && data.duplicate) {
        // Account exists
        setDuplicateModalData(data.existingUser)
        setShowAddModal(false)
        return
      }

      if (res.ok && data.success) {
        alert(`Login account created successfully for ${data.user.email}`)
        setShowAddModal(false)
        fetchUsers()
      } else {
        alert(data.error || 'Failed to create user')
      }
    } catch (err: any) {
      alert(err.message || 'Error creating user credentials')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenEditModal = (u: any) => {
    setSelectedUser(u)
    setFormData({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role,
      departmentId: u.departmentId || DEPARTMENTS_LIST[0].id,
      phone: u.phone || '',
      registerNumber: u.student?.[0]?.registerNumber || '',
      employeeId: u.faculty?.employeeId || '',
      mustChangePassword: !!u.mustChangePassword,
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          departmentId: formData.departmentId,
          phone: formData.phone,
          mustChangePassword: formData.mustChangePassword,
          callerRole: user.role,
          callerDeptId: user.departmentId
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        alert('User account updated successfully')
        setShowEditModal(false)
        fetchUsers()
      } else {
        alert(data.error || 'Failed to update user')
      }
    } catch (err: any) {
      alert(err.message || 'Error updating user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (u: any, targetStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          callerRole: user.role,
          callerDeptId: user.departmentId
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        fetchUsers()
      } else {
        alert(data.error || 'Failed to update status')
      }
    } catch (err) {
      alert('Error updating user status')
    }
  }

  const handleOpenResetModal = (u: any) => {
    setSelectedUser(u)
    setResetPasswordVal(generateTempPassword())
    setShowResetModal(true)
  }

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !resetPasswordVal) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: resetPasswordVal,
          mustChangePassword: true,
          callerRole: user.role,
          callerDeptId: user.departmentId
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        alert(`Password for ${selectedUser.email} reset successfully! Temporary password: ${resetPasswordVal}`)
        setShowResetModal(false)
        fetchUsers()
      } else {
        alert(data.error || 'Failed to reset password')
      }
    } catch (err) {
      alert('Error resetting password')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      alert('No user accounts to export')
      return
    }

    const headers = ['ID', 'Name', 'Email', 'Role', 'Department', 'Status', 'Created By', 'Created At', 'Last Login']
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.name}"`,
      `"${u.email}"`,
      u.role,
      `"${u.department?.name || 'N/A'}"`,
      u.status || (u.isActive ? 'ACTIVE' : 'INACTIVE'),
      `"${u.createdBy || 'System'}"`,
      new Date(u.createdAt).toLocaleDateString(),
      u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${activeRoleTab.toLowerCase()}_users_export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) {
      alert('Please select a CSV file to upload')
      return
    }

    try {
      setImporting(true)
      const text = await importFile.text()
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length < 2) {
        alert('CSV file is empty or missing headers')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const obj: any = {}
        headers.forEach((h, idx) => {
          obj[h] = values[idx] || ''
        })
        return obj
      })

      const res = await fetch('/api/users/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows,
          targetRole: activeRoleTab,
          callerRole: user.role,
          callerDeptId: user.departmentId,
          callerName: user.name,
          callerId: user.id
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setImportResults(data)
        fetchUsers()
      } else {
        alert(data.error || 'Bulk import failed')
      }
    } catch (err: any) {
      alert(err.message || 'Error processing CSV file')
    } finally {
      setImporting(false)
    }
  }

  const roleTabConfig = [
    { id: 'ADMIN' as const, label: 'Admin', icon: Shield, badgeColor: 'bg-purple-100 text-purple-800' },
    { id: 'HOD' as const, label: 'HOD', icon: UserCheck, badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 'STAFF' as const, label: 'Staff', icon: BookOpen, badgeColor: 'bg-indigo-100 text-indigo-800' },
    { id: 'STUDENT' as const, label: 'Student', icon: GraduationCap, badgeColor: 'bg-emerald-100 text-emerald-800' },
  ]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-800/40 shadow-xl"
      >
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 backdrop-blur-md flex items-center justify-center border border-indigo-400/30">
              <Lock className="w-5 h-5 text-indigo-300" />
            </div>
            User Management & Login Credentials
          </h2>
          <p className="text-slate-300 mt-1 text-sm">
            Central Database Allocation System • Allocate, manage, and audit all system logins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenAddModal()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-950/50 flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add {activeRoleTab} User
          </Button>
        </div>
      </motion.div>

      {/* Role Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/70 shadow-inner">
          {roleTabConfig.map(tab => {
            const isActive = activeRoleTab === tab.id
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveRoleTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative z-10 flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 select-none ${
                  isActive
                    ? 'text-slate-900 bg-white shadow-md border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder={`Search ${activeRoleTab.toLowerCase()}s...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 bg-white border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>

          {/* Department Filter (For Admin) */}
          {user.role === 'ADMIN' && (
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[200px] truncate"
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS_LIST.map(d => (
                <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
              ))}
            </select>
          )}

          {/* Export Button */}
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center gap-2 px-3.5 py-2 text-sm shadow-sm"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl border border-slate-200/80 bg-white/95 shadow-xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mr-3" />
              <span className="font-semibold text-slate-600">Loading {activeRoleTab} login accounts...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4 border border-indigo-100 text-indigo-600">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No {activeRoleTab} Accounts Found</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
                No user accounts match your search or filter criteria. Click below to create a new login credential.
              </p>
              <Button
                onClick={() => handleOpenAddModal()}
                className="mt-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md px-5 py-2 text-sm"
              >
                <Plus className="w-4 h-4 mr-2" /> Add {activeRoleTab} User
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider">
                    <th className="py-4 px-6">User / Name</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6">Account Status</th>
                    <th className="py-4 px-6">Created By</th>
                    <th className="py-4 px-6">Last Login</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.map(u => {
                    const statusStr = u.status || (u.isActive ? 'ACTIVE' : 'INACTIVE')
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase">
                              {u.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{u.name}</p>
                              {u.faculty?.employeeId && (
                                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {u.faculty.employeeId}</p>
                              )}
                              {u.student?.[0]?.registerNumber && (
                                <p className="text-xs text-slate-500 font-mono mt-0.5">Reg: {u.student[0].registerNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-700 font-semibold">{u.email}</td>
                        <td className="py-4 px-6">
                          <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-extrabold px-3 py-1">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200 text-xs">
                            {u.department?.name || u.department?.code || (u.departmentId ? 'Dept' : 'N/A')}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={
                            statusStr === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs'
                              : statusStr === 'SUSPENDED'
                              ? 'bg-red-100 text-red-800 border border-red-300 font-bold text-xs'
                              : 'bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs'
                          }>
                            {statusStr}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600">
                          <p className="font-semibold text-slate-800">{u.createdBy || 'System'}</p>
                          <p className="text-[11px] text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : <span className="text-slate-400 italic">Never logged in</span>}
                        </td>
                        <td className="py-4 px-6 text-right space-x-1">
                          {/* Edit User */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEditModal(u)}
                            className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Edit User Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>

                          {/* Reset Password */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenResetModal(u)}
                            className="h-8 w-8 p-0 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </Button>

                          {/* Toggle Active / Inactive / Suspended */}
                          {statusStr === 'ACTIVE' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(u, 'INACTIVE')}
                              className="h-8 px-2 text-xs font-bold text-amber-700 hover:bg-amber-100/80 rounded-lg"
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(u, 'ACTIVE')}
                              className="h-8 px-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100/80 rounded-lg"
                            >
                              Activate
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ====== ADD / ALLOCATE LOGIN MODAL ====== */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">Allocate Login Credentials</h3>
                    <p className="text-xs text-slate-500">Central Database • Role: {formData.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Full Name *</label>
                  <Input
                    required
                    type="text"
                    placeholder="e.g. Dr. John Smith / Student Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl border-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Email Address *</label>
                  <Input
                    required
                    type="email"
                    placeholder="e.g. john@niet.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-xl border-slate-200 font-medium font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Role</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="HOD">HOD</option>
                      <option value="STAFF">STAFF</option>
                      <option value="STUDENT">STUDENT</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Department</label>
                    <select
                      value={formData.departmentId}
                      onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 truncate"
                    >
                      {DEPARTMENTS_LIST.map(d => (
                        <option key={d.id} value={d.id}>{d.code}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.role === 'STAFF' || formData.role === 'HOD' ? (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Staff / Employee ID</label>
                    <Input
                      type="text"
                      placeholder="e.g. CSE001"
                      value={formData.employeeId}
                      onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                      className="rounded-xl border-slate-200 font-mono text-sm"
                    />
                  </div>
                ) : formData.role === 'STUDENT' ? (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Register Number</label>
                    <Input
                      type="text"
                      placeholder="e.g. CSE2026001"
                      value={formData.registerNumber}
                      onChange={e => setFormData({ ...formData, registerNumber: e.target.value })}
                      className="rounded-xl border-slate-200 font-mono text-sm"
                    />
                  </div>
                ) : null}

                {/* Password field with Generate Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Password *</label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Generate Temporary Password
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      required
                      type={showPasswordText ? 'text' : 'password'}
                      placeholder="Enter or generate password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="rounded-xl border-slate-200 font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="mustChangePassword"
                    checked={formData.mustChangePassword}
                    onChange={e => setFormData({ ...formData, mustChangePassword: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="mustChangePassword" className="text-xs font-semibold text-slate-700 select-none">
                    Require user to change password on first login
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl text-sm font-bold border-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm px-6 shadow-md"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Login Account
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== RESET PASSWORD MODAL ====== */}
      <AnimatePresence>
        {showResetModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Reset User Password</h3>
                    <p className="text-xs text-slate-500">{selectedUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setShowResetModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Temporary Password</label>
                    <button
                      type="button"
                      onClick={() => setResetPasswordVal(generateTempPassword())}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Re-generate
                    </button>
                  </div>
                  <Input
                    required
                    type="text"
                    value={resetPasswordVal}
                    onChange={e => setResetPasswordVal(e.target.value)}
                    className="rounded-xl border-slate-200 font-mono font-bold text-slate-800"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    User will be required to change this password upon their next login.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setShowResetModal(false)} className="rounded-xl text-sm font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm px-5 shadow-md">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Confirm Reset
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== DUPLICATE ACCOUNT MODAL ====== */}
      <AnimatePresence>
        {duplicateModalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-amber-200 max-w-md w-full p-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">⚠ Account Already Exists</h3>
                <p className="text-slate-600 text-sm mt-1">
                  A user login account with this email address is already registered in the central authentication database.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Name:</span>
                  <span className="font-bold text-slate-900">{duplicateModalData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="font-bold font-mono text-indigo-600">{duplicateModalData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Role:</span>
                  <Badge className="bg-indigo-100 text-indigo-800 font-bold text-xs">{duplicateModalData.role}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Department:</span>
                  <span className="font-bold text-slate-900">{duplicateModalData.departmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Account Status:</span>
                  <Badge className="bg-emerald-100 text-emerald-800 font-bold text-xs">{duplicateModalData.status}</Badge>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  onClick={() => setDuplicateModalData(null)}
                  variant="outline"
                  className="rounded-xl text-sm font-bold border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setActiveRoleTab(duplicateModalData.role)
                    setSearchQuery(duplicateModalData.email)
                    setDuplicateModalData(null)
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm px-5"
                >
                  View Account
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== IMPORT CSV MODAL ====== */}
      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title={`Bulk Import ${activeRoleTab} Records`}
        subtitle={`System Central Auth • Role: ${activeRoleTab}`}
        departmentId={user.departmentId || ''}
        departmentName={user.departmentName || 'Central Administration'}
        importType={activeRoleTab === 'STUDENT' ? 'STUDENT' : 'FACULTY'}
        sampleCSVColumns={
          activeRoleTab === 'STUDENT'
            ? 'registerNumber, name, email, phone, semester, section, cgpa'
            : 'employeeId, name, email, phone, designation, qualification, specialization'
        }
        onImportSuccess={() => fetchUsers()}
      />
    </div>
  )
}
