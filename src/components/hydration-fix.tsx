'use client'

import { useEffect } from 'react'

// Suppress console hydration warnings caused by browser extensions injecting DOM attributes (e.g. Bitdefender, Bitwarden, Grammarly)
if (typeof window !== 'undefined') {
  const problematicAttrs = [
    'bis_skin_checked',
    'data-new-gr-c-s-check-loaded',
    'sp_cdn',
    'data-gramm_id',
    'data-lt-tmp-id',
    'cz-shortcut-listen',
  ]

  // Immediately remove extension attributes from existing DOM nodes before hydration completes
  const cleanDOM = () => {
    try {
      const allElements = document.querySelectorAll(
        '[bis_skin_checked], [data-new-gr-c-s-check-loaded], [sp_cdn], [data-gramm_id], [data-lt-tmp-id]'
      )
      allElements.forEach((el) => {
        problematicAttrs.forEach((attr) => {
          if (el.hasAttribute(attr)) {
            el.removeAttribute(attr)
          }
        })
      })
    } catch {
      // Ignore DOM access errors if script runs before DOM is ready
    }
  }

  cleanDOM()

  const originalConsoleError = console.error
  console.error = (...args: unknown[]) => {
    const errorString = args
      .map((arg) => (typeof arg === 'string' ? arg : String(arg)))
      .join(' ')

    // Ignore hydration & runtime errors triggered by browser extension DOM mutations & extension scripts
    const isExtensionError =
      ((errorString.includes('hydration') ||
        errorString.includes('hydrated') ||
        errorString.includes('Hydration')) &&
        problematicAttrs.some((attr) => errorString.includes(attr))) ||
      errorString.includes('chrome-extension://') ||
      errorString.includes('chrome: call method') ||
      errorString.includes('bekkpoinfafbjglppgdobfdeckghdhlo')

    if (isExtensionError) {
      return
    }

    originalConsoleError.apply(console, args)
  }
}

export function HydrationFix() {
  useEffect(() => {
    const problematicAttrs = [
      'bis_skin_checked',
      'data-new-gr-c-s-check-loaded',
      'sp_cdn',
      'data-gramm_id',
      'data-lt-tmp-id',
      'cz-shortcut-listen',
    ]

    const removeExtensionAttributes = () => {
      const allElements = document.querySelectorAll('*')
      allElements.forEach((el) => {
        problematicAttrs.forEach((attr) => {
          if (el.hasAttribute(attr)) {
            el.removeAttribute(attr)
          }
        })
      })

      if (document.documentElement.style.getPropertyValue('--bis_skin_checked')) {
        document.documentElement.style.removeProperty('--bis_skin_checked')
      }
    }

    removeExtensionAttributes()
    const timer = setTimeout(removeExtensionAttributes, 100)

    return () => clearTimeout(timer)
  }, [])

  return null
}

