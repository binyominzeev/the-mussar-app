'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMentorMode } from '@/contexts/MentorModeContext'

export default function Nav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.isAdmin
  const { language, setLanguage, t } = useLanguage()
  const { assignees, hasMentorAccess, isMentorMode, targetUser, setTargetUserId, loading } = useMentorMode()

  const links = [
    { href: '/goals', label: t.nav.goals },
    { href: '/knowledge', label: t.nav.knowledge },
    { href: '/habits', label: t.nav.habits },
    { href: '/review', label: t.nav.review },
    ...(isAdmin ? [{ href: '/admin', label: t.nav.admin }] : []),
  ]

  const getIcon = (href: string) => {
    const className = 'h-6 w-6'

    switch (href) {
      case '/goals':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
            <path d="M5.25 6.75h13.5" />
            <path d="M5.25 12h13.5" />
            <path d="M5.25 17.25h9.75" />
          </svg>
        )
      case '/knowledge':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
            <path d="M5.25 4.5h10.5a3 3 0 0 1 3 3v12h-12a1.5 1.5 0 0 0-1.5 1.5V6a1.5 1.5 0 0 1 1.5-1.5Z" />
            <path d="M18.75 19.5h-12a1.5 1.5 0 0 0-1.5 1.5" />
          </svg>
        )
      case '/habits':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
            <path d="m8.25 12 2.25 2.25 5.25-5.25" />
            <circle cx="12" cy="12" r="8.25" />
          </svg>
        )
      case '/review':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
            <path d="M8.25 9.75h7.5M8.25 13.5h5.25" />
            <path d="M5.25 4.5h13.5A1.5 1.5 0 0 1 20.25 6v12a1.5 1.5 0 0 1-1.5 1.5H9l-5.25-5.25V6a1.5 1.5 0 0 1 1.5-1.5Z" />
          </svg>
        )
      case '/admin':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
            <path d="m12 3 7.5 3v5.5c0 4.2-2.85 7.95-7.5 9.5-4.65-1.55-7.5-5.3-7.5-9.5V6L12 3Z" />
            <path d="m9.75 12 1.5 1.5 3-3" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <>
      <nav className="hidden md:block border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-12">
          <div className="flex gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium ${
                  pathname === link.href
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-0.5'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {hasMentorAccess && (
              <div className="flex items-center gap-2">
                <label htmlFor="mentor-mode-select" className="text-xs text-gray-500">{t.nav.mentorMode}</label>
                <select
                  id="mentor-mode-select"
                  value={targetUser?.id ?? ''}
                  onChange={(e) => {
                    setTargetUserId(e.target.value || null).catch((error) => {
                      console.error('Failed to switch mentor mode', error)
                    })
                  }}
                  disabled={loading}
                  className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                >
                  <option value="">{t.nav.myWorkspace}</option>
                  {assignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>{assignee.name}</option>
                  ))}
                </select>
              </div>
            )}
            {isMentorMode && <span className="text-[11px] text-amber-600">{t.nav.mentorReadOnly}</span>}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'font-semibold text-gray-900' : 'text-gray-400 hover:text-gray-600'}
              >
                EN
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setLanguage('hu')}
                className={language === 'hu' ? 'font-semibold text-gray-900' : 'text-gray-400 hover:text-gray-600'}
              >
                HU
              </button>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              {t.nav.signOut}
            </button>
          </div>
        </div>
      </nav>

      <div className="md:hidden border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-2 space-y-2">
          {hasMentorAccess && (
            <div className="flex items-center gap-2">
              <label htmlFor="mentor-mode-select-mobile" className="text-[11px] text-gray-500">{t.nav.mentorMode}</label>
              <select
                id="mentor-mode-select-mobile"
                value={targetUser?.id ?? ''}
                onChange={(e) => {
                  setTargetUserId(e.target.value || null).catch((error) => {
                    console.error('Failed to switch mentor mode', error)
                  })
                }}
                disabled={loading}
                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white flex-1"
              >
                <option value="">{t.nav.myWorkspace}</option>
                {assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>{assignee.name}</option>
                ))}
              </select>
            </div>
          )}
          {isMentorMode && <p className="text-[11px] text-amber-600">{t.nav.mentorReadOnly}</p>}
          <div className="h-8 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setLanguage('en')}
              className={language === 'en' ? 'font-semibold text-gray-900' : 'text-gray-400 hover:text-gray-600'}
            >
              EN
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setLanguage('hu')}
              className={language === 'hu' ? 'font-semibold text-gray-900' : 'text-gray-400 hover:text-gray-600'}
            >
              HU
            </button>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {t.nav.signOut}
          </button>
          </div>
        </div>
      </div>

      <nav aria-label="Primary navigation" className="md:hidden fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm z-20">
        <div className="max-w-2xl mx-auto px-2 flex items-stretch">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className={`flex-1 min-w-0 py-2.5 flex flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                  isActive ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {getIcon(link.href)}
                <span className="truncate">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
