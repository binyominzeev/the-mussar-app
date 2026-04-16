'use client'

import GoalTypeDetails from '@/components/GoalTypeDetails'
import { useLanguage } from '@/contexts/LanguageContext'

export default function KnowledgePage() {
  const { t } = useLanguage()
  return <GoalTypeDetails type="knowledge" title={t.nav.knowledge} />
}
