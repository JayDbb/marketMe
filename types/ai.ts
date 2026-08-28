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
  /** Optional style constraint (e.g. 'minimalist', 'hyper-realistic') */
  style?: string
  /**
   * User revision instruction from Generate review chat.
   * When set, the job revises image_prompt before generating.
   */
  revisionInstruction?: string
}
