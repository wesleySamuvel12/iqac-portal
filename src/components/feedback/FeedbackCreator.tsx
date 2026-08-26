'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Plus,
  Eye,
  Calendar,
  Users,
  Building2,
  GraduationCap,
  Shield,
  Clock,
  Sparkles,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  X,
  Star,
  Check,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  FeedbackQuestionBuilder,
  QuestionData,
} from './FeedbackQuestionBuilder'

interface FeedbackCreatorProps {
  user: { id: string; role: string; name: string }
  onCreatedSuccess?: () => void
}

export function FeedbackCreator({ user, onCreatedSuccess }: FeedbackCreatorProps) {
  // Metadata state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetAudience, setTargetAudience] = useState<
    'ALL' | 'ROLE' | 'DEPARTMENT' | 'BATCH' | 'INDIVIDUAL' | 'MULTIPLE_USERS'
  >('ALL')
  const [targetRole, setTargetRole] = useState<'STUDENT' | 'STAFF' | 'HOD' | 'ADMIN'>('STUDENT')
  const [departmentId, setDepartmentId] = useState('')
  const [batchId, setBatchId] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isMandatory, setIsMandatory] = useState(false)
  const [allowResubmission, setAllowResubmission] = useState(false)

  // Target Metadata from API
  const [meta, setMeta] = useState<{
    departments: { id: string; name: string; code: string }[]
    batches: { id: string; name: string; year: number }[]
    users: { id: string; name: string; email: string; role: string; department?: { name: string } }[]
  }>({
    departments: [],
    batches: [],
    users: [],
  })

  const [loadingMeta, setLoadingMeta] = useState(true)
  const [userSearchQuery, setUserSearchQuery] = useState('')

  // Questions State
  const [questions, setQuestions] = useState<QuestionData[]>([
    {
      id: 'q-1',
      prompt: 'How would you rate the overall teaching and course content quality?',
      type: 'NUMBER_RATING',
      isRequired: true,
      order: 0,
      options: [],
      minScale: 1,
      maxScale: 5,
    },
    {
      id: 'q-2',
      prompt: 'Rate your overall experience with the department facilities',
      type: 'STAR_RATING',
      isRequired: true,
      order: 1,
      options: [],
      minScale: 1,
      maxScale: 5,
    },
    {
      id: 'q-3',
      prompt: 'What improvements or feedback would you suggest?',
      type: 'LONG_TEXT',
      isRequired: false,
      order: 2,
      options: [],
      minScale: 1,
      maxScale: 5,
    },
  ])

  // UI States
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMeta() {
      try {
        const res = await fetch('/api/feedback/recipients-meta')
        const data = await res.json()
        if (data.success) {
          setMeta(data.data)
        }
      } catch (err) {
        console.error('Failed to load recipient meta:', err)
      } finally {
        setLoadingMeta(false)
      }
    }
    fetchMeta()
  }, [])

  // Question manipulation handlers
  const handleAddQuestion = () => {
    const newQ: QuestionData = {
      id: `q-${Date.now()}`,
      prompt: '',
      type: 'NUMBER_RATING',
      isRequired: true,
      order: questions.length,
      options: [],
      minScale: 1,
      maxScale: 5,
    }
    setQuestions([...questions, newQ])
  }

  const handleUpdateQuestion = (index: number, updated: QuestionData) => {
    const updatedQs = [...questions]
    updatedQs[index] = updated
    setQuestions(updatedQs)
  }

  const handleDeleteQuestion = (index: number) => {
    if (questions.length === 1) {
      alert('At least one question is required for a feedback form.')
      return
    }
    const updatedQs = questions.filter((_, i) => i !== index)
    setQuestions(updatedQs)
  }

  const handleDuplicateQuestion = (index: number) => {
    const qToDup = questions[index]
    const dup: QuestionData = {
      ...qToDup,
      id: `q-${Date.now()}`,
      prompt: `${qToDup.prompt} (Copy)`,
      order: index + 1,
    }
    const updatedQs = [...questions]
    updatedQs.splice(index + 1, 0, dup)
    setQuestions(updatedQs)
  }

  const handleMoveQuestion = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= questions.length) return
    const updatedQs = [...questions]
    const temp = updatedQs[index]
    updatedQs[index] = updatedQs[targetIdx]
    updatedQs[targetIdx] = temp
    setQuestions(updatedQs)
  }

  // Handle Form Submission / Sending
  const handleSendFeedback = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!title.trim()) {
      setErrorMessage('Please enter a feedback title.')
      return
    }

    if (!endDate) {
      setErrorMessage('Please specify an end date for feedback submission.')
      return
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].prompt.trim()) {
        setErrorMessage(`Question ${i + 1} requires a question prompt text.`)
        return
      }
    }

    if (targetAudience === 'DEPARTMENT' && !departmentId) {
      setErrorMessage('Please select a targeted Department.')
      return
    }

    if (targetAudience === 'BATCH' && !batchId) {
      setErrorMessage('Please select a targeted Batch.')
      return
    }

    if (
      (targetAudience === 'INDIVIDUAL' || targetAudience === 'MULTIPLE_USERS') &&
      selectedUserIds.length === 0
    ) {
      setErrorMessage('Please select at least one recipient user.')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        title,
        description,
        targetAudience,
        targetRole,
        departmentId: departmentId || undefined,
        batchId: batchId || undefined,
        targetUserIds: selectedUserIds,
        startDate,
        endDate,
        isAnonymous,
        isMandatory,
        allowResubmission,
        createdById: user.id,
        questions,
      }

      const res = await fetch('/api/feedback/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccessMessage(
          `🎉 ${data.message || 'Feedback form sent successfully!'}`
        )
        // Reset form
        setTitle('')
        setDescription('')
        setSelectedUserIds([])
        if (onCreatedSuccess) {
          setTimeout(() => {
            onCreatedSuccess()
          }, 1500)
        }
      } else {
        setErrorMessage(data.error || 'Failed to publish feedback form.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while publishing feedback.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredUsers = meta.users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-400/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Admin Module
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Feedback Form Creator
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Design dynamic role-targeted feedback forms with custom question types, interactive scales, and automated delivery to students, staff, or departments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl font-bold text-sm h-11 px-5"
          >
            <Eye className="w-4 h-4 mr-2 text-indigo-300" /> Live Preview
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSendFeedback}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm h-11 px-6 rounded-xl shadow-lg shadow-emerald-900/30"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">Creating...</span>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Send Feedback
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 font-semibold text-sm"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 font-semibold text-sm"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Info & Targeting */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card 1: Form Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Form Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Feedback Title <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. End Semester Course Evaluation"
                className="bg-slate-50 border-slate-200 rounded-xl text-sm font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Description / Instructions
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide instructions for recipients completing this feedback..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  End Date <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Target Audience */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Users className="w-4 h-4 text-teal-600" /> Target Audience
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Send Feedback To
              </label>
              <select
                value={targetAudience}
                onChange={(e) =>
                  setTargetAudience(
                    e.target.value as
                      | 'ALL'
                      | 'ROLE'
                      | 'DEPARTMENT'
                      | 'BATCH'
                      | 'INDIVIDUAL'
                      | 'MULTIPLE_USERS'
                  )
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="ALL">🌐 All Users across Institution</option>
                <option value="ROLE">🎓 All Users of a Specific Role</option>
                <option value="DEPARTMENT">🏢 Specific Department</option>
                <option value="BATCH">📚 Specific Student Batch</option>
                <option value="INDIVIDUAL">👤 Individual User</option>
                <option value="MULTIPLE_USERS">👥 Multiple Selected Users</option>
              </select>
            </div>

            {/* Sub-selectors depending on targetAudience */}
            {targetAudience === 'ROLE' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Select User Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) =>
                    setTargetRole(e.target.value as any)
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="STUDENT">Students Only</option>
                  <option value="STAFF">Staff Members Only</option>
                  <option value="HOD">HODs Only</option>
                  <option value="ADMIN">Admins Only</option>
                </select>
              </div>
            )}

            {targetAudience === 'DEPARTMENT' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Select Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="">-- Choose Department --</option>
                    {meta.departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Role Filter in Department
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="STUDENT">Students in Department</option>
                    <option value="STAFF">Staff in Department</option>
                    <option value="HOD">HOD in Department</option>
                  </select>
                </div>
              </div>
            )}

            {targetAudience === 'BATCH' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Select Batch
                </label>
                <select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="">-- Choose Batch --</option>
                  {meta.batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.year})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(targetAudience === 'INDIVIDUAL' || targetAudience === 'MULTIPLE_USERS') && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Select Recipient Users ({selectedUserIds.length} selected)
                </label>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <Input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search user by name or email..."
                    className="pl-8 text-xs bg-slate-50 h-9 rounded-xl border-slate-200"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  {filteredUsers.slice(0, 50).map((u) => {
                    const isSelected = selectedUserIds.includes(u.id)
                    return (
                      <div
                        key={u.id}
                        onClick={() => {
                          if (targetAudience === 'INDIVIDUAL') {
                            setSelectedUserIds([u.id])
                          } else {
                            if (isSelected) {
                              setSelectedUserIds(selectedUserIds.filter((id) => id !== u.id))
                            } else {
                              setSelectedUserIds([...selectedUserIds, u.id])
                            }
                          }
                        }}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-indigo-100 text-indigo-900 font-bold'
                            : 'hover:bg-slate-200/60 text-slate-800'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-xs">{u.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {u.role} • {u.department?.name || u.email}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Form Settings Toggles */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="w-4 h-4 text-purple-600" /> Response Options
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Anonymous Responses</p>
                <p className="text-[11px] text-slate-500">Hide respondent name & identity</p>
              </div>
              <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div>
                <p className="text-xs font-bold text-slate-800">Mandatory Submission</p>
                <p className="text-[11px] text-slate-500">Mark feedback as high priority</p>
              </div>
              <Switch checked={isMandatory} onCheckedChange={setIsMandatory} />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div>
                <p className="text-xs font-bold text-slate-800">Allow Resubmission</p>
                <p className="text-[11px] text-slate-500">Recipients can modify response</p>
              </div>
              <Switch checked={allowResubmission} onCheckedChange={setAllowResubmission} />
            </div>
          </div>
        </div>

        {/* Right Column: Question Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-100/70 p-6 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Question Builder ({questions.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Add, edit, reorder, or duplicate questions. All 10 standard question types supported.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleAddQuestion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-md"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Question
              </Button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <FeedbackQuestionBuilder
                  key={q.id}
                  question={q}
                  index={idx}
                  totalCount={questions.length}
                  onChange={(updated) => handleUpdateQuestion(idx, updated)}
                  onDelete={() => handleDeleteQuestion(idx)}
                  onDuplicate={() => handleDuplicateQuestion(idx)}
                  onMoveUp={() => handleMoveQuestion(idx, 'UP')}
                  onMoveDown={() => handleMoveQuestion(idx, 'DOWN')}
                />
              ))}
            </div>

            <div className="pt-3 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddQuestion}
                className="w-full py-3 bg-white hover:bg-indigo-50 border-dashed border-2 border-indigo-200 text-indigo-700 font-bold text-xs rounded-2xl"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Another Question
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold">
                    Recipient View Preview
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {title || 'Untitled Feedback Form'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Due: {new Date(endDate).toLocaleDateString()} • {isAnonymous ? 'Anonymous Response' : 'Identified Response'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {description && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700">
                  {description}
                </div>
              )}

              {/* Render Question Previews */}
              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200/70 space-y-3"
                  >
                    <p className="text-sm font-bold text-slate-900">
                      {idx + 1}. {q.prompt}{' '}
                      {q.isRequired && <span className="text-rose-500">*</span>}
                    </p>

                    {/* Preview controls based on question type */}
                    {q.type === 'NUMBER_RATING' && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {Array.from(
                          { length: q.maxScale - q.minScale + 1 },
                          (_, i) => q.minScale + i
                        ).map((num) => (
                          <div
                            key={num}
                            className="w-10 h-10 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer hover:border-indigo-600 hover:bg-indigo-50"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'STAR_RATING' && (
                      <div className="flex items-center gap-1 pt-1 text-amber-400">
                        {Array.from({ length: q.maxScale || 5 }).map((_, i) => (
                          <Star key={i} className="w-6 h-6 fill-amber-400" />
                        ))}
                      </div>
                    )}

                    {q.type === 'TEXT' && (
                      <Input
                        disabled
                        placeholder="Recipient single-line response..."
                        className="bg-white border-slate-200 text-xs"
                      />
                    )}

                    {q.type === 'LONG_TEXT' && (
                      <textarea
                        disabled
                        rows={3}
                        placeholder="Recipient text description response..."
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs resize-none"
                      />
                    )}

                    {q.type === 'YES_NO' && (
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                          <input type="radio" disabled name={`preview-${q.id}`} /> Yes
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                          <input type="radio" disabled name={`preview-${q.id}`} /> No
                        </label>
                      </div>
                    )}

                    {['SINGLE_CHOICE', 'DROPDOWN'].includes(q.type) && (
                      <div className="space-y-1.5">
                        {q.options.map((opt, i) => (
                          <label key={i} className="flex items-center gap-2 text-xs text-slate-800">
                            <input type="radio" disabled name={`preview-${q.id}`} /> {opt}
                          </label>
                        ))}
                      </div>
                    )}

                    {['MULTIPLE_CHOICE', 'CHECKBOX'].includes(q.type) && (
                      <div className="space-y-1.5">
                        {q.options.map((opt, i) => (
                          <label key={i} className="flex items-center gap-2 text-xs text-slate-800">
                            <input type="checkbox" disabled /> {opt}
                          </label>
                        ))}
                      </div>
                    )}

                    {q.type === 'NUMBER_SCALE' && (
                      <div className="space-y-2">
                        <input type="range" disabled min={q.minScale} max={q.maxScale} className="w-full" />
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                          <span>Min: {q.minScale}</span>
                          <span>Max: {q.maxScale}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-6 rounded-xl"
                >
                  Close Preview
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
