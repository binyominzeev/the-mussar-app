import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const MENTOR_MODE_COOKIE = 'mentor_view_user_id'

type Assignment = {
  id: string
  name: string
  email: string
}

function getTargetUserIdFromRequest(req: NextRequest): string | null {
  const value = req.cookies.get(MENTOR_MODE_COOKIE)?.value?.trim()
  if (!value) return null
  if (value.length > 191) return null
  return value
}

function isMutualType(type: string) {
  return type === 'mutual_coach' || type === 'coach' || type === 'chavruta'
}

export async function canMentorUser(mentorId: string, targetUserId: string): Promise<boolean> {
  if (!mentorId || !targetUserId || mentorId === targetUserId) return false

  const relationship = await prisma.accountabilityPair.findFirst({
    where: {
      OR: [
        {
          userId: mentorId,
          partnerId: targetUserId,
          type: 'general_mentor',
        },
        {
          OR: [
            { userId: mentorId, partnerId: targetUserId },
            { userId: targetUserId, partnerId: mentorId },
          ],
          type: { in: ['mutual_coach', 'coach', 'chavruta'] },
        },
      ],
    },
    select: { id: true },
  })

  return Boolean(relationship)
}

export async function getMentorAssignments(mentorId: string): Promise<Assignment[]> {
  const pairs = await prisma.accountabilityPair.findMany({
    where: {
      OR: [
        { userId: mentorId, type: 'general_mentor' },
        {
          OR: [{ userId: mentorId }, { partnerId: mentorId }],
          type: { in: ['mutual_coach', 'coach', 'chavruta'] },
        },
      ],
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      partner: { select: { id: true, name: true, email: true } },
    },
  })

  const assignmentMap = new Map<string, Assignment>()
  for (const pair of pairs) {
    const isMutual = isMutualType(pair.type)
    const target = isMutual
      ? pair.userId === mentorId
        ? pair.partner
        : pair.user
      : pair.partner

    if (!target || target.id === mentorId) continue
    assignmentMap.set(target.id, { id: target.id, name: target.name, email: target.email })
  }

  return Array.from(assignmentMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getMentorModeTargetUserId(req: NextRequest, userId: string): Promise<string | null> {
  const targetUserId = getTargetUserIdFromRequest(req)
  if (!targetUserId || targetUserId === userId) return null
  const allowed = await canMentorUser(userId, targetUserId)
  return allowed ? targetUserId : null
}

export async function resolveReadUserId(req: NextRequest, userId: string): Promise<string> {
  const targetUserId = await getMentorModeTargetUserId(req, userId)
  return targetUserId ?? userId
}

export async function isMentorModeReadOnly(req: NextRequest, userId: string): Promise<boolean> {
  const targetUserId = await getMentorModeTargetUserId(req, userId)
  return Boolean(targetUserId)
}
