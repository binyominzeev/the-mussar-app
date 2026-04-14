import { Session } from 'next-auth'

/**
 * Returns the authenticated user's id, or null if not available.
 */
export function getSessionUserId(session: Session | null): string | null {
  return session?.user?.id ?? null
}

/**
 * Returns true if the session user is an admin.
 */
export function isSessionAdmin(session: Session | null): boolean {
  return session?.user?.isAdmin === true
}
