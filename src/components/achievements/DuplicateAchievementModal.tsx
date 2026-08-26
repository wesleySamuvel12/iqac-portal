'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DuplicateAchievementModalProps {
  isOpen: boolean
  category: string
  title: string
  serialNo: string
  onCancel: () => void
  onContinue: () => void
}

export function DuplicateAchievementModal({
  isOpen,
  category,
  title,
  serialNo,
  onCancel,
  onContinue,
}: DuplicateAchievementModalProps) {
  if (!isOpen) return null

  // Ensure serialNo is 2 digits format (e.g. 02)
  const formattedSerialNo = String(serialNo).padStart(2, '0')

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden"
        >
          {/* Top warning stripe */}
          <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />

          <div className="p-6 sm:p-7 space-y-5">
            {/* Header Icon & Title */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100/80 text-amber-700 rounded-2xl border border-amber-200 shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="text-amber-600">⚠</span> Achievement Already Exists
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  A record with this title is already registered under this category.
                </p>
              </div>
            </div>

            {/* Category Tag */}
            <div className="px-3.5 py-1.5 bg-slate-100 rounded-xl w-fit text-xs font-bold text-slate-700 tracking-wide border border-slate-200">
              {category}
            </div>

            {/* Title & Serial No Details Box */}
            <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-800">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Title:
                </span>
                <p className="text-base font-extrabold text-slate-900 leading-snug break-words">
                  {title}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Serial No:
                </span>
                <span className="text-base font-extrabold text-amber-700 bg-amber-100/90 border border-amber-300 px-3 py-0.5 rounded-lg">
                  {formattedSerialNo}
                </span>
              </div>
            </div>

            {/* Explanatory Note */}
            <p className="text-xs text-slate-500 font-medium">
              Clicking <strong>Continue</strong> will save this new entry without overwriting existing records, preserving Serial No: <strong>{formattedSerialNo}</strong>.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                onClick={onContinue}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-md shadow-amber-500/20"
              >
                Continue
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
