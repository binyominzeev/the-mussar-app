import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const MENTOR_MODE_COOKIE = 'mentor_view_user_id'

type Assignment = {
  id: string
  name: string
  email: string
}

type PairType = 'general_mentor' | 'mutual_coach' | 'coach' | 'chavruta' | null
type MentorAccessLevel = 'none' | 'read_only' | 'read_write'

function getTargetUserIdFromRequest(req: NextRequest): string | null {
  const value = req.cookies.get(MENTOR_MODE_COOKIE)?.value?.trim()
  if (!value) return null
  if (value.length > 191) return null
  return value
}

function normalizePairType(type: string): PairType {
  const normalized = type.trim().toLowerCase()
  if (normalized === 'general_mentor') return 'general_mentor'
  if (normalized === 'mutual_coach') return 'mutual_coach'
  if (normalized === 'coach') return 'coach'
  if (normalized === 'chavruta') return 'chavruta'
  return null
}

function isMutualType(type: PairType) {
  if (!type) return false
  return type === 'mutual_coach' || type === 'coach' || type === 'chavruta'
}

export async function getMentorAccessLevel(mentorId: string, targetUserId: string): Promise<MentorAccessLevel> {
  if (!mentorId || !targetUserId || mentorId === targetUserId) return 'none'

  const pairs = await prisma.accountabilityPair.findMany({
    where: {
      OR: [
        {
          userId: mentorId,
          partnerId: targetUserId,
        },
        {
          userId: targetUserId,
          partnerId: mentorId,
        },
      ],
    },
    select: { userId: true, partnerId: true, type: true },
  })

  let hasReadOnlyAccess = false
  const hasWriteAccess = pairs.some((pair) => {
    const pairType = normalizePairType(pair.type)
    if (pairType === 'general_mentor') {
      return pair.userId === mentorId && pair.partnerId === targetUserId
    }
    if (isMutualType(pairType)) {
      hasReadOnlyAccess =
        hasReadOnlyAccess ||
        (pair.userId === mentorId && pair.partnerId === targetUserId) ||
        (pair.userId === targetUserId && pair.partnerId === mentorId)
      return false
    }
    return false
  })

  const unsupportedPairTypes = pairs.filter((pair) => !normalizePairType(pair.type)).map((pair) => pair.type)
  if (pairs.length > 0 && unsupportedPairTypes.length === pairs.length) {
    console.warn('[mentor-mode] Rejected mentor check because all pair types are unsupported', {
      mentorId,
      targetUserId,
      pairTypes: pairs.map((pair) => pair.type),
    })
  } else if (pairs.length > 0 && !hasWriteAccess && !hasReadOnlyAccess) {
    console.warn('[mentor-mode] Rejected mentor check because no valid relationship was found', {
      mentorId,
      targetUserId,
      pairTypes: pairs.map((pair) => pair.type),
    })
  }

  if (hasWriteAccess) return 'read_write'
  if (hasReadOnlyAccess) return 'read_only'
  return 'none'
}

export async function canMentorUser(mentorId: string, targetUserId: string): Promise<boolean> {
  return (await getMentorAccessLevel(mentorId, targetUserId)) !== 'none'
}

export async function canMentorWrite(mentorId: string, targetUserId: string): Promise<boolean> {
  return (await getMentorAccessLevel(mentorId, targetUserId)) === 'read_write'
}

export async function getMentorAssignments(mentorId: string): Promise<Assignment[]> {
  const pairs = await prisma.accountabilityPair.findMany({
    where: {
      OR: [{ userId: mentorId }, { partnerId: mentorId }],
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      partner: { select: { id: true, name: true, email: true } },
    },
  })

  console.info('[mentor-mode] Resolving assignments', {
    mentorId,
    pairCount: pairs.length,
    pairSummaries: pairs.map((pair) => ({
      id: pair.id,
      userId: pair.userId,
      partnerId: pair.partnerId,
      type: pair.type,
    })),
  })

  const assignmentMap = new Map<string, Assignment>()
  const skippedPairs: Array<{ pairId: string; reason: string; type: string }> = []
  for (const pair of pairs) {
    const pairType = normalizePairType(pair.type)
    if (!pairType) {
      skippedPairs.push({ pairId: pair.id, reason: 'unsupported_pair_type', type: pair.type })
      continue
    }

    const isMutual = isMutualType(pairType)
    if (pairType === 'general_mentor' && pair.userId !== mentorId) {
      skippedPairs.push({ pairId: pair.id, reason: 'not_mentor_in_one_way_pair', type: pair.type })
      continue
    }

    const target = isMutual
      ? pair.userId === mentorId
        ? pair.partner
        : pair.user
      : pair.partner

    if (!target) {
      skippedPairs.push({ pairId: pair.id, reason: 'missing_target_user', type: pair.type })
      continue
    }
    if (target.id === mentorId) {
      skippedPairs.push({ pairId: pair.id, reason: 'self_target', type: pair.type })
      continue
    }

    assignmentMap.set(target.id, {
      id: target.id,
      name: target.name ?? '',
      email: target.email ?? '',
    })
  }

  const assignments = Array.from(assignmentMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  console.info('[mentor-mode] Resolved assignments result', {
    mentorId,
    assignmentCount: assignments.length,
    assignments: assignments.map((assignment) => assignment.id),
    skippedPairs,
  })

  return assignments
}

export async function getMentorModeTargetUserId(req: NextRequest, userId: string): Promise<string | null> {
  const targetUserId = getTargetUserIdFromRequest(req)
  if (!targetUserId || targetUserId === userId) return null
  const accessLevel = await getMentorAccessLevel(userId, targetUserId)
  return accessLevel === 'none' ? null : targetUserId
}

export async function resolveReadUserId(req: NextRequest, userId: string): Promise<string> {
  const targetUserId = await getMentorModeTargetUserId(req, userId)
  return targetUserId ?? userId
}

export async function isMentorModeReadOnly(req: NextRequest, userId: string): Promise<boolean> {
  const targetUserId = await getMentorModeTargetUserId(req, userId)
  if (!targetUserId) return false
  return !(await canMentorWrite(userId, targetUserId))
}

export async function resolveWriteUserId(req: NextRequest, userId: string): Promise<string | null> {
  const targetUserId = await getMentorModeTargetUserId(req, userId)
  if (!targetUserId) return userId
  return (await canMentorWrite(userId, targetUserId)) ? targetUserId : null
}
