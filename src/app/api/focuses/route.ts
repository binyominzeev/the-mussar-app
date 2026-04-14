import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const userId = (session.user as any).id

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
