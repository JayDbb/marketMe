import { PostsContent } from '@/components/dashboard/posts-content'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { fetchPostsInbox } from '@/lib/fetch-posts-inbox'
import {
  firstSearchParam,
  parsePostInboxTab,
  parsePostsPage,
  parsePostsPlatform,
} from '@/lib/post-utils'

export default async function PostsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await getAuthenticatedUser()

  if (!user) {
    return redirect('/login')
  }

  const params = (await searchParams) ?? {}
  const tab = parsePostInboxTab(firstSearchParam(params.tab))
  const page = parsePostsPage(firstSearchParam(params.page))
  const query = firstSearchParam(params.q) ?? ''
  const platform = parsePostsPlatform(firstSearchParam(params.platform))

  const inbox = await fetchPostsInbox(user.id, {
    tab,
    page,
    query,
    platform,
  })

  return (
    <PostsContent
      posts={inbox.posts}
      counts={inbox.counts}
      total={inbox.total}
      workspaceTotal={inbox.workspaceTotal}
      page={inbox.page}
      pageSize={inbox.pageSize}
      tab={tab}
      query={query}
      platform={platform}
      loadError={inbox.error}
    />
  )
}
