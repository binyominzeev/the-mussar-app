import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  canMentorWrite,
  canMentorUser,
  getMentorModeTargetUserId,
  isMentorModeReadOnly,
  getMentorAssignments,
  MENTOR_MODE_COOKIE,
} from '@/lib/mentorMode'
import { getSessionUserId } from '@/lib/session'

async function buildState(req: NextRequest, userId: string) {
  const assignees = await getMentorAssignments(userId)
  const targetUserId = await getMentorModeTargetUserId(req, userId)
  const isReadOnly = await isMentorModeReadOnly(req, userId)
  const targetUser = targetUserId ? assignees.find((item) => item.id === targetUserId) ?? null : null
  console.info('[mentor-mode-api] Built mentor mode state', {
    userId,
    assigneeCount: assignees.length,
    assigneeIds: assignees.map((assignee) => assignee.id),
    cookieTargetUserId: req.cookies.get(MENTOR_MODE_COOKIE)?.value ?? null,
    resolvedTargetUserId: targetUser?.id ?? null,
  })

  return {
    assignees,
    targetUser,
    isMentorMode: Boolean(targetUser),
    isReadOnly,
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) {
    console.warn('[mentor-mode-api] Unauthorized GET request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
  if (!userId) {
    console.warn('[mentor-mode-api] Unauthorized POST request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const targetUserId = typeof body.targetUserId === 'string' ? body.targetUserId : null

  if (targetUserId && targetUserId !== userId) {
    const allowed = await canMentorUser(userId, targetUserId)
    if (!allowed) {
      console.warn('[mentor-mode-api] Rejected mentor mode switch', { userId, targetUserId })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const assignees = await getMentorAssignments(userId)
  const targetUser = targetUserId && targetUserId !== userId ? assignees.find((item) => item.id === targetUserId) ?? null : null
  const isReadOnly = targetUser ? !(await canMentorWrite(userId, targetUser.id)) : false

  const response = NextResponse.json({
    assignees,
    targetUser,
    isMentorMode: Boolean(targetUser),
    isReadOnly,
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
