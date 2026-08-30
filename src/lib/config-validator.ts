// Environment & Configuration Validator for Production Readiness
export interface ConfigValidationResult {
  valid: boolean
  missingVars: string[]
  warnings: string[]
}

export function validateEnvironment(): ConfigValidationResult {
  const requiredVars = [
    'DATABASE_URL',
  ]

  const recommendedVars = [
    'DIRECT_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET'
  ]

  const missingVars: string[] = []
  const warnings: string[] = []

  for (const v of requiredVars) {
    if (!process.env[v]) {
      missingVars.push(v)
    }
  }

  for (const v of recommendedVars) {
    if (!process.env[v]) {
      warnings.push(`Recommended environment variable '${v}' is missing.`)
    }
  }

  if (missingVars.length > 0) {
    console.error(`[CONFIG VALIDATION ERROR] Missing mandatory environment variables: ${missingVars.join(', ')}`)
  }

  if (warnings.length > 0) {
    console.warn(`[CONFIG VALIDATION WARNING] Environment warnings: ${warnings.join('; ')}`)
  }

  return {
    valid: missingVars.length === 0,
    missingVars,
    warnings,
  }
}

// Auto-run validation check on import
if (process.env.NODE_ENV === 'production') {
  validateEnvironment()
}
