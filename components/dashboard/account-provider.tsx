'use client'

import { createContext, useContext } from 'react'
import type { AccountContext } from '@/types/billing'

const AccountContextValue = createContext<AccountContext | null>(null)

export function AccountProvider({
  account,
  children,
}: {
  account: AccountContext
  children: React.ReactNode
}) {
  return (
    <AccountContextValue.Provider value={account}>
      {children}
    </AccountContextValue.Provider>
  )
}

export function useAccount(): AccountContext {
  const account = useContext(AccountContextValue)
  if (!account) {
    throw new Error('useAccount must be used within AccountProvider')
  }
  return account
}
