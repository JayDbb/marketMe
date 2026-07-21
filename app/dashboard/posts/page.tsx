import { PostsContent } from '@/components/dashboard/posts-content'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export default async function PostsPage() {
  const user = await getAuthenticatedUser()

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
    <PostsContent
      initialPosts={posts ?? []}
      loadError={error ? 'Could not load posts. Please refresh the page.' : null}
    />
  )
}
