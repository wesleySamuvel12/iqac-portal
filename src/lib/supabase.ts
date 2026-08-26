import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://69.164.250.130:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_mGzWIE5opqNvUVUAZKaA8g_fyMwTrnK'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
