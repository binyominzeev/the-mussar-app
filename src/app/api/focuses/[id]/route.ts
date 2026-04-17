import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { normalizeWeekdays, weekdaysToCsv } from '@/lib/focusWeekdays'
import { isMentorModeReadOnly } from '@/lib/mentorMode'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (await isMentorModeReadOnly(req, userId)) {
    return NextResponse.json({ error: 'Mentor mode is read-only' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const focus = await prisma.focus.findUnique({ where: { id }, include: { goal: true } })
  if (!focus || focus.goal.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const data: {
    title?: string
    description?: string
    startDate?: Date
    endDate?: Date
    activeWeekdays?: string
    isActive?: boolean
    sortOrder?: number
  } = {}

  if (typeof body.title === 'string') data.title = body.title
  if (typeof body.description === 'string') data.description = body.description
  if (body.startDate) data.startDate = new Date(body.startDate)
  if (body.endDate) data.endDate = new Date(body.endDate)
  if (Array.isArray(body.activeWeekdays)) data.activeWeekdays = weekdaysToCsv(normalizeWeekdays(body.activeWeekdays))
  if (typeof body.isActive === 'boolean') data.isActive = body.isActive
  if (typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder

  const updated = await prisma.focus.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (await isMentorModeReadOnly(req, userId)) {
    return NextResponse.json({ error: 'Mentor mode is read-only' }, { status: 403 })
  }

  const { id } = await params
  const focus = await prisma.focus.findUnique({ where: { id }, include: { goal: true } })
  if (!focus || focus.goal.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.focus.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
