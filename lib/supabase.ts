import { createClient } from '@supabase/supabase-js'

const URL = 'https://sqmluohekelgcbtchgvz.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxbWx1b2hla2VsZ2NidGNoZ3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDUxODQsImV4cCI6MjA4OTg4MTE4NH0.v1s4ra2FHOYHzrDD9IMG9sSvPpy6uDlffy7oiwBXf2U'
const SRK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxbWx1b2hla2VsZ2NidGNoZ3Z6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMwNTE4NCwiZXhwIjoyMDg5ODgxMTg0fQ.geLvgwP0dUZ-Ouc90kIgXHbu-60Wn-DCL2WT6gPAnso'

export const createBrowserClient = () => createClient(URL, KEY)
export const createServerClient = () => createClient(URL, KEY)
export const supabaseAdmin = createClient(URL, process.env.SUPABASE_SERVICE_ROLE_KEY || SRK, {
  auth: { autoRefreshToken: false, persistSession: false }
})