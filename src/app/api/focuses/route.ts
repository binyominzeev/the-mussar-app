import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const goal = await prisma.goal.findUnique({ where: { id: body.goalId } })
  if (!goal || goal.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const focus = await prisma.focus.create({
    data: {
      goalId: body.goalId,
      title: body.title,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    },
  })

  return NextResponse.json(focus)
}
