'use client'

import { useState, useTransition, useRef } from 'react'
import { useIsClient } from '@/hooks/use-is-client'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UploadCloud, Loader2, Trash2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  updateProfileAction,
  uploadProfileAvatarAction,
  removeProfileAvatarAction,
} from '@/app/dashboard/settings/actions'
import { getInitials } from '@/lib/billing-utils'
import { MAX_AVATAR_UPLOAD_LABEL } from '@/lib/upload-limits'
import { toast } from 'sonner'
import type { SettingsData } from '@/types/settings'

export function SettingsProfileTab({
  settings,
  onSaved,
  onAvatarUpdated,
}: {
  settings: SettingsData
  onSaved: (name: string) => void
  onAvatarUpdated?: (avatarUrl: string | null) => void
}) {
  const [name, setName] = useState(settings.displayName)
  const [avatarUrl, setAvatarUrl] = useState(settings.avatarUrl)
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme, setTheme } = useTheme()
  const mounted = useIsClient()

  const initials = getInitials(name || settings.email)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.set('name', name)
    startTransition(async () => {
      const result = await updateProfileAction(fd)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Profile updated')
      onSaved(name.trim())
    })
  }

  const handleAvatarPick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setIsUploading(true)
    const fd = new FormData()
    fd.set('avatar', file)

    const result = await uploadProfileAvatarAction(fd)
    setIsUploading(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    setAvatarUrl(result.avatarUrl)
    onAvatarUpdated?.(result.avatarUrl)
    toast.success('Profile photo updated')
  }

  const handleRemoveAvatar = async () => {
    setIsRemoving(true)
    const result = await removeProfileAvatarAction()
    setIsRemoving(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    setAvatarUrl(null)
    onAvatarUpdated?.(null)
    toast.success('Profile photo removed')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Profile</h3>
      <p className="text-sm text-zinc-500 dark:text-white/40 mb-6">
        Your name and photo appear in the sidebar and across the dashboard.
      </p>

      <div className="p-6 rounded-2xl bg-white dark:bg-white/4 border border-zinc-200 dark:border-white/8">
        <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-1">Avatar</h4>
        <p className="text-sm text-zinc-500 dark:text-white/40 mb-4">
          JPEG, PNG, WebP, or GIF ? max {MAX_AVATAR_UPLOAD_LABEL}
        </p>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-green-700 shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white font-bold text-2xl">
                  {initials}
                </div>
              )}
              {(isUploading || isRemoving) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm text-zinc-900 dark:text-white">Profile image</p>
              <p className="text-xs text-zinc-500 dark:text-white/40 mt-1">
                {avatarUrl ? 'Shown in your account menu' : 'Upload a photo or use initials'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handleAvatarChange}
              disabled={isUploading || isRemoving}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAvatarPick}
              disabled={isUploading || isRemoving}
              className="gap-2 rounded-xl"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              {avatarUrl ? 'Change' : 'Upload'}
            </Button>
            {avatarUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveAvatar}
                disabled={isUploading || isRemoving}
                className="gap-2 rounded-xl text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-white/4 border border-zinc-200 dark:border-white/8">
        <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-6">Basic information</h4>
        <div className="space-y-5 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs text-zinc-500">
              Display name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="h-11 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs text-zinc-500">
              Email
            </Label>
            <Input
              id="email"
              value={settings.email}
              disabled
              className="h-11 bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 rounded-xl opacity-70 cursor-not-allowed"
            />
            <p className="text-[11px] text-zinc-500 dark:text-white/30">
              Email is managed through your login provider.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-white/4 border border-zinc-200 dark:border-white/8">
        <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-6">Theme</h4>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          {(['light', 'dark'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              className={`p-1 rounded-xl border-2 transition-colors relative ${
                mounted && theme === mode
                  ? 'border-purple-500'
                  : 'border-transparent hover:border-zinc-200 dark:hover:border-white/20'
              }`}
            >
              <div
                className={`aspect-video rounded-lg flex items-center justify-center font-bold border ${
                  mode === 'light'
                    ? 'bg-white text-zinc-950 border-zinc-200'
                    : 'bg-[#0c0c18] text-white border-white/10'
                }`}
              >
                {mode === 'light' ? 'Light' : 'Dark'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/onboarding"
          className="h-11 px-5 inline-flex items-center text-sm font-medium text-purple-400 hover:text-purple-300"
        >
          Edit business profile
        </Link>
        <Button
          type="submit"
          disabled={isPending || !name.trim()}
          className="h-11 px-8 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
