import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resolveReadUserId } from '@/lib/mentorMode'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const readUserId = await resolveReadUserId(req, userId)

  const { searchParams } = new URL(req.url)
  const weeksBack = parseInt(searchParams.get('weeks') || '1')

  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const start = new Date()
  start.setDate(start.getDate() - weeksBack * 7)
  start.setHours(0, 0, 0, 0)

  const checkins = await prisma.checkin.findMany({
    where: { userId: readUserId, date: { gte: start, lte: end } },
    include: { action: { include: { focus: { include: { goal: true } } } } },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(checkins)
}
