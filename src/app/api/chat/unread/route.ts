import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const unreadCount = await prisma.directMessage.count({
    where: {
      recipientId: userId,
      readAt: null,
    },
  })

  return NextResponse.json({ unreadCount })
}
