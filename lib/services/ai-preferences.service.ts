import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  DEFAULT_AI_PREFERENCES,
  isAiProviderPreference,
  isAllowedCaptionModel,
  isAllowedImageModel,
  type UserAiPreferences,
} from '@/lib/ai-models'

export async function getUserAiPreferences(
  userId: string
): Promise<UserAiPreferences> {
  const { data } = await supabaseAdmin
    .from('user_preferences')
    .select('ai_provider, caption_model, image_model')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data) return { ...DEFAULT_AI_PREFERENCES }

  const aiProvider =
    data.ai_provider && isAiProviderPreference(data.ai_provider)
      ? data.ai_provider
      : DEFAULT_AI_PREFERENCES.aiProvider

  const captionModel =
    data.caption_model && isAllowedCaptionModel(data.caption_model)
      ? data.caption_model
      : DEFAULT_AI_PREFERENCES.captionModel

  const imageModel =
    data.image_model && isAllowedImageModel(data.image_model)
      ? data.image_model
      : DEFAULT_AI_PREFERENCES.imageModel

  return { aiProvider, captionModel, imageModel }
}
