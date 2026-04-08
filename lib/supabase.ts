import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'

const SUPABASE_URL = 'https://sqmluohekelgcbtchgvz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxbWx1b2hla2VsZ2NidGNoZ3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDUxODQsImV4cCI6MjA4OTg4MTE4NH0.v1s4ra2FHOYHzrDD9IMG9sSvPpy6uDlffy7oiwBXf2U'

export const createBrowserClient = () => createClientComponentClient({
  supabaseUrl: SUPABASE_URL,
  supabaseKey: SUPABASE_ANON_KEY,
})

export const createServerClient = () => {
  const { cookies } = require('next/headers')
  return createServerComponentClient({ cookies }, {
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
  })
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)