'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface SettingsDirtyContextValue {
  isDirty: boolean
  setDirty: (value: boolean) => void
  confirmLeave: () => boolean
}

const SettingsDirtyContext = createContext<SettingsDirtyContextValue | null>(null)

export function SettingsDirtyProvider({ children }: { children: ReactNode }) {
  const [isDirty, setDirty] = useState(false)

  const confirmLeave = useCallback(() => {
    if (!isDirty) return true
    return window.confirm('You have unsaved changes. Leave this tab?')
  }, [isDirty])

  return (
    <SettingsDirtyContext.Provider value={{ isDirty, setDirty, confirmLeave }}>
      {children}
    </SettingsDirtyContext.Provider>
  )
}

export function useSettingsDirty() {
  const ctx = useContext(SettingsDirtyContext)
  if (!ctx) {
    throw new Error('useSettingsDirty must be used within SettingsDirtyProvider')
  }
  return ctx
}
