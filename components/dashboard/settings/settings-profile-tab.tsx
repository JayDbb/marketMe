'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, KeyRound, Loader2, Shield, Trash2, UploadCloud } from 'lucide-react'
import {
  changePasswordAction,
  deleteAccountAction,
  removeProfileAvatarAction,
  updateProfileAction,
  uploadProfileAvatarAction,
} from '@/app/dashboard/settings/actions'
import { getInitials } from '@/lib/billing-utils'
import { MAX_AVATAR_UPLOAD_LABEL } from '@/lib/upload-limits'
import { MIN_PASSWORD_LENGTH } from '@/lib/settings-utils'
import { toast } from 'sonner'
import type { SettingsData, SignInMethod } from '@/types/settings'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { useSettingsDirty } from '@/components/dashboard/settings/settings-dirty'
import { SettingsHeading } from '@/components/dashboard/settings/settings-ui'
import { cn } from '@/lib/utils'

const METHOD_LABEL: Record<SignInMethod, string> = {
  google: 'Google',
  password: 'Email & password',
  magic_link: 'Magic link',
}

const METHOD_ICON: Record<SignInMethod, typeof Shield> = {
  google: Shield,
  password: KeyRound,
  magic_link: KeyRound,
}

function SectionDivider() {
  return <div className="border-t border-border" />
}

