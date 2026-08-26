'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  Star,
  Hash,
  FileText,
  CheckSquare,
  ChevronDown,
  ListFilter,
  ToggleLeft,
  Sliders,
  AlignLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

export interface QuestionData {
  id: string
  prompt: string
  type:
    | 'NUMBER_RATING'
    | 'STAR_RATING'
    | 'TEXT'
    | 'LONG_TEXT'
    | 'YES_NO'
    | 'SINGLE_CHOICE'
    | 'MULTIPLE_CHOICE'
    | 'DROPDOWN'
    | 'CHECKBOX'
    | 'NUMBER_SCALE'
  isRequired: boolean
  order: number
  options: string[]
  minScale: number
  maxScale: number
}

export const QUESTION_TYPES = [
  { id: 'NUMBER_RATING', label: '1. Number Rating', icon: Hash, desc: 'Configurable min-max rating scale (e.g. 1 to 5)' },
  { id: 'STAR_RATING', label: '2. Star Rating', icon: Star, desc: 'Configurable 1-5 star rating' },
  { id: 'TEXT', label: '3. Short Text Response', icon: FileText, desc: 'Single-line text input' },
  { id: 'LONG_TEXT', label: '4. Long Description', icon: AlignLeft, desc: 'Multi-line textarea input' },
  { id: 'YES_NO', label: '5. Yes / No Choice', icon: ToggleLeft, desc: 'Simple Yes or No response' },
  { id: 'SINGLE_CHOICE', label: '6. Single Choice (Radio)', icon: ListFilter, desc: 'Select one option from a list' },
  { id: 'MULTIPLE_CHOICE', label: '7. Multiple Choice (Checkbox)', icon: CheckSquare, desc: 'Select multiple options' },
  { id: 'DROPDOWN', label: '8. Dropdown Menu', icon: ChevronDown, desc: 'Select one option from a dropdown' },
  { id: 'CHECKBOX', label: '9. Checkbox List', icon: CheckSquare, desc: 'Multiple selectable checkboxes' },
  { id: 'NUMBER_SCALE', label: '10. Number Scale', icon: Sliders, desc: 'Numeric range scale' },
]

interface FeedbackQuestionBuilderProps {
  question: QuestionData
  index: number
  totalCount: number
  onChange: (updated: QuestionData) => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function FeedbackQuestionBuilder({
  question,
  index,
  totalCount,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: FeedbackQuestionBuilderProps) {
  const isChoiceType = [
    'SINGLE_CHOICE',
    'MULTIPLE_CHOICE',
    'DROPDOWN',
    'CHECKBOX',
  ].includes(question.type)

  const isRatingType = ['NUMBER_RATING', 'STAR_RATING', 'NUMBER_SCALE'].includes(question.type)

  const handleAddOption = () => {
    const newOptions = [...question.options, `Option ${question.options.length + 1}`]
    onChange({ ...question, options: newOptions })
  }

  const handleUpdateOption = (optIndex: number, val: string) => {
    const newOptions = [...question.options]
    newOptions[optIndex] = val
    onChange({ ...question, options: newOptions })
  }

  const handleRemoveOption = (optIndex: number) => {
    const newOptions = question.options.filter((_, i) => i !== optIndex)
    onChange({ ...question, options: newOptions })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 relative group"
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100">
            Q{index + 1}
          </span>
          <select
            value={question.type}
            onChange={(e) =>
              onChange({
                ...question,
                type: e.target.value as QuestionData['type'],
                options:
                  ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN', 'CHECKBOX'].includes(
                    e.target.value
                  ) && question.options.length === 0
                    ? ['Option 1', 'Option 2', 'Option 3']
                    : question.options,
              })
            }
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={index === 0}
            onClick={onMoveUp}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 disabled:opacity-30"
            title="Move Up"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={index === totalCount - 1}
            onClick={onMoveDown}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 disabled:opacity-30"
            title="Move Down"
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600"
            title="Duplicate Question"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
            title="Delete Question"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Question Prompt Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Question Prompt <span className="text-rose-500">*</span>
        </label>
        <Input
          type="text"
          value={question.prompt}
          onChange={(e) => onChange({ ...question, prompt: e.target.value })}
          placeholder="e.g. How would you rate the teaching quality?"
          className="w-full bg-slate-50/50 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white transition-all"
        />
      </div>

      {/* Choice Options Builder */}
      {isChoiceType && (
        <div className="space-y-2 pt-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Choice Options
          </label>
          <div className="space-y-2">
            {question.options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 w-4 text-center">
                  {optIdx + 1}.
                </span>
                <Input
                  type="text"
                  value={opt}
                  onChange={(e) => handleUpdateOption(optIdx, e.target.value)}
                  placeholder={`Option ${optIdx + 1}`}
                  className="flex-1 h-9 bg-white border-slate-200 text-xs text-slate-800 rounded-lg"
                />
                {question.options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(optIdx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="mt-2 text-xs font-semibold text-indigo-600 border-indigo-200 bg-white hover:bg-indigo-50 rounded-lg h-8"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Option
          </Button>
        </div>
      )}

      {/* Scale & Rating Settings */}
      {isRatingType && (
        <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Minimum Value
            </label>
            <Input
              type="number"
              min={0}
              max={10}
              value={question.minScale}
              onChange={(e) =>
                onChange({ ...question, minScale: parseInt(e.target.value) || 1 })
              }
              className="h-8 bg-white border-slate-200 text-xs rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Maximum Value ({question.type === 'STAR_RATING' ? 'Stars' : 'Scale'})
            </label>
            <Input
              type="number"
              min={1}
              max={10}
              value={question.maxScale}
              onChange={(e) =>
                onChange({ ...question, maxScale: parseInt(e.target.value) || 5 })
              }
              className="h-8 bg-white border-slate-200 text-xs rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Question Footer Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Switch
            id={`req-${question.id}`}
            checked={question.isRequired}
            onCheckedChange={(checked) => onChange({ ...question, isRequired: checked })}
          />
          <label
            htmlFor={`req-${question.id}`}
            className="text-xs font-semibold text-slate-700 cursor-pointer"
          >
            Required Question
          </label>
        </div>

        <span className="text-[11px] font-medium text-slate-400">
          Type: {QUESTION_TYPES.find((t) => t.id === question.type)?.label.split('.')[1]}
        </span>
      </div>
    </motion.div>
  )
}
