'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Nav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.isAdmin
  const { language, setLanguage, t } = useLanguage()

  const links = [
    { href: '/', label: t.nav.today },
    { href: '/goals', label: t.nav.goals },
    { href: '/review', label: t.nav.review },
    ...(isAdmin ? [{ href: '/admin', label: t.nav.admin }] : []),
  ]

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
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
  )
}
