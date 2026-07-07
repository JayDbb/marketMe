import { createClient } from '@supabase/supabase-js'
import { tasks } from '@trigger.dev/sdk/v3'

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log("Fetching a valid post from the database...")
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
  
  if (error || !posts || posts.length === 0) {
    console.error("No posts found in the database! Please run `test-ai.ts` first to generate some posts.")
    return
  }

  const post = posts[0]
  console.log(`Found recent post (ID: ${post.id})`)

  console.log("Triggering 'generate-image' Trigger.dev job...")
  try {
    const handle = await tasks.trigger('generate-image', {
      postId: post.id,
      style: "High quality, professional photograph"
    })

    console.log("✅ Success! Job triggered with ID:", handle.id)
    console.log("Check your Trigger.dev dashboard to see the image being generated and uploaded!")
  } catch (e) {
    console.error("Failed to trigger job:", e)
  }
}

main()
