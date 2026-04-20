import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resolveReadUserId } from '@/lib/mentorMode'
import { prisma } from '@/lib/prisma'
import { isReminderDue } from '@/lib/reminders'
import { getSessionUserId } from '@/lib/session'
import { sendExpoPushNotification } from '@/lib/expoPush'

function parseCurrentTime(req: NextRequest): Date {
  const at = req.nextUrl.searchParams.get('at')
  if (!at) return new Date()

  const parsed = new Date(at)
  if (Number.isNaN(parsed.getTime())) return new Date()
  return parsed
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const readUserId = await resolveReadUserId(req, userId)
  const now = parseCurrentTime(req)

  const actions = await prisma.action.findMany({
    where: {
      reminderTime: { not: null },
      reminderDays: { not: null },
      focus: { goal: { userId: readUserId } },
    },
    select: {
      id: true,
      title: true,
      reminderTime: true,
      reminderDays: true,
      focusId: true,
    },
  })

  const dueActions = actions.filter(
    (action) =>
      action.reminderTime &&
      action.reminderDays &&
      isReminderDue(action.reminderTime, action.reminderDays, now)
  )

  if (readUserId === userId && dueActions.length > 0) {
    const targetUser = await prisma.user.findUnique({
      where: { id: readUserId },
      select: { expoPushToken: true },
    })

    if (targetUser?.expoPushToken) {
      for (const action of dueActions) {
        await sendExpoPushNotification({
          to: targetUser.expoPushToken,
          title: 'Activity reminder',
          body: `${action.title} (${action.reminderTime})`,
          data: {
            path: '/goals',
            url: '/goals',
          },
        })
      }
    }
  }

  return NextResponse.json({
    now: now.toISOString(),
    actions: dueActions,
  })
}
