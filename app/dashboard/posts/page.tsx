import { PostsContent } from '@/components/dashboard/posts-content'
import { getUserAndProfile } from '@/lib/user'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'

export default async function PostsPage() {
  const { user } = await getUserAndProfile()
  
  if (!user) {
    return redirect('/login')
  }

  const { data: posts, error } = await supabaseAdmin
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
