'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export type AdminTabId = 'overview' | 'users' | 'workflows'
export type AdminPlanFilter = 'all' | 'free' | 'pro' | 'team'
export type AdminWorkflowFilter = 'all' | 'active' | 'failed'

export function useAdminUrlState() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tab = (['overview', 'users', 'workflows'].includes(
    searchParams.get('tab') ?? ''
  )
    ? searchParams.get('tab')
    : 'overview') as AdminTabId

  const q = searchParams.get('q') ?? ''
  const plan = (['all', 'free', 'pro', 'team'].includes(
    searchParams.get('plan') ?? ''
  )
    ? searchParams.get('plan')
    : 'all') as AdminPlanFilter

  const wf = (['all', 'active', 'failed'].includes(searchParams.get('wf') ?? '')
    ? searchParams.get('wf')
    : 'all') as AdminWorkflowFilter

  const userId = searchParams.get('user')

  const setParams = useCallback(
    (
      patch: Partial<{
        tab: AdminTabId
        q: string
        plan: AdminPlanFilter
        wf: AdminWorkflowFilter
        user: string | null
      }>,
      opts?: { replace?: boolean }
    ) => {
      const params = new URLSearchParams(searchParams.toString())

      const nextTab = patch.tab ?? tab
      if (nextTab === 'overview') params.delete('tab')
      else params.set('tab', nextTab)

      const nextQ = patch.q !== undefined ? patch.q : q
      if (!nextQ) params.delete('q')
      else params.set('q', nextQ)

      const nextPlan = patch.plan ?? plan
      if (nextPlan === 'all') params.delete('plan')
      else params.set('plan', nextPlan)

      const nextWf = patch.wf ?? wf
      if (nextWf === 'all') params.delete('wf')
      else params.set('wf', nextWf)

      const nextUser = patch.user !== undefined ? patch.user : userId
      if (!nextUser) params.delete('user')
      else params.set('user', nextUser)

      const qs = params.toString()
      const href = qs ? `${pathname}?${qs}` : pathname
      if (opts?.replace === false) router.push(href, { scroll: false })
      else router.replace(href, { scroll: false })
    },
    [pathname, plan, q, router, searchParams, tab, userId, wf]
  )

  return { tab, q, plan, wf, userId, setParams }
}
