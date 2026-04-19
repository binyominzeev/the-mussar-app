const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

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

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.headers ?? {}),
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
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
    callbackUrl: `${API_BASE_URL}/goals`,
  })

  await request('/api/auth/callback/credentials', {
    method: 'POST',
    body: body.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
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
