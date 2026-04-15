'use client'

import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { useEffect, useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [isStandalonePwa, setIsStandalonePwa] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const checkStandaloneMode = () => {
      const iosStandalone = 'standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true
      setIsStandalonePwa(mediaQuery.matches || iosStandalone)
    }

    checkStandaloneMode()
    mediaQuery.addEventListener('change', checkStandaloneMode)

    return () => mediaQuery.removeEventListener('change', checkStandaloneMode)
  }, [])

  return (
    <SessionProvider refetchInterval={isStandalonePwa ? 60 * 60 : 0}>
      <LanguageProvider>{children}</LanguageProvider>
    </SessionProvider>
  )
}
