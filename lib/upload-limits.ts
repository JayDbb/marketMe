/** Matches Supabase `studio-templates` bucket `file_size_limit` (10 MB). */
export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024

export const MAX_IMAGE_UPLOAD_LABEL = '10 MB'

/** Profile avatars — keep small for fast loads. */
export const MAX_AVATAR_UPLOAD_BYTES = 2 * 1024 * 1024

export const MAX_AVATAR_UPLOAD_LABEL = '2 MB'

export function isWithinImageUploadLimit(sizeBytes: number): boolean {
  return sizeBytes <= MAX_IMAGE_UPLOAD_BYTES
}

export function isWithinAvatarUploadLimit(sizeBytes: number): boolean {
  return sizeBytes <= MAX_AVATAR_UPLOAD_BYTES
}

export const AVATAR_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const
