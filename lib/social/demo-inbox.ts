import type { InboxMessage } from '@/types/social'

export function getDemoInboxMessages(connectionId: string): InboxMessage[] {
  const now = Date.now()
  return [
    {
      id: 'demo-dm-1',
      connectionId,
      platform: 'instagram',
      type: 'dm',
      authorName: 'Alex Rivera',
      authorHandle: 'alexrivera',
      preview: 'Hey! Love your latest post — do you offer…',
      body: 'Hey! Love your latest post — do you offer consultations for small businesses?',
      status: 'unread',
      receivedAt: new Date(now - 1000 * 60 * 12).toISOString(),
    },
    {
      id: 'demo-mention-1',
      connectionId,
      platform: 'instagram',
      type: 'mention',
      authorName: 'Jamie Chen',
      authorHandle: 'jamiecreates',
      preview: '@mybrand this workflow saved me hours!',
      body: '@mybrand this workflow saved me hours! How do you plan content for the week?',
      status: 'unread',
      receivedAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: 'demo-comment-1',
      connectionId,
      platform: 'instagram',
      type: 'comment',
      authorName: 'Taylor Brooks',
      authorHandle: 'taylor.b',
      preview: 'Where can I sign up for the beta?',
      body: 'Where can I sign up for the beta? Looks exactly like what we need.',
      status: 'read',
      receivedAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
      postUrl: 'https://instagram.com/p/demo',
    },
  ]
}
