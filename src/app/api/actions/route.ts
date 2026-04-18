import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resolveWriteUserId } from '@/lib/mentorMode'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const writeUserId = await resolveWriteUserId(req, userId)
  if (!writeUserId) {
    return NextResponse.json({ error: 'Mentor mode is read-only' }, { status: 403 })
  }

  const body = await req.json()

  const focus = await prisma.focus.findUnique({ where: { id: body.focusId }, include: { goal: true } })
  if (!focus || focus.goal.userId !== writeUserId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const action = await prisma.action.create({
    data: {
      focusId: body.focusId,
      title: body.title,
      type: body.type,
    },
  })

  return NextResponse.json(action)
}
