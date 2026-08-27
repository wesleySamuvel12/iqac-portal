'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileSpreadsheet, Download, RefreshCw, Layers, Calendar, 
  UserCheck, Shield, BookOpen, Users, CheckCircle, AlertCircle,
  Filter, Eye, Table as TableIcon, Sparkles, Building2, Check, X,
  GraduationCap, Award, TrendingUp, Briefcase, Handshake
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface User {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'HOD' | 'STAFF' | 'STUDENT'
  departmentId?: string
  departmentName?: string
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

const YEARS = [2027, 2026, 2025, 2024, 2023]

export const IQAC_SECTIONS = [
  { code: 'ALL', label: 'All Sections (A–G)', icon: Layers },
  { code: 'SECTION_A', label: 'A. Academic Activities', icon: BookOpen, type: 'ACADEMIC_ACTIVITIES' },
  { code: 'SECTION_B', label: 'B. Student Development Activities', icon: GraduationCap, type: 'NPTEL_MOOC' },
  { code: 'SECTION_C', label: 'C. Research & Innovation', icon: Award, type: 'JOURNAL_PUBLICATION' },
  { code: 'SECTION_D', label: 'D. Faculty Development', icon: TrendingUp, type: 'TRAINING_PROGRAMME' },
  { code: 'SECTION_E', label: 'E. Students Internship', icon: Briefcase, type: 'INTERNSHIP' },
  { code: 'SECTION_F', label: 'F. Faculty - Industry Interaction', icon: Handshake, type: 'FACULTY_INDUSTRY' },
  { code: 'SECTION_G', label: 'G. Quality Assurance Activities', icon: Shield, type: 'SEMINAR_WORKSHOP' },
]

const ACHIEVEMENT_OPTIONS = [
  { value: 'ALL', label: 'All Achievements (Sections A–G)' },
  { value: 'ACADEMIC_ACTIVITIES', label: 'A. Academic Activities (Syllabus Coverage & Lesson Plan)' },
  { value: 'NPTEL_MOOC', label: 'B. Student Dev - NPTEL / MOOC Courses' },
  { value: 'AWARDS_RECOGNITION', label: 'B. Student Dev - Awards & Recognition' },
  { value: 'CO_CURRICULAR', label: 'B. Student Dev - Co-Curricular Activities' },
  { value: 'PLACEMENT', label: 'B. Student Dev - Placement Records' },
  { value: 'HACKATHON', label: 'B. Student Dev - Hackathon / Ideathon / SIH' },
  { value: 'JOURNAL_PUBLICATION', label: 'C. Research - Journal Publication' },
  { value: 'CONFERENCE_PUBLICATION', label: 'C. Research - Conference Publication' },
  { value: 'PATENT', label: 'C. Research - Patent' },
  { value: 'STARTUP', label: 'C. Research - Startup & Entrepreneurship' },
  { value: 'TRAINING_PROGRAMME', label: 'D. Faculty Dev - Training Programme (FDP)' },
  { value: 'INTERNSHIP', label: 'E. Students Internship & In-Plant Training' },
  { value: 'FACULTY_INDUSTRY', label: 'F. Faculty - Industry Interaction & Consultancy' },
  { value: 'SEMINAR_WORKSHOP', label: 'G. Quality Assurance - Seminar / Workshop' },
]

export function AchievementReportGenerator({ user }: { user: User }) {
  const isStaff = user.role === 'STAFF'
  const isHOD = user.role === 'HOD'
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'

  // Filter State
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    isAdmin ? 'ALL' : (user.departmentId || 'ALL')
  )
  const [fromMonth, setFromMonth] = useState<number>(1)
  const [toMonth, setToMonth] = useState<number>(3)
  const [year, setYear] = useState<number>(2026)
  const [userType, setUserType] = useState<'STUDENT' | 'STAFF' | 'BOTH'>('BOTH')
  const [userList, setUserList] = useState<Array<{ id: string; name: string; type: string }>>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('ALL')
  const [achievementType, setAchievementType] = useState<string>('ALL')

  // Preview State
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false)
  const [downloading, setDownloading] = useState<boolean>(false)
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<{
    success: boolean
    departmentName: string
    datePeriod: string
    roleLabel: string
    generatedDateStr: string
    recordsFound: number
    columnCount: number
    columns: string[]
    rows: any[][]
  } | null>(null)

  // Fetch departments & users list on load or dept/userType change
  useEffect(() => {
    async function loadOptions() {
      try {
        const queryParams = new URLSearchParams({
          departmentId: selectedDeptId,
          userType: userType,
        })
        const res = await fetch(`/api/achievement-reports/options?${queryParams}`)
        const data = await res.json()
        if (data.success) {
          setDepartments(data.departments || [])
          setUserList(data.users || [])
        }
      } catch (err) {
        console.error('Failed to load filter options:', err)
      }
    }
    loadOptions()
  }, [selectedDeptId, userType])

  // Fetch Preview
  const handleFetchPreview = useCallback(async () => {
    setLoadingPreview(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/achievement-reports/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: selectedDeptId,
          fromMonth,
          toMonth,
          year,
          userType,
          targetUserId: selectedUserId,
          achievementType,
          userRole: user.role,
          currentUserId: user.id,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setPreviewData(data)
      } else {
        setErrorMsg(data.error || 'Failed to generate preview')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching report preview')
    } finally {
      setLoadingPreview(false)
    }
  }, [selectedDeptId, fromMonth, toMonth, year, userType, selectedUserId, achievementType, user.role, user.id])

  // Initial preview trigger
  useEffect(() => {
    handleFetchPreview()
  }, [handleFetchPreview])

  // Download Excel / PDF
  const handleDownloadReport = async (format: 'excel' | 'pdf') => {
    if (format === 'pdf') setDownloadingPdf(true)
    else setDownloading(true)

    setErrorMsg(null)
    try {
      const res = await fetch('/api/achievement-reports/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: selectedDeptId,
          fromMonth,
          toMonth,
          year,
          userType,
          targetUserId: selectedUserId,
          achievementType,
          userRole: user.role,
          currentUserId: user.id,
          format,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Download failed: ${errorText}`)
      }

      // Extract filename from disposition header
      const contentDisposition = res.headers.get('Content-Disposition')
      let filename = `Achievement_Report.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/)
        if (match && match[1]) {
          filename = match[1]
        }
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to download ${format.toUpperCase()} report`)
    } finally {
      setDownloading(false)
      setDownloadingPdf(false)
    }
  }

  // Selected department label
  const currentDeptLabel = isAdmin
    ? (selectedDeptId === 'ALL' ? 'All Departments' : (departments.find(d => d.id === selectedDeptId)?.name || 'Department'))
    : (user.departmentName || 'Computer Science and Engineering')

  const renderCellContent = (cell: any, colName: string) => {
    if (cell === null || cell === undefined || cell === '') return <span className="text-slate-300">-</span>
    const strVal = String(cell)

    if (strVal.startsWith('✓')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          {strVal}
        </span>
      )
    }
    if (strVal.startsWith('●')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          {strVal}
        </span>
      )
    }
    if (strVal.startsWith('✕')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          {strVal}
        </span>
      )
    }

    return strVal
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6"
    >
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1F3A] via-[#123B72] to-[#1E3A5F] p-6 sm:p-8 text-white shadow-xl border border-blue-900/40">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white shadow-inner">
                <FileSpreadsheet className="w-8 h-8 shrink-0 text-cyan-300" />
              </span>
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-cyan-300">NEHRU INSTITUTE OF ENGINEERING AND TECHNOLOGY — NIET IQAC</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                  Official Institutional Report Generator
                </h1>
                <p className="text-blue-200/90 text-sm mt-1">
                  Professional Excel Export Engine • Full Field Preservation • Print Ready
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 px-3.5 py-1.5 text-xs font-bold shadow-sm">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              {isStaff ? 'Staff Generator' : isHOD ? 'HOD Generator' : 'Admin Generator'}
            </Badge>
          </div>
        </div>
      </div>

      {/* IQAC 7-Section Category Navigation */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#123B72] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-600" />
            IQAC Official Categories (Sections A–G)
          </span>
          <span className="text-xs text-slate-500 font-medium">Click to filter by IQAC Section</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {IQAC_SECTIONS.map((sec) => {
            const Icon = sec.icon
            const isSelected = sec.code === 'ALL' ? achievementType === 'ALL' : achievementType === sec.type
            return (
              <button
                key={sec.code}
                onClick={() => setAchievementType(sec.code === 'ALL' ? 'ALL' : sec.type)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#0B1F3A] to-[#123B72] text-white ring-2 ring-[#123B72]/30 shadow-md'
                    : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`} />
                <span>{sec.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Control Panel Card */}
      <Card className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-lg">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#123B72]" />
              Report Generation Controls & Parameters
            </CardTitle>
            <Badge variant="outline" className="text-xs text-slate-600 border-slate-300 font-bold">
              User Role: {user.role}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Department */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#123B72]" />
                Department
              </label>
              {isAdmin ? (
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium text-sm focus:ring-2 focus:ring-[#123B72] focus:border-[#123B72] transition-all shadow-sm"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-700 font-bold text-sm flex items-center justify-between shadow-sm cursor-not-allowed">
                  <span>{currentDeptLabel}</span>
                  <Badge variant="secondary" className="text-[10px] bg-slate-200 text-slate-600">
                    Locked to Role
                  </Badge>
                </div>
              )}
            </div>

            {/* 2. From Month */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#123B72]" />
                From Month
              </label>
              <select
                value={fromMonth}
                onChange={(e) => setFromMonth(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium text-sm focus:ring-2 focus:ring-[#123B72] focus:border-[#123B72] transition-all shadow-sm"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. To Month */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#123B72]" />
                To Month
              </label>
              <select
                value={toMonth}
                onChange={(e) => setToMonth(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium text-sm focus:ring-2 focus:ring-[#123B72] focus:border-[#123B72] transition-all shadow-sm"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Year */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#123B72]" />
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium text-sm focus:ring-2 focus:ring-[#123B72] focus:border-[#123B72] transition-all shadow-sm"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. User Type (For HOD & Admin) */}
            {!isStaff && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#123B72]" />
                  User Type
                </label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value as any)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium text-sm focus:ring-2 focus:ring-[#123B72] focus:border-[#123B72] transition-all shadow-sm"
                >
                  <option value="BOTH">Students / Staff / Both</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="STAFF">Staff Only</option>
                </select>
              </div>
            )}

            {/* 6. Specific User (For HOD & Admin) */}
            {!isStaff && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#123B72]" />
                  Specific User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium text-sm focus:ring-2 focus:ring-[#123B72] focus:border-[#123B72] transition-all shadow-sm"
                >
                  <option value="ALL">
                    {userType === 'STUDENT' ? 'All Students' : userType === 'STAFF' ? 'All Staff' : 'All Users'}
                  </option>
                  {userList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 7. Achievement */}
            <div className={isStaff ? 'md:col-span-2 lg:col-span-1' : ''}>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#123B72]" />
                Achievement Category
              </label>
              <select
                value={achievementType}
                onChange={(e) => setAchievementType(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-sm focus:ring-2 focus:ring-[#123B72] focus:border-[#123B72] transition-all shadow-sm"
              >
                {ACHIEVEMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error display */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={handleFetchPreview}
              disabled={loadingPreview}
              className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-slate-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingPreview ? 'animate-spin' : ''}`} />
              Update Preview
            </Button>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => handleDownloadReport('pdf')}
                disabled={downloadingPdf || downloading}
                className="rounded-xl bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white font-bold shadow-lg shadow-emerald-950/20 px-6 py-3"
              >
                {downloadingPdf ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating PDF Document...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2 text-emerald-300" />
                    Generate Official PDF Report (.pdf)
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleDownloadReport('excel')}
                disabled={downloading || downloadingPdf}
                className="rounded-xl bg-gradient-to-r from-[#0B1F3A] via-[#123B72] to-[#1E3A5F] hover:from-[#0B1F3A] hover:to-[#0A2E6D] text-white font-bold shadow-lg shadow-blue-950/20 px-6 py-3"
              >
                {downloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Building Excel Workbook...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2 text-cyan-300" />
                    Generate Official Excel Report (.xlsx)
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Before Download Panel */}
      <Card className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-lg overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/70">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#123B72]/10 rounded-xl text-[#123B72]">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">
                  Report Preview & Verification
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify filters, layout, and complete fields before generating the download
                </p>
              </div>
            </div>

            {/* Metrics Chips */}
            {previewData && (
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1.5">
                  <TableIcon className="w-4 h-4 text-[#123B72]" />
                  Records Found: <span className="text-[#123B72] font-extrabold text-sm">{previewData.recordsFound}</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Columns: <span className="text-indigo-900 font-extrabold text-sm">{previewData.columnCount}</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loadingPreview ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#123B72] mb-3" />
              <p className="font-bold text-slate-600 text-sm">Querying Database & Building Report Preview...</p>
            </div>
          ) : previewData ? (
            <div className="space-y-4">
              {/* Summary Counts Grid if All Achievements is selected */}
              {achievementType === 'ALL' && (
                <div className="p-6 bg-slate-50/80 border-b border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Institutional Achievement Distribution
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Object.entries(previewData.achievementCounts).map(([key, count]) => (
                      <div
                        key={key}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between"
                      >
                        <span className="text-[11px] font-bold text-slate-500 line-clamp-1">
                          {ACHIEVEMENT_OPTIONS.find(o => o.value === key)?.label || key}
                        </span>
                        <span className="text-xl font-extrabold text-[#123B72] mt-1">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Table Preview */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#123B72] text-white">
                      {previewData.columns.map((col, idx) => (
                        <th
                          key={idx}
                          className="px-4 py-3.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap border-b border-blue-900"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.previewRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={previewData.columns.length}
                          className="px-6 py-10 text-center text-slate-400 font-medium"
                        >
                          No matching records found for the selected criteria. All column headers will still be present in Excel.
                        </td>
                      </tr>
                    ) : (
                      previewData.previewRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={rIdx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 hover:bg-slate-100/70'}
                        >
                          {row.map((cell: any, cIdx: number) => (
                            <td key={cIdx} className="px-4 py-3 text-slate-700 whitespace-nowrap font-medium">
                              {renderCellContent(cell, previewData.columns[cIdx])}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Preview Footer note */}
              {previewData.previewRows.length > 0 && achievementType !== 'ALL' && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
                  Showing first {Math.min(10, previewData.previewRows.length)} of {previewData.recordsFound} records in preview.
                  Click <strong className="text-slate-800">Generate Official Excel Report</strong> to download all records with full NIET formatting.
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <Eye className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm">Click "Update Preview" or change filters to load preview data.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
