import { API_BASE_URL } from '../config'

export interface AuthSession {
  user: {
    id: string
    email: string
    name?: string | null
    isAdmin?: boolean
  }
  expires: string
}

export interface ReminderAction {
  id: string
  title: string
  reminderTime: string
}

interface ReminderResponse {
  actions?: ReminderAction[]
}

export class MobileApiError extends Error {
  constructor(
    public readonly kind: 'network' | 'http' | 'auth',
    message: string,
    public readonly cause?: unknown
  ) {
    super(message)
  }
}

async function request(path: string, init?: RequestInit) {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init?.headers ?? {}),
        Accept: 'application/json',
      },
    })
  } catch (error) {
    throw new MobileApiError('network', 'Cannot reach backend server', error)
  }

  if (!response.ok) {
    throw new MobileApiError('http', `Request failed: ${response.status}`)
  }

  return response
}

async function getCsrfToken(): Promise<string> {
  const response = await request('/api/auth/csrf')
  const data = (await response.json()) as { csrfToken?: string }
  if (!data.csrfToken) throw new Error('Missing csrf token')
  return data.csrfToken
}

export async function login(email: string, password: string) {
  const csrfToken = await getCsrfToken()
  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    json: 'true',
    redirect: 'false',
  })

  const response = await request('/api/auth/callback/credentials', {
    method: 'POST',
    body: body.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  const payload = (await response.json()) as { error?: string; url?: string }
  if (payload.error || payload.url?.includes('error=')) {
    throw new MobileApiError('auth', 'Invalid credentials')
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const response = await request('/api/auth/session')
  const session = (await response.json()) as Partial<AuthSession>
  if (!session?.user?.id) return null
  return session as AuthSession
}

export async function fetchDueReminders() {
  const response = await request('/api/actions/reminders-due')
  const payload = (await response.json()) as ReminderResponse
  return payload.actions ?? []
}

export async function updateExpoPushToken(expoPushToken: string) {
  await request('/api/users/push-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expoPushToken }),
  })
}
