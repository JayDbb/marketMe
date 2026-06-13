import { createClient } from '@supabase/supabase-js'
import { tasks } from '@trigger.dev/sdk/v3'

// Must run this with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and TRIGGER_SECRET_KEY
async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log("Fetching a business profile...")
  const { data: profiles, error } = await supabase.from('business_profiles').select('*').limit(1)
  
  if (error || !profiles || profiles.length === 0) {
    console.error("No business profiles found! You need to create one first.")
    return
  }

  const profile = profiles[0]
  console.log(`Found profile: ${profile.business_name} (ID: ${profile.id})`)

  console.log("Triggering Trigger.dev job...")
  try {
    const handle = await tasks.trigger('generate-weekly-content', {
      businessProfileId: profile.id,
      startDate: new Date().toISOString()
    }, {
      // Pass the trigger secret key if we are running this outside next dev
      // But typically tasks.trigger reads process.env.TRIGGER_SECRET_KEY
    })

    console.log("✅ Success! Job triggered with ID:", handle.id)
    console.log("Check your Trigger.dev dashboard to see it running!")
  } catch (e) {
    console.error("Failed to trigger job:", e)
  }
}

main()
