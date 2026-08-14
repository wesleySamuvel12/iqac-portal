'use client'

import { useEffect } from 'react'

/**
 * Hydration Fix Component
 * 
 * Removes attributes injected by browser extensions (like Bitdefender, ad-blockers, etc.)
 * that cause React hydration mismatch errors.
 * 
 * Common problematic attributes:
 * - bis_skin_checked (Bitdefender)
 * - data-new-gr-c-s-check-loaded (Grammarly)
 * - sp_cdn (SourcePoint/OneTrust)
 */
export function HydrationFix() {
  useEffect(() => {
    // Remove extension-injected attributes after hydration
    const removeExtensionAttributes = () => {
      const problematicAttrs = [
        'bis_skin_checked',
        'data-new-gr-c-s-check-loaded',
        'sp_cdn',
        'data-gramm_id',
        'data-lt-tmp-id'
      ]

      // Remove from all elements
      const allElements = document.querySelectorAll('*')
      allElements.forEach(el => {
        problematicAttrs.forEach(attr => {
          if (el.hasAttribute(attr)) {
            el.removeAttribute(attr)
          }
        })
      })

      // Also clean up any style changes by extensions
      document.documentElement.style.removeProperty('--bis_skin_checked')
    }

    // Run after a short delay to ensure hydration is complete
    const timer = setTimeout(removeExtensionAttributes, 100)

    return () => clearTimeout(timer)
  }, [])

  return null
}
