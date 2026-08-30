// Secure password hashing matching authentication system (SHA-256 with salt)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password.trim() + 'iqac-salt-2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  if (!password || !hashedPassword) return false
  const inputTrim = password.trim()
  const hashTrim = hashedPassword.trim()

  // 1. Direct plain text match
  if (inputTrim === hashTrim) return true

  // 2. SHA-256 salted hash match
  const hashedInput = await hashPassword(inputTrim)
  if (hashedInput === hashTrim) return true

  // 3. Bcrypt hash match if hashedPassword is a bcrypt hash ($2a$, $2b$, $2y$)
  if (hashTrim.startsWith('$2a$') || hashTrim.startsWith('$2b$') || hashTrim.startsWith('$2y$')) {
    try {
      const bcrypt = require('bcryptjs')
      if (bcrypt.compareSync(inputTrim, hashTrim)) return true
    } catch (e) {
      // Ignore if bcryptjs is not loaded
    }
  }

  // 4. Default system password fallback checks (student123, 12345678, staff123, hod123, admin123)
  const commonDefaults = ['student123', '12345678', 'staff123', 'hod123', 'admin123']
  if (commonDefaults.includes(inputTrim)) {
    for (const defPass of commonDefaults) {
      if (inputTrim === defPass) {
        const defHash = await hashPassword(defPass)
        if (hashTrim === defHash || hashTrim === defPass) return true
      }
    }
  }

  return false
}

export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

