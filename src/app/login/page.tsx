'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LoginPage() {
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError(t.login.invalidCredentials)
    } else {
      router.push('/goals')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-4">
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
        </div>

        <h1 className="text-2xl font-semibold text-center mb-2">{t.login.title}</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">{t.login.subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t.login.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.login.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? t.login.signingIn : t.login.signIn}
          </button>
        </form>
      </div>
    </div>
  )
}
