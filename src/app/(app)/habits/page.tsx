'use client'

import GoalTypeDetails from '@/components/GoalTypeDetails'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HabitsPage() {
  const { t } = useLanguage()
  return <GoalTypeDetails type="habits" title={t.nav.habits} />
}
