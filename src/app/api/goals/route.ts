import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resolveReadUserId, resolveWriteUserId } from '@/lib/mentorMode'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const readUserId = await resolveReadUserId(req, userId)

  const goals = await prisma.goal.findMany({
    where: { userId: readUserId },
    include: {
      focuses: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
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
  const writeUserId = await resolveWriteUserId(req, userId)
  if (!writeUserId) {
    return NextResponse.json({ error: 'Mentor mode is read-only' }, { status: 403 })
  }

  const body = await req.json()

  const goal = await prisma.goal.create({
    data: {
      userId: writeUserId,
      type: body.type,
      title: body.title,
      description: body.description,
    },
  })

  return NextResponse.json(goal)
}
