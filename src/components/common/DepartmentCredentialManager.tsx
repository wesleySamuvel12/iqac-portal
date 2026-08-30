'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from '@/lib/store/auth-store'
import { generateTempPassword } from '@/lib/auth-helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Users, GraduationCap, Plus, Search, Upload, Download, RefreshCw,
  Key, Edit3, Trash2, X, Loader2, Eye, EyeOff, Building2, UserPlus,
  FileSpreadsheet, AlertTriangle, Check
} from 'lucide-react'

interface DepartmentCredentialManagerProps {
  user: User
  targetRole: 'STAFF' | 'STUDENT'
  title: string
  subtitle: string
}

export function DepartmentCredentialManager({
  user,
  targetRole,
  title,
  subtitle
}: DepartmentCredentialManagerProps) {
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [duplicateModalData, setDuplicateModalData] = useState<any>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    registerNumber: '',
  })

  const [resetPasswordVal, setResetPasswordVal] = useState('')
  const [showPasswordText, setShowPasswordText] = useState(false)

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResults, setImportResults] = useState<any>(null)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [targetRole, user.departmentId])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/users?role=${targetRole}&departmentId=${user.departmentId}&limit=200`, {
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
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = usersList.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.faculty?.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.student?.[0]?.registerNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      password: generateTempPassword(),
      employeeId: '',
      registerNumber: '',
    })
    setShowAddModal(true)
  }

  const handleGeneratePassword = () => {
    setFormData(prev => ({ ...prev, password: generateTempPassword() }))
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in required fields')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: targetRole,
          departmentId: user.departmentId,
          employeeId: formData.employeeId,
          registerNumber: formData.registerNumber,
          mustChangePassword: true,
          callerId: user.id,
          callerName: user.name,
          callerRole: user.role,
          callerDeptId: user.departmentId
        })
      })

      const data = await res.json()

      if (res.status === 409 && data.duplicate) {
        setDuplicateModalData(data.existingUser)
        setShowAddModal(false)
        return
      }

      if (res.ok && data.success) {
        alert(`${targetRole} login account created successfully!`)
        setShowAddModal(false)
        fetchUsers()
      } else {
        alert(data.error || 'Failed to create login account')
      }
    } catch (err: any) {
      alert(err.message || 'Error creating account')
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

  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) return

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
          targetRole,
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
        alert(data.error || 'Import failed')
      }
    } catch (err: any) {
      alert(err.message || 'Error processing CSV file')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            {targetRole === 'STAFF' ? <Users className="w-5 h-5 text-indigo-600" /> : <GraduationCap className="w-5 h-5 text-blue-600" />}
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 font-bold text-xs">
            Dept: {user.departmentName || 'Your Department'}
          </Badge>
          <Button
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs px-4 py-2 shadow-sm flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Create {targetRole} Login Account
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder={`Search ${targetRole.toLowerCase()} accounts...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border-slate-200 rounded-xl text-sm font-medium"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Total: {filteredUsers.length} Account(s)
        </span>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
              <span className="text-sm font-semibold text-slate-600">Loading credentials...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="font-bold text-slate-800">No {targetRole} login accounts found in your department</p>
              <p className="text-xs text-slate-500 mt-1">Click above to create or allocate credentials for a student/staff member.</p>
              <Button
                onClick={handleOpenAddModal}
                className="mt-4 bg-indigo-600 text-white font-bold rounded-xl text-xs px-4 py-2"
              >
                <Plus className="w-4 h-4 mr-1" /> Create Login Account
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-5">Name</th>
                    <th className="py-3 px-5">Email</th>
                    <th className="py-3 px-5">ID / Reg No</th>
                    <th className="py-3 px-5">Role</th>
                    <th className="py-3 px-5">Department</th>
                    <th className="py-3 px-5">Account Status</th>
                    <th className="py-3 px-5">Created By</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => {
                    const statusStr = u.status || (u.isActive ? 'ACTIVE' : 'INACTIVE')
                    return (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-5 font-bold text-slate-900">{u.name}</td>
                        <td className="py-3.5 px-5 font-mono text-xs text-slate-700">{u.email}</td>
                        <td className="py-3.5 px-5 font-mono text-xs text-slate-600">
                          {u.faculty?.employeeId || u.student?.[0]?.registerNumber || 'N/A'}
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge className="bg-indigo-50 text-indigo-700 font-bold text-xs">{u.role}</Badge>
                        </td>
                        <td className="py-3.5 px-5 text-xs font-semibold text-slate-700">{u.department?.name || user.departmentName}</td>
                        <td className="py-3.5 px-5">
                          <Badge className={statusStr === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 text-xs font-bold' : 'bg-red-100 text-red-800 text-xs font-bold'}>
                            {statusStr}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-slate-500">{u.createdBy || 'System'}</td>
                        <td className="py-3.5 px-5 text-right space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenResetModal(u)}
                            className="h-8 px-2 text-xs font-bold text-amber-700 hover:bg-amber-50"
                            title="Reset Password"
                          >
                            <Key className="w-3.5 h-3.5 mr-1" /> Reset
                          </Button>
                          {statusStr === 'ACTIVE' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(u, 'INACTIVE')}
                              className="h-8 px-2 text-xs font-bold text-red-600 hover:bg-red-50"
                            >
                              Disable
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(u, 'ACTIVE')}
                              className="h-8 px-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                            >
                              Enable
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

      {/* ====== CREATE ACCOUNT MODAL ====== */}
      <AnimatePresence>
        {showAddModal && (
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
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900">Create {targetRole} Login Account</h3>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-3.5 text-sm">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">Name *</label>
                  <Input
                    required
                    type="text"
                    placeholder={targetRole === 'STAFF' ? 'e.g. Dr. John Smith' : 'e.g. Student Name'}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl border-slate-200"
                  />
                </div>

                {targetRole === 'STAFF' ? (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">Staff ID</label>
                    <Input
                      type="text"
                      placeholder="e.g. CSE001"
                      value={formData.employeeId}
                      onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                      className="rounded-xl border-slate-200 font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">Register Number</label>
                    <Input
                      type="text"
                      placeholder="e.g. CSE2026001"
                      value={formData.registerNumber}
                      onChange={e => setFormData({ ...formData, registerNumber: e.target.value })}
                      className="rounded-xl border-slate-200 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">Email *</label>
                  <Input
                    required
                    type="email"
                    placeholder="e.g. user@niet.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-xl border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Password *</label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Generate Password
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <p><strong className="text-slate-700">Department:</strong> {user.departmentName} (Automatically Assigned)</p>
                  <p><strong className="text-slate-700">Role:</strong> {targetRole}</p>
                  <p><strong className="text-slate-700">Account Status:</strong> ACTIVE</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="rounded-xl text-xs font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-indigo-600 text-white font-bold rounded-xl text-xs px-5 shadow-sm">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
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
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900">Reset Password</h3>
                <button onClick={() => setShowResetModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Temporary Password</label>
                    <button
                      type="button"
                      onClick={() => setResetPasswordVal(generateTempPassword())}
                      className="text-xs font-bold text-indigo-600 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Re-generate
                    </button>
                  </div>
                  <Input
                    required
                    type="text"
                    value={resetPasswordVal}
                    onChange={e => setResetPasswordVal(e.target.value)}
                    className="rounded-xl border-slate-200 font-mono font-bold"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowResetModal(false)} className="rounded-xl text-xs font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-amber-600 text-white font-bold rounded-xl text-xs px-5">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
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
                  An account with this email already exists in the central authentication system.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-bold text-slate-900">{duplicateModalData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold font-mono text-indigo-600">{duplicateModalData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Role:</span>
                  <Badge className="bg-indigo-100 text-indigo-800 font-bold text-xs">{duplicateModalData.role}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-slate-900">{duplicateModalData.departmentName}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button onClick={() => setDuplicateModalData(null)} variant="outline" className="rounded-xl text-xs font-bold">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setSearchQuery(duplicateModalData.email)
                    setDuplicateModalData(null)
                  }}
                  className="bg-indigo-600 text-white font-bold rounded-xl text-xs px-4"
                >
                  View Account
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== IMPORT CSV MODAL ====== */}
      <AnimatePresence>
        {showImportModal && (
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
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900">Import CSV - {targetRole} Credentials</h3>
                <button onClick={() => setShowImportModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {importResults ? (
                <div className="space-y-3 text-sm">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800">
                    <p className="font-bold">Import Completed</p>
                    <p className="text-xs mt-1">Created Accounts: {importResults.importedCount}</p>
                    <p className="text-xs">Skipped Rows: {importResults.skippedCount}</p>
                  </div>
                  <Button onClick={() => setShowImportModal(false)} className="bg-indigo-600 text-white font-bold rounded-xl text-xs px-5 float-right">
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCSVImport} className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                    <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">Select CSV File</p>
                    <p className="text-xs text-slate-400 mt-1">Columns: name, email, password, {targetRole === 'STAFF' ? 'staff_id' : 'register_no'}</p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={e => setImportFile(e.target.files?.[0] || null)}
                      className="mt-3 text-xs font-medium text-slate-600 mx-auto block"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowImportModal(false)} className="rounded-xl text-xs font-bold">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={importing || !importFile} className="bg-indigo-600 text-white font-bold rounded-xl text-xs px-5">
                      {importing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                      Import
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
