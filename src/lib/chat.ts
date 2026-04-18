import { prisma } from '@/lib/prisma'

type PairType = 'general_mentor' | 'mutual_coach' | 'coach' | 'chavruta' | null

function normalizePairType(type: string): PairType {
  const normalized = type.trim().toLowerCase()
  if (normalized === 'general_mentor') return 'general_mentor'
  if (normalized === 'mutual_coach') return 'mutual_coach'
  if (normalized === 'coach') return 'coach'
  if (normalized === 'chavruta') return 'chavruta'
  return null
}

function isSupportedPairType(type: PairType) {
  return Boolean(type)
}

export async function getChatContactIds(userId: string): Promise<string[]> {
  if (!userId) return []

  const pairs = await prisma.accountabilityPair.findMany({
    where: {
      OR: [{ userId }, { partnerId: userId }],
    },
    select: { userId: true, partnerId: true, type: true },
  })

  const contactIds = new Set<string>()
  for (const pair of pairs) {
    const pairType = normalizePairType(pair.type)
    if (!isSupportedPairType(pairType)) continue
    const otherId = pair.userId === userId ? pair.partnerId : pair.userId
    if (otherId && otherId !== userId) contactIds.add(otherId)
  }

  return Array.from(contactIds)
}

export async function canUsersChat(userId: string, otherUserId: string): Promise<boolean> {
  if (!userId || !otherUserId || userId === otherUserId) return false

  const pair = await prisma.accountabilityPair.findFirst({
    where: {
      OR: [
        { userId, partnerId: otherUserId },
        { userId: otherUserId, partnerId: userId },
      ],
    },
    select: { type: true },
  })

  if (!pair) return false
  return isSupportedPairType(normalizePairType(pair.type))
}
