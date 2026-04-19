'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { PushNotifications } from '@capacitor/push-notifications'

const NOTIFICATION_PREFERENCES_KEY = 'notificationPreferences'
const LAST_FIRED_KEY = 'activityReminder:lastFired'
const REMINDER_POLL_INTERVAL_MS = 60 * 1000

interface ReminderResponse {
  actions?: Array<{ id: string; title: string; reminderTime: string }>
  now?: string
}

function hashNotificationId(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return (hash % 2147483647) + 1
}

function minuteKeyFromIso(isoString: string): string {
  const parsed = new Date(isoString)
  if (Number.isNaN(parsed.getTime())) return isoString.slice(0, 16)
  return parsed.toISOString().slice(0, 16)
}

function ensureNotificationPreferences() {
  const existing = localStorage.getItem(NOTIFICATION_PREFERENCES_KEY)
  if (existing) return

  localStorage.setItem(
    NOTIFICATION_PREFERENCES_KEY,
    JSON.stringify({
      directMessages: true,
      activityReminders: true,
    })
  )
}

function activityRemindersEnabled() {
  const raw = localStorage.getItem(NOTIFICATION_PREFERENCES_KEY)
  if (!raw) return true

  try {
    const parsed = JSON.parse(raw) as { activityReminders?: boolean }
    return parsed.activityReminders !== false
  } catch {
    return true
  }
}

function loadLastFired() {
  const raw = localStorage.getItem(LAST_FIRED_KEY)
  if (!raw) return {} as Record<string, string>
  try {
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {} as Record<string, string>
  }
}

function saveLastFired(state: Record<string, string>) {
  localStorage.setItem(LAST_FIRED_KEY, JSON.stringify(state))
}

async function checkAndFireDueReminders() {
  if (!activityRemindersEnabled()) return
  const isNative = Capacitor.isNativePlatform()
  if (!isNative && Notification.permission !== 'granted') return

  const res = await fetch('/api/actions/reminders-due', { credentials: 'include' })
  if (!res.ok) return

  const data = (await res.json()) as ReminderResponse
  if (!data.actions?.length || !data.now) return

  const minute = minuteKeyFromIso(data.now)
  const lastFired = loadLastFired()

  for (const action of data.actions) {
    const dedupeKey = `${action.id}:${minute}`
    if (lastFired[dedupeKey]) continue

    if (isNative) {
      await LocalNotifications.schedule({
        notifications: [
            {
            id: hashNotificationId(action.id),
            title: 'Activity reminder',
            body: `${action.title} (${action.reminderTime})`,
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      })
    } else {
      new Notification('Activity reminder', {
        body: `${action.title} (${action.reminderTime})`,
        tag: `action-reminder-${action.id}`,
      })
    }
    lastFired[dedupeKey] = data.now
  }

  saveLastFired(lastFired)
}

export function NotificationManager() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    ensureNotificationPreferences()

    if (Capacitor.isNativePlatform()) {
      PushNotifications.requestPermissions()
        .then((permission) => {
          if (permission.receive === 'granted') {
            PushNotifications.register()
          }
        })
        .catch(() => {})

      LocalNotifications.requestPermissions().catch(() => {})
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(async (registration) => {
          if ('periodicSync' in registration) {
            try {
              await (registration as ServiceWorkerRegistration & {
                periodicSync?: { register: (tag: string, options: { minInterval: number }) => Promise<void> }
              }).periodicSync?.register('action-reminders', { minInterval: 15 * 60 * 1000 })
            } catch {
              // Ignore unsupported registration errors.
            }
          } else if ('sync' in registration) {
            try {
              await (registration as ServiceWorkerRegistration & {
                sync?: { register: (tag: string) => Promise<void> }
              }).sync?.register('action-reminders')
            } catch {
              // Ignore unsupported registration errors.
            }
          }
        })
        .catch(() => {})
    }

    const poll = () => {
      checkAndFireDueReminders().catch(() => {})
    }

    poll()
    const interval = window.setInterval(poll, REMINDER_POLL_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [])

  return null
}
