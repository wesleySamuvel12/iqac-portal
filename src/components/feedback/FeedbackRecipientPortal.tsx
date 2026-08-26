'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Send,
  X,
  FileText,
  User,
  Calendar,
  Sparkles,
  ChevronRight,
  Shield,
  HelpCircle,
  RefreshCw,
  Hash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface RecipientPortalProps {
  user: {
    id: string
    name: string
    role: string
    departmentId?: string
  }
}

export function FeedbackRecipientPortal({ user }: RecipientPortalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'completed' | 'expired'>('pending')
  const [data, setData] = useState<{
    newPending: any[]
    completed: any[]
    expired: any[]
  }>({
    newPending: [],
    completed: [],
    expired: [],
  })

  const [isLoading, setIsLoading] = useState(true)
  const [selectedForm, setSelectedForm] = useState<any | null>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const fetchFeedback = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/feedback/forms?userId=${user.id}&role=${user.role}`)
      const json = await res.json()
      if (json.success && json.data) {
        setData({
          newPending: Array.isArray(json.data.newPending) ? json.data.newPending : [],
          completed: Array.isArray(json.data.completed) ? json.data.completed : [],
          expired: Array.isArray(json.data.expired) ? json.data.expired : [],
        })
      }
    } catch (err) {
      console.error('Failed to load recipient feedback:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedback()
  }, [user.id])

  const handleOpenForm = (item: any) => {
    setSelectedForm(item)
    setAnswers({})
    setSubmitError(null)
    setSubmitSuccess(false)
  }

  const handleAnswerChange = (qId: string, val: any) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: val,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForm) return
    setSubmitError(null)

    // Validate required questions
    for (const q of selectedForm.questions) {
      if (q.isRequired) {
        const val = answers[q.id]
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          setSubmitError(`Please answer the required question: "${q.prompt}"`)
          return
        }
      }
    }

    setIsSubmitting(true)

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }))

      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: selectedForm.formId,
          userId: user.id,
          answers: formattedAnswers,
        }),
      })

      const json = await res.json()

      if (res.ok && json.success) {
        setSubmitSuccess(true)
        setTimeout(() => {
          setSelectedForm(null)
          fetchFeedback()
        }, 1800)
      } else {
        setSubmitError(json.error || 'Failed to submit feedback response.')
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Network error during feedback submission.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getList = () => {
    if (activeSubTab === 'pending') return data.newPending || []
    if (activeSubTab === 'completed') return data.completed || []
    return data.expired || []
  }

  const currentList = getList()

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              Recipient Portal
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Feedback Center
          </h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            View pending feedback forms requested by administrators, complete ratings, and review your submission history.
          </p>
        </div>

        <Button
          onClick={fetchFeedback}
          variant="outline"
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs h-10 px-4 rounded-xl"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Forms
        </Button>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
        {[
          { id: 'pending', label: 'New / Pending', count: (data?.newPending || []).length, badgeColor: 'bg-amber-500' },
          { id: 'completed', label: 'Completed', count: (data?.completed || []).length, badgeColor: 'bg-emerald-500' },
          { id: 'expired', label: 'Expired', count: (data?.expired || []).length, badgeColor: 'bg-slate-400' },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all relative ${
                isActive
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] text-white font-extrabold ${tab.badgeColor}`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Forms List Container */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 min-h-[300px]">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading feedback forms...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 text-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No {activeSubTab} feedback forms</h3>
          <p className="text-slate-500 text-xs max-w-sm mt-1">
            {activeSubTab === 'pending'
              ? 'You are all caught up! There are no pending feedback requests at this time.'
              : activeSubTab === 'completed'
              ? 'You have not completed any feedback forms yet.'
              : 'There are no expired feedback forms.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((item) => (
            <motion.div
              key={item.assignmentId || item.formId}
              whileHover={{ y: -3 }}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-500" /> {item.createdBy} ({item.createdRole})
                  </span>
                  {activeSubTab === 'pending' && (
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold">
                      Pending Action
                    </span>
                  )}
                  {activeSubTab === 'completed' && (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Submitted
                    </span>
                  )}
                  {activeSubTab === 'expired' && (
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
                      Expired
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">{item.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Due: {new Date(item.endDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> {item.questionCount} Questions
                  </span>
                </div>

                {activeSubTab === 'pending' && (
                  <Button
                    onClick={() => handleOpenForm(item)}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl h-9 px-4 shadow-sm"
                  >
                    Complete Feedback <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                )}

                {activeSubTab === 'completed' && (
                  <span className="text-[11px] font-semibold text-emerald-600">
                    Done on {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Record'}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Interactive Form Completion Modal */}
      <AnimatePresence>
        {selectedForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative border border-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                    Official Feedback Form
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                    {selectedForm.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Requested by {selectedForm.createdBy} • Due Date: {new Date(selectedForm.endDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedForm(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-900">
                    Feedback Submitted Successfully!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Thank you for taking the time to share your feedback. Your response has been recorded.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {selectedForm.description && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700">
                      {selectedForm.description}
                    </div>
                  )}

                  {/* Questions Runner */}
                  <div className="space-y-6">
                    {selectedForm.questions.map((q: any, idx: number) => {
                      const val = answers[q.id]
                      return (
                        <div
                          key={q.id}
                          className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3"
                        >
                          <label className="block text-sm font-bold text-slate-900">
                            {idx + 1}. {q.prompt}{' '}
                            {q.isRequired && <span className="text-rose-500">*</span>}
                          </label>

                          {/* 1. NUMBER RATING */}
                          {q.type === 'NUMBER_RATING' && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {Array.from(
                                { length: (q.maxScale || 5) - (q.minScale || 1) + 1 },
                                (_, i) => (q.minScale || 1) + i
                              ).map((num) => {
                                const isSelected = val === num
                                return (
                                  <button
                                    type="button"
                                    key={num}
                                    onClick={() => handleAnswerChange(q.id, num)}
                                    className={`w-11 h-11 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                                        : 'bg-white text-slate-700 border border-slate-300 hover:border-indigo-500 hover:bg-indigo-50'
                                    }`}
                                  >
                                    {num}
                                  </button>
                                )
                              })}
                            </div>
                          )}

                          {/* 2. STAR RATING */}
                          {q.type === 'STAR_RATING' && (
                            <div className="flex items-center gap-2 pt-1">
                              {Array.from({ length: q.maxScale || 5 }).map((_, i) => {
                                const starNum = i + 1
                                const isFilled = val >= starNum
                                return (
                                  <button
                                    type="button"
                                    key={starNum}
                                    onClick={() => handleAnswerChange(q.id, starNum)}
                                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                                  >
                                    <Star
                                      className={`w-7 h-7 ${
                                        isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                      }`}
                                    />
                                  </button>
                                )
                              })}
                            </div>
                          )}

                          {/* 3. SHORT TEXT */}
                          {q.type === 'TEXT' && (
                            <Input
                              type="text"
                              value={val || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              placeholder="Enter your answer..."
                              className="bg-white border-slate-200 text-xs rounded-xl"
                            />
                          )}

                          {/* 4. LONG TEXT */}
                          {q.type === 'LONG_TEXT' && (
                            <textarea
                              rows={3}
                              value={val || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              placeholder="Enter your detailed response..."
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                            />
                          )}

                          {/* 5. YES / NO */}
                          {q.type === 'YES_NO' && (
                            <div className="flex gap-4 pt-1">
                              {['Yes', 'No'].map((opt) => (
                                <button
                                  type="button"
                                  key={opt}
                                  onClick={() => handleAnswerChange(q.id, opt)}
                                  className={`px-5 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                                    val === opt
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* 6. SINGLE CHOICE / 8. DROPDOWN */}
                          {['SINGLE_CHOICE', 'DROPDOWN'].includes(q.type) && (
                            <div className="space-y-2 pt-1">
                              {q.options.map((opt: string, i: number) => {
                                const isSelected = val === opt
                                return (
                                  <label
                                    key={i}
                                    onClick={() => handleAnswerChange(q.id, opt)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                      isSelected
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      checked={isSelected}
                                      onChange={() => {}}
                                      className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>{opt}</span>
                                  </label>
                                )
                              })}
                            </div>
                          )}

                          {/* 7. MULTIPLE CHOICE / 9. CHECKBOX */}
                          {['MULTIPLE_CHOICE', 'CHECKBOX'].includes(q.type) && (
                            <div className="space-y-2 pt-1">
                              {q.options.map((opt: string, i: number) => {
                                const currentArr: string[] = Array.isArray(val) ? val : []
                                const isChecked = currentArr.includes(opt)
                                return (
                                  <label
                                    key={i}
                                    onClick={() => {
                                      let newArr = [...currentArr]
                                      if (isChecked) {
                                        newArr = newArr.filter((item) => item !== opt)
                                      } else {
                                        newArr.push(opt)
                                      }
                                      handleAnswerChange(q.id, newArr)
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                      isChecked
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {}}
                                      className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>{opt}</span>
                                  </label>
                                )
                              })}
                            </div>
                          )}

                          {/* 10. NUMBER SCALE */}
                          {q.type === 'NUMBER_SCALE' && (
                            <div className="space-y-2 pt-1">
                              <input
                                type="range"
                                min={q.minScale || 1}
                                max={q.maxScale || 10}
                                value={val || q.minScale || 1}
                                onChange={(e) =>
                                  handleAnswerChange(q.id, parseInt(e.target.value))
                                }
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                              <div className="flex justify-between text-xs font-bold text-indigo-700">
                                <span>Min: {q.minScale || 1}</span>
                                <span className="bg-indigo-100 px-3 py-1 rounded-full text-indigo-900">
                                  Selected: {val || q.minScale || 1}
                                </span>
                                <span>Max: {q.maxScale || 10}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Modal Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {selectedForm.isAnonymous ? '🔒 Anonymous submission' : '👤 Identified submission'}
                    </span>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-md"
                    >
                      {isSubmitting ? (
                        'Submitting...'
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" /> Submit Feedback
                        </>
                      )}
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
