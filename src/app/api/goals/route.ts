import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const goals = await prisma.goal.findMany({
    where: { userId },
    include: {
      focuses: {
        include: { actions: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(goals)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const goal = await prisma.goal.create({
    data: {
      userId,
      type: body.type,
      title: body.title,
      description: body.description,
    },
  })

  return NextResponse.json(goal)
}
