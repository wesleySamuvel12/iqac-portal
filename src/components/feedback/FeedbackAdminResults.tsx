'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  Star,
  Hash,
  Search,
  ChevronLeft,
  Trash2,
  FileText,
  TrendingUp,
  Award,
  Eye,
  RefreshCw,
  Shield,
  Download,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface AdminResultsProps {
  user: { id: string; role: string; name: string }
}

export function FeedbackAdminResults({ user }: AdminResultsProps) {
  const [forms, setForms] = useState<any[]>([])
  const [loadingForms, setLoadingForms] = useState(true)
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
  const [resultsData, setResultsData] = useState<any | null>(null)
  const [loadingResults, setLoadingResults] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [textSearch, setTextSearch] = useState('')

  const fetchForms = async () => {
    setLoadingForms(true)
    try {
      const res = await fetch(`/api/feedback/forms?view=admin`)
      const json = await res.json()
      if (json.success && json.data) {
        setForms(json.data)
      }
    } catch (err) {
      console.error('Error fetching admin forms:', err)
    } finally {
      setLoadingForms(false)
    }
  }

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchResults = async (formId: string) => {
    setSelectedFormId(formId)
    setLoadingResults(true)
    try {
      const res = await fetch(`/api/feedback/results/${formId}`)
      const json = await res.json()
      if (json.success && json.data) {
        setResultsData(json.data)
      }
    } catch (err) {
      console.error('Error fetching feedback results:', err)
    } finally {
      setLoadingResults(false)
    }
  }

  const handleDeleteForm = async (formId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this feedback form and all its responses?')) {
      return
    }
    try {
      const res = await fetch(`/api/feedback/forms/${formId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        if (selectedFormId === formId) {
          setSelectedFormId(null)
          setResultsData(null)
        }
        fetchForms()
      }
    } catch (err) {
      console.error('Failed to delete form:', err)
    }
  }

  const filteredForms = forms.filter(
    (f) =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.departmentName && f.departmentName.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // VIEW 1: Form Details & Analytics Dashboard
  if (selectedFormId && (loadingResults || resultsData)) {
    if (loadingResults) {
      return (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-slate-200 min-h-[400px]">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Calculating feedback analytics & results...</p>
        </div>
      )
    }

    const { form, summary, questionResults, individualResponses } = resultsData

    return (
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => {
              setSelectedFormId(null)
              setResultsData(null)
            }}
            variant="outline"
            className="bg-white border-slate-200 text-slate-700 font-bold text-xs h-10 px-4 rounded-xl shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Forms List
          </Button>

          <Button
            onClick={(e) => handleDeleteForm(form.id, e)}
            variant="outline"
            className="border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs h-10 px-4 rounded-xl"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Delete Form
          </Button>
        </div>

        {/* Form Overview Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-400/20">
              Target: {form.targetAudience}
            </span>
            {form.departmentName && (
              <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-semibold">
                Dept: {form.departmentName}
              </span>
            )}
            <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-semibold">
              {form.isAnonymous ? '🔒 Anonymous Responses' : '👤 Identified Responses'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{form.title}</h2>
          {form.description && <p className="text-slate-300 text-sm">{form.description}</p>}

          <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">
            Created by {form.createdBy} • Active from {new Date(form.startDate).toLocaleDateString()} to {new Date(form.endDate).toLocaleDateString()}
          </p>
        </div>

        {/* Key Summary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Recipients</p>
            <p className="text-2xl font-extrabold text-slate-900">{summary.totalRecipients}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Responses</p>
            <p className="text-2xl font-extrabold text-indigo-600">{summary.totalResponses}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Response Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-extrabold text-emerald-600">{summary.responsePercentage}%</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${summary.responsePercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Ratings</p>
            <div className="flex items-center gap-3">
              {summary.averageNumberRating !== null && (
                <span className="text-sm font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  #{summary.averageNumberRating}
                </span>
              )}
              {summary.averageStarRating !== null && (
                <span className="text-sm font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {summary.averageStarRating}
                </span>
              )}
              {summary.averageNumberRating === null && summary.averageStarRating === null && (
                <span className="text-xs font-semibold text-slate-400">N/A</span>
              )}
            </div>
          </div>
        </div>

        {/* Question-Wise Detailed Results */}
        <div className="space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Question-Wise Analytics
          </h3>

          <div className="space-y-6">
            {questionResults.map((q: any, idx: number) => (
              <div
                key={q.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-base font-bold text-slate-900">
                    {idx + 1}. {q.prompt}
                  </h4>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                    {q.totalAnswers} Answers
                  </span>
                </div>

                {/* Rating Distribution Charts */}
                {['NUMBER_RATING', 'STAR_RATING', 'NUMBER_SCALE'].includes(q.type) && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Average Score: <strong className="text-indigo-600 text-base">{q.average}</strong></span>
                      <span>Min: {q.min} • Max: {q.max}</span>
                    </div>

                    <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {Object.entries(q.distribution || {}).map(([score, count]: [string, any]) => {
                        const pct = q.totalAnswers > 0 ? Math.round((count / q.totalAnswers) * 100) : 0
                        return (
                          <div key={score} className="flex items-center gap-3 text-xs">
                            <span className="w-12 font-bold text-slate-700">
                              {q.type === 'STAR_RATING' ? `${score} ★` : `Score ${score}`}
                            </span>
                            <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-16 text-right font-semibold text-slate-600">
                              {count} ({pct}%)
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Choice Frequency Charts */}
                {['YES_NO', 'SINGLE_CHOICE', 'DROPDOWN', 'MULTIPLE_CHOICE', 'CHECKBOX'].includes(q.type) && (
                  <div className="space-y-2 pt-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {Object.entries(q.optionCounts || {}).map(([option, count]: [string, any]) => {
                      const pct = q.totalAnswers > 0 ? Math.round((count / q.totalAnswers) * 100) : 0
                      return (
                        <div key={option} className="flex items-center gap-3 text-xs">
                          <span className="w-36 font-semibold text-slate-800 line-clamp-1">
                            {option}
                          </span>
                          <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden">
                            <div
                              className="bg-teal-600 h-full rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-16 text-right font-semibold text-slate-600">
                            {count} ({pct}%)
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Text Responses Table */}
                {['TEXT', 'LONG_TEXT'].includes(q.type) && (
                  <div className="space-y-3">
                    {q.textResponses && q.textResponses.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {q.textResponses.map((tr: any) => (
                          <div
                            key={tr.answerId}
                            className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                          >
                            <p className="text-slate-800 font-medium whitespace-pre-wrap">{tr.text}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50">
                              <span>By: <strong>{tr.respondentName}</strong> ({tr.respondentRole})</span>
                              <span>{tr.submittedAt ? new Date(tr.submittedAt).toLocaleString() : ''}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No text responses submitted yet.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Individual Submissions Audit Log */}
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" /> Submissions Audit Log ({individualResponses.length})
          </h3>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Respondent</th>
                    <th className="p-4">Role / Dept</th>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {individualResponses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        No responses submitted yet.
                      </td>
                    </tr>
                  ) : (
                    individualResponses.map((ir: any) => (
                      <tr key={ir.responseId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-900">
                          {ir.user.name}
                          {ir.user.registerNumber && (
                            <span className="block text-[10px] font-normal text-slate-500">
                              Reg: {ir.user.registerNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                            {ir.user.role}
                          </span>
                          <span className="block text-[10px] text-slate-500">{ir.user.department}</span>
                        </td>
                        <td className="p-4 text-slate-500">
                          {new Date(ir.submittedAt).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px]">
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // VIEW 2: List of Created Feedback Forms for Admin
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-400/20">
              Admin Portal
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Feedback Results & Analytics
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            View real-time response rates, average ratings, question-wise visual distribution charts, and individual user submissions.
          </p>
        </div>

        <Button
          onClick={fetchForms}
          variant="outline"
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs h-10 px-4 rounded-xl"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loadingForms ? 'animate-spin' : ''}`} /> Refresh Results
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search feedback forms by title or department..."
          className="pl-10 bg-white border-slate-200 h-11 text-xs rounded-2xl shadow-sm"
        />
      </div>

      {/* Forms List */}
      {loadingForms ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 min-h-[300px]">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading created feedback forms...</p>
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 text-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Feedback Forms Created</h3>
          <p className="text-slate-500 text-xs max-w-sm mt-1">
            Create your first feedback form using the Feedback Creator module to start receiving responses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredForms.map((f) => (
            <motion.div
              key={f.id}
              whileHover={{ y: -3 }}
              onClick={() => fetchResults(f.id)}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Audience: {f.targetAudience}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      f.status === 'EXPIRED'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {f.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {f.title}
                </h3>
                {f.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">{f.description}</p>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Recipients</p>
                    <p className="text-sm font-extrabold text-slate-800">{f.totalRecipients}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Responses</p>
                    <p className="text-sm font-extrabold text-indigo-600">{f.totalResponses}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Rate</p>
                    <p className="text-sm font-extrabold text-emerald-600">{f.responsePercentage}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-slate-400">
                    Questions: {f.questionCount} • Created: {new Date(f.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={(e) => handleDeleteForm(f.id, e)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="bg-indigo-600 group-hover:bg-indigo-700 text-white font-bold text-xs rounded-xl h-8 px-3"
                    >
                      View Analytics
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
