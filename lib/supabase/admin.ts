import { createClient } from '@supabase/supabase-js'

// This client uses the service role key, meaning it BYPASSES Row Level Security (RLS).
// IT MUST NEVER BE USED ON THE CLIENT SIDE OR EXPOSED TO USERS.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