export function SettingsProfileTab({
  settings,
  onSaved,
  onAvatarUpdated,
}: {
  settings: SettingsData
  onSaved: (name: string) => void
  onAvatarUpdated?: (avatarUrl: string | null) => void
}) {
  const { setDirty } = useSettingsDirty()
  const [name, setName] = useState(settings.displayName)
  const [avatarUrl, setAvatarUrl] = useState(settings.avatarUrl)
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordPending, startPassword] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [deletePending, startDelete] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = getInitials(name || settings.email)
  const isDirty = name.trim() !== settings.displayName.trim()
  useUnsavedChanges(isDirty)

  useEffect(() => {
    setDirty(isDirty)
    return () => setDirty(false)
  }, [isDirty, setDirty])

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

  const handleAvatarPick = () => fileInputRef.current?.click()

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setIsUploading(true)
    const fd = new FormData()
    fd.set('avatar', file)
    const result = await uploadProfileAvatarAction(fd)
    setIsUploading(false)
    if ('error' in result) { toast.error(result.error); return }
    setAvatarUrl(result.avatarUrl)
    onAvatarUpdated?.(result.avatarUrl)
    toast.success('Profile photo updated')
  }

  const handleRemoveAvatar = async () => {
    setIsRemoving(true)
    const result = await removeProfileAvatarAction()
    setIsRemoving(false)
    if ('error' in result) { toast.error(result.error); return }
    setAvatarUrl(null)
    onAvatarUpdated?.(null)
    toast.success('Profile photo removed')
  }

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.set('currentPassword', currentPassword)
    fd.set('newPassword', newPassword)
    fd.set('confirmPassword', confirmPassword)
    startPassword(async () => {
      const result = await changePasswordAction(fd)
      if (result.error) { toast.error(result.error); return }
      toast.success('Password updated. Other sessions were signed out.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    })
  }

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.set('confirmEmail', confirmEmail)
    startDelete(async () => {
      const result = await deleteAccountAction(fd)
      if (result?.error) toast.error(result.error)
    })
  }

  const avatarBusy = isUploading || isRemoving

  return (
    <div className="flex flex-col gap-6">
      <SettingsHeading
        title="Profile"
        description="Your name and photo appear in the sidebar. This is you, not the brand brief."
      />

      {/* Single card shell for identity + sign-in */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* ── Avatar + Name + Email ── */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleAvatarPick}
                disabled={avatarBusy}
                className="group relative size-20 shrink-0 overflow-hidden rounded-2xl border-2 border-border bg-primary transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Profile photo"
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-2xl font-bold text-primary-foreground">
                    {initials}
                  </span>
                )}
                {avatarBusy ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <Loader2 className="size-5 animate-spin text-foreground" />
                  </span>
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <UploadCloud className="size-5 text-foreground" />
                  </span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handleAvatarChange}
                disabled={avatarBusy}
              />
              {avatarUrl ? (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={avatarBusy}
                  className="text-[11px] font-medium text-destructive/80 transition-colors hover:text-destructive"
                >
                  Remove photo
                </button>
              ) : (
                <span className="text-[11px] text-muted-foreground">
                  Max {MAX_AVATAR_UPLOAD_LABEL}
                </span>
              )}
            </div>

            {/* Name + Email fields */}
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                  Display name
                </Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Lee…"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={settings.email}
                  disabled
                  autoComplete="email"
                  spellCheck={false}
                  className="h-11 cursor-not-allowed rounded-xl opacity-60"
                />
                <p className="text-[11px] text-muted-foreground">
                  Email is tied to how you signed in and cannot be changed here.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end border-t border-border bg-muted/30 px-6 py-3">
            <Button
              type="submit"
              disabled={isPending || !name.trim() || !isDirty}
              className="h-9 rounded-xl px-6"
            >
              {isPending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : null}
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>

        <SectionDivider />

        {/* ── Sign-in methods ── */}
        <div className="flex flex-col gap-3 p-6">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Sign-in methods</h3>
          </div>
          <div className="flex flex-col gap-1.5">
            {settings.auth.methods.map((method) => {
              const Icon = METHOD_ICON[method]
              return (
                <div
                  key={method}
                  className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {METHOD_LABEL[method]}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                    <Check className="size-3" />
                    Connected
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Password (only if credential sign-in) ── */}
        {settings.auth.hasPassword ? (
          <>
            <SectionDivider />
            <form onSubmit={handlePassword} className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Change password</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                At least {MIN_PASSWORD_LENGTH} characters. Other sessions will be signed out.
              </p>
              <div className="grid gap-4 sm:max-w-sm">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="currentPassword" className="text-xs text-muted-foreground">
                    Current password
                  </Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="newPassword" className="text-xs text-muted-foreground">
                      New password
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">
                      Confirm
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={
                      passwordPending ||
                      !currentPassword ||
                      newPassword.length < MIN_PASSWORD_LENGTH ||
                      newPassword !== confirmPassword
                    }
                    className="h-9 rounded-xl px-5"
                  >
                    {passwordPending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : null}
                    {passwordPending ? 'Updating…' : 'Update password'}
                  </Button>
                </div>
              </div>
            </form>
          </>
        ) : null}
      </div>

      {/* ── Danger zone (separate, intentionally offset) ── */}
      <div className="rounded-2xl border border-destructive/20 bg-destructive/3 p-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-destructive">Danger zone</h3>
          <p className="text-xs text-muted-foreground">
            Permanently delete your posts, brand brief, Instagram connection, and login.
          </p>
        </div>
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            className={cn(
              'h-9 rounded-xl border-destructive/30 text-destructive',
              'hover:border-destructive hover:bg-destructive hover:text-destructive-foreground'
            )}
            onClick={() => {
              setConfirmEmail('')
              setDeleteOpen(true)
            }}
          >
            <Trash2 className="mr-1.5 size-3.5" />
            Delete account
          </Button>
        </div>
      </div>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleDelete} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Delete this account?</DialogTitle>
              <DialogDescription>
                Posts, the brand brief, Instagram connection, and this login will be
                removed. Type <strong className="text-foreground">{settings.email}</strong> to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmEmail" className="text-xs text-muted-foreground">
                Your email
              </Label>
              <Input
                id="confirmEmail"
                name="confirmEmail"
                type="email"
                autoComplete="off"
                spellCheck={false}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={settings.email}
                className="h-11 rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={
                  deletePending ||
                  confirmEmail.trim().toLowerCase() !== settings.email.trim().toLowerCase()
                }
                className="rounded-xl"
              >
                {deletePending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : null}
                {deletePending ? 'Deleting…' : 'Delete account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
