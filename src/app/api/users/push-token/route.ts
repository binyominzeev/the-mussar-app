import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isValidExpoPushToken } from '@/lib/expoPush'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

type PushTokenBody = {
  expoPushToken?: unknown
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as PushTokenBody | null
  const expoPushToken = typeof body?.expoPushToken === 'string' ? body.expoPushToken.trim() : ''

  if (!isValidExpoPushToken(expoPushToken)) {
    return NextResponse.json({ error: 'Invalid expo push token' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { expoPushToken },
  })

  return NextResponse.json({ ok: true })
}
