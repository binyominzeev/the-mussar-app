import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const { searchParams } = new URL(req.url)
  const weeksBack = parseInt(searchParams.get('weeks') || '1')

  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const start = new Date()
  start.setDate(start.getDate() - weeksBack * 7)
  start.setHours(0, 0, 0, 0)

  const checkins = await prisma.checkin.findMany({
    where: { userId, date: { gte: start, lte: end } },
    include: { action: { include: { focus: { include: { goal: true } } } } },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(checkins)
}
