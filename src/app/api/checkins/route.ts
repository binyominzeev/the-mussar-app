import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isMentorModeReadOnly, resolveReadUserId } from '@/lib/mentorMode'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const readUserId = await resolveReadUserId(req, userId)

  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get('date')

  const where: {
    userId: string
    date?: { gte: Date; lte: Date }
  } = { userId: readUserId }

  if (dateStr) {
    const date = new Date(dateStr)
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    where.date = { gte: start, lte: end }
  }

  const checkins = await prisma.checkin.findMany({ where, include: { action: true } })
  return NextResponse.json(checkins)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (await isMentorModeReadOnly(req, userId)) {
    return NextResponse.json({ error: 'Mentor mode is read-only' }, { status: 403 })
  }

  const body = await req.json()

  const date = new Date(body.date)
  date.setHours(12, 0, 0, 0)

  const checkin = await prisma.checkin.upsert({
    where: {
      userId_date_actionId: {
        userId,
        date,
        actionId: body.actionId,
      },
    },
    update: { value: String(body.value) },
    create: {
      userId,
      date,
      actionId: body.actionId,
      value: String(body.value),
    },
  })

  return NextResponse.json(checkin)
}
