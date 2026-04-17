import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  canMentorUser,
  getMentorAssignments,
  getMentorModeTargetUserId,
  MENTOR_MODE_COOKIE,
} from '@/lib/mentorMode'
import { getSessionUserId } from '@/lib/session'

async function buildState(req: NextRequest, userId: string) {
  const assignees = await getMentorAssignments(userId)
  const targetUserId = await getMentorModeTargetUserId(req, userId)
  const targetUser = targetUserId ? assignees.find((item) => item.id === targetUserId) ?? null : null

  return {
    assignees,
    targetUser,
    isMentorMode: Boolean(targetUser),
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const state = await buildState(req, userId)
  const response = NextResponse.json(state)
  if (!state.isMentorMode && req.cookies.get(MENTOR_MODE_COOKIE)) {
    response.cookies.delete(MENTOR_MODE_COOKIE)
  }
  return response
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const targetUserId = typeof body.targetUserId === 'string' ? body.targetUserId : null

  if (targetUserId && targetUserId !== userId) {
    const allowed = await canMentorUser(userId, targetUserId)
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const assignees = await getMentorAssignments(userId)
  const targetUser = targetUserId && targetUserId !== userId ? assignees.find((item) => item.id === targetUserId) ?? null : null

  const response = NextResponse.json({
    assignees,
    targetUser,
    isMentorMode: Boolean(targetUser),
  })

  if (targetUserId && targetUserId !== userId) {
    response.cookies.set(MENTOR_MODE_COOKIE, targetUserId, {
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
    })
  } else {
    response.cookies.delete(MENTOR_MODE_COOKIE)
  }

  return response
}
