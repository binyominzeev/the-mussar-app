import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resolveWriteUserId } from '@/lib/mentorMode'
import { prisma } from '@/lib/prisma'
import { normalizeReminderDays, normalizeReminderTime } from '@/lib/reminders'
import { getSessionUserId } from '@/lib/session'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const writeUserId = await resolveWriteUserId(req, userId)
  if (!writeUserId) {
    return NextResponse.json({ error: 'Mentor mode is read-only' }, { status: 403 })
  }

  const body = await req.json()
  const { id } = await params
  const reminderTime = normalizeReminderTime(body.reminderTime)
  const reminderDays = normalizeReminderDays(body.reminderDays)
  const hasReminderTime = typeof body.reminderTime === 'string' && body.reminderTime.trim().length > 0
  const hasReminderDays =
    (typeof body.reminderDays === 'string' && body.reminderDays.trim().length > 0) ||
    (Array.isArray(body.reminderDays) && body.reminderDays.length > 0)

  if ((hasReminderTime && !reminderTime) || (hasReminderDays && !reminderDays)) {
    return NextResponse.json({ error: 'Invalid reminder format' }, { status: 400 })
  }
  if ((reminderTime && !reminderDays) || (!reminderTime && reminderDays)) {
    return NextResponse.json({ error: 'reminderTime and reminderDays must be set together' }, { status: 400 })
  }

  const action = await prisma.action.findUnique({
    where: { id },
    include: { focus: { include: { goal: true } } },
  })
  if (!action || action.focus.goal.userId !== writeUserId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updated = await prisma.action.update({
    where: { id },
    data: {
      reminderTime,
      reminderDays,
    },
    select: {
      id: true,
      reminderTime: true,
      reminderDays: true,
    },
  })

  return NextResponse.json(updated)
}
