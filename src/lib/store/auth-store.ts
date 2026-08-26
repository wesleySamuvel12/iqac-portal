'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'HOD' | 'STAFF' | 'STUDENT'
  departmentId?: string
  departmentName?: string
  avatar?: string
  phone?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  mustChangePassword?: boolean
  createdBy?: string
  createdByRole?: string
  createdById?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isCmsMode: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  cmsLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setCmsMode: (mode: boolean) => void
  isAdmin: () => boolean
  isSuperAdmin: () => boolean
  isHOD: () => boolean
  isStaff: () => boolean
  isStudent: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isCmsMode: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (response.ok && data.success) {
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              isCmsMode: false,
            })
            return { success: true }
          } else {
            set({ isLoading: false })
            return { success: false, error: data.error || 'Login failed' }
          }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: 'Network error. Please try again.' }
        }
      },

      cmsLogin: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/cms-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (response.ok && data.success) {
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              isCmsMode: true,
            })
            return { success: true }
          } else {
            set({ isLoading: false })
            return { success: false, error: data.error || 'CMS Login failed' }
          }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: 'Network error. Please try again.' }
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch (error) {
          // Ignore logout errors
        }
        set({ user: null, isAuthenticated: false, isCmsMode: false })
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (loading) => set({ isLoading: loading }),
      setCmsMode: (mode) => set({ isCmsMode: mode }),

      isAdmin: () => get().user?.role === 'ADMIN',
      isSuperAdmin: () => get().user?.role === 'SUPER_ADMIN',
      isHOD: () => get().user?.role === 'HOD',
      isStaff: () => get().user?.role === 'STAFF',
      isStudent: () => get().user?.role === 'STUDENT',
    }),
    {
      name: 'iqac-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isCmsMode: state.isCmsMode,
      }),
    }
  )
)
