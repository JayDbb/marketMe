import { PostsContent } from '@/components/dashboard/posts-content'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login')
  }

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('scheduled_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error.message, error.details, error.hint, error.code)
  }

  return (
    <div className="relative min-h-full font-sans">
      <PostsContent initialPosts={posts || []} />
    </div>
  )
}
