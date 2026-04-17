'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type MentorAssignee = {
  id: string
  name: string
  email: string
}

type MentorModeState = {
  assignees: MentorAssignee[]
  targetUser: MentorAssignee | null
  isMentorMode: boolean
}

interface MentorModeContextValue extends MentorModeState {
  hasMentorAccess: boolean
  loading: boolean
  setTargetUserId: (targetUserId: string | null) => Promise<boolean>
  refresh: () => Promise<void>
}

const emptyState: MentorModeState = {
  assignees: [],
  targetUser: null,
  isMentorMode: false,
}

const MentorModeContext = createContext<MentorModeContextValue>({
  ...emptyState,
  hasMentorAccess: false,
  loading: false,
  setTargetUserId: async () => false,
  refresh: async () => {},
})

export function MentorModeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MentorModeState>(emptyState)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/mentor-mode', { cache: 'no-store' })
      if (!res.ok) {
        setState(emptyState)
        return
      }
      const nextState = (await res.json()) as MentorModeState
      setState(nextState)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setTargetUserId = useCallback(async (targetUserId: string | null) => {
    setLoading(true)
    try {
      const res = await fetch('/api/mentor-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      })
      if (!res.ok) return false
      const nextState = (await res.json()) as MentorModeState
      setState(nextState)
      return true
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      hasMentorAccess: state.assignees.length > 0,
      loading,
      setTargetUserId,
      refresh,
    }),
    [loading, refresh, setTargetUserId, state]
  )

  return <MentorModeContext.Provider value={value}>{children}</MentorModeContext.Provider>
}

export function useMentorMode() {
  return useContext(MentorModeContext)
}
