/**
 * Contract for MarketMe AI (Render) publish/social endpoints.
 * Frontend is ready; teammate implements these on the FastAPI service.
 *
 * Base: MARKETME_AI_API_URL (e.g. https://marketme-api-9oap.onrender.com)
 */

export const PUBLISH_API_CONTRACT = {
  /** Already live — list connected IG accounts for a business profile. */
  connections: 'GET /api/v1/publish/connections?business_profile_id={uuid}',

  /** Already live — publish a post. */
  publishInstagram: 'POST /api/v1/publish/instagram',

  /**
   * Inbox — list DMs / mentions / comments.
   * Live on Render: GET /api/v1/inbox/messages
   * Frontend also tries /api/v1/publish/inbox as a fallback.
   */
  inboxList: 'GET /api/v1/inbox/messages?business_profile_id={uuid}&platform=instagram',

  inboxReply:
    'POST /api/v1/inbox/messages/{message_id}/reply  body: { business_profile_id, body }',

  inboxMarkRead:
    'PATCH /api/v1/inbox/messages/{message_id}  body: { business_profile_id }',

  /** Conversation threads — list, open, and reply. */
  inboxConversations:
    'GET /api/v1/inbox/conversations?business_profile_id={uuid}&platform=instagram',

  inboxConversation:
    'GET /api/v1/inbox/conversations/{conversation_id}?business_profile_id={uuid}',

  /**
   * Conversation reply. Instagram (#10) on a recent DM means the AI send used the
   * wrong recipient. Do NOT send to conversation.id. Graph requires:
   *
   * POST https://graph.instagram.com/{ig-user-id}/messages
   * Authorization: Bearer {instagram_user_access_token}
   * {
   *   "recipient": { "id": "<IGSID>" },
   *   "message": { "text": "<body>" }
   * }
   *
   * IGSID = InboxConversation.participantId from the messages webhook
   * (GET /api/v1/meta/webhook verify + POST receive). Polling
   * GET /conversations can list threads without opening a send window.
   *
   * Frontend already posts recipient_id on reply. Accept it on ReplyRequest
   * and use it as recipient.id. Optional 7-day human inbox:
   * messaging_type=MESSAGE_TAG, tag=HUMAN_AGENT (Advanced Access).
   */
  inboxConversationReply:
    'POST /api/v1/inbox/conversations/{conversation_id}/reply  body: { business_profile_id, body, recipient_id }',

  metaWebhook: 'GET|POST /api/v1/meta/webhook  subscribe Instagram field: messages',

  /**
   * Creative brief for image generation.
   * Frontend sends brand_colours, preferred_visual_styles, prohibited_visual_elements,
   * and style_hint with Instagram + brand-kit directives.
   */
  creativeGenerate: 'POST /api/v1/creative/generate',

  /**
   * OAuth return (preferred):
   * {FRONTEND_URL}/dashboard/connections?oauth=instagram&status=success|error
   */
  oauthReturnPreferred:
    '/dashboard/connections?oauth=instagram&status=success|error',
} as const

/** Expected shape from GET /api/v1/publish/insights */
export type PublishInsightsPayload = {
  business_profile_id?: string
  platform?: string
  handle?: string | null
  instagram_user_id?: string | null
  /** ISO timestamp of when Meta metrics were fetched */
  fetched_at?: string | null
  period_days?: number | null
  totals?: {
    reach?: number | null
    impressions?: number | null
    likes?: number | null
    comments?: number | null
    saves?: number | null
    shares?: number | null
    profile_views?: number | null
    follower_count?: number | null
  } | null
  /** Best local posting windows inferred from the account */
  best_posting_times?: Array<{
    day?: string
    hour_local?: number
    reason?: string
  }> | null
  /** Top performing posts for prompt injection */
  top_posts?: Array<{
    external_id?: string
    caption_excerpt?: string | null
    media_type?: string | null
    likes?: number | null
    comments?: number | null
    reach?: number | null
    saves?: number | null
    posted_at?: string | null
    why_it_worked?: string | null
  }> | null
  /** Short bullets the frontend can inject into Generate */
  learning_notes?: string[] | null
  raw?: unknown
}
