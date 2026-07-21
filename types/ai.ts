export interface GenerateWeeklyContentPayload {
  businessProfileId: string
  startDate: string // ISO date string
  userId: string
}

export interface RegenerateCaptionPayload {
  postId: string
  feedback?: string // Optional user feedback on why it was rejected
}

export interface GenerateImagePayload {
  postId: string
  style?: string // Optional style constraint (e.g. 'minimalist', 'hyper-realistic')
}
