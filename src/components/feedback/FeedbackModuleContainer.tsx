'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PlusCircle, BarChart3, Inbox, Sparkles } from 'lucide-react'
import { FeedbackCreator } from './FeedbackCreator'
import { FeedbackAdminResults } from './FeedbackAdminResults'
import { FeedbackRecipientPortal } from './FeedbackRecipientPortal'

interface FeedbackModuleContainerProps {
  user: {
    id: string
    name: string
    role: string
    departmentId?: string
  }
}

export function FeedbackModuleContainer({ user }: FeedbackModuleContainerProps) {
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
  const [activeAdminTab, setActiveAdminTab] = useState<'creator' | 'results' | 'portal'>(
    isAdmin ? 'creator' : 'portal'
  )

  if (!isAdmin) {
    return <FeedbackRecipientPortal user={user} />
  }

  return (
    <div className="space-y-6">
      {/* Admin Tab Switcher */}
      <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
        <div className="relative flex gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 shadow-sm">
          {[
            { id: 'creator', label: 'Feedback Creator', icon: PlusCircle },
            { id: 'results', label: 'Results & Analytics', icon: BarChart3 },
            { id: 'portal', label: 'Recipient Portal Preview', icon: Inbox },
          ].map((tab) => {
            const isActive = activeAdminTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  isActive ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Admin Subviews */}
      {activeAdminTab === 'creator' && (
        <FeedbackCreator
          user={user}
          onCreatedSuccess={() => setActiveAdminTab('results')}
        />
      )}

      {activeAdminTab === 'results' && <FeedbackAdminResults user={user} />}

      {activeAdminTab === 'portal' && <FeedbackRecipientPortal user={user} />}
    </div>
  )
}
