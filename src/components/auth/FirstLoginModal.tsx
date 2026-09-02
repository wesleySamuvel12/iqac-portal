'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, useAuthStore } from '@/lib/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Key, ShieldCheck, Eye, EyeOff, Loader2, AlertCircle, LogOut, GraduationCap, CheckCircle2 } from 'lucide-react'

interface FirstLoginModalProps {
  user: User
  onSuccess?: () => void
}

export function FirstLoginModal({ user, onSuccess }: FirstLoginModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const setUser = useAuthStore(state => state.setUser)
  const logout = useAuthStore(state => state.logout)

  const isMinLength = newPassword.length >= 6
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newPassword) {
      setError('Please enter a new password')
      return
    }

    if (!isMinLength) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (!isMatch) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: currentPassword || undefined,
          newPassword
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        // Update user state setting mustChangePassword to false
        setUser({
          ...user,
          mustChangePassword: false
        })
        if (onSuccess) onSuccess()
      } else {
        setError(data.error || 'Failed to change password. Please check your credentials.')
      }
    } catch (err) {
      setError('Network error. Please check your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrator',
    SUPER_ADMIN: 'Super Administrator',
    HOD: 'Head of Department (HOD)',
    STAFF: 'Faculty & Staff Member',
    STUDENT: 'Student'
  }

  const userRoleStr = String(user.role || '').toUpperCase()
  const displayRole = roleLabels[userRoleStr] || userRoleStr || 'User'

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#0B1F3A] via-[#0F284B] to-[#155EEF] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Header Branding */}
      <div className="mb-6 text-center text-white space-y-2 max-w-md w-full">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mb-1">
          <GraduationCap className="w-6 h-6 text-[#06B6D4]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">NIET IQAC ERP PORTAL</h1>
        <p className="text-xs text-slate-300">Noida Institute of Engineering and Technology</p>
      </div>

      {/* Main Standalone Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 sm:p-8 space-y-6"
      >
        <div className="text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100 shadow-inner">
            <Key className="w-7 h-7" />
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-200">
              {displayRole}
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Change Your Password
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Welcome, <strong>{user.name}</strong>! Your account was initialized with a temporary password. For security compliance, please create a new password before continuing.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-xl flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Temporary / Current Password */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Current / Temporary Password
            </label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter current/temporary password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="rounded-xl border-slate-200 font-mono text-sm py-2.5 pr-10 focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Toggle Current Password Visibility"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              New Password *
            </label>
            <div className="relative">
              <Input
                required
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new permanent password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="rounded-xl border-slate-200 font-mono text-sm py-2.5 pr-10 focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Toggle New Password Visibility"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <Input
                required
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="rounded-xl border-slate-200 font-mono text-sm py-2.5 pr-10 focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Toggle Confirm Password Visibility"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Live Validation Checklist */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-3.5 h-3.5 ${isMinLength ? 'text-emerald-500' : 'text-slate-300'}`} />
              <span className={isMinLength ? 'text-slate-800 font-semibold' : ''}>
                At least 6 characters long
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-3.5 h-3.5 ${isMatch ? 'text-emerald-500' : 'text-slate-300'}`} />
              <span className={isMatch ? 'text-slate-800 font-semibold' : ''}>
                Passwords match
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !isMinLength || !isMatch}
            className="w-full bg-[#155EEF] hover:bg-[#124BBF] text-white font-bold rounded-xl py-3 text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Update Password & Open Dashboard</span>
          </Button>
        </form>

        {/* Logout Option */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => logout()}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign out of account</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
