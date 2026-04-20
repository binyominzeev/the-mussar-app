import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'
import { canUsersChat } from '@/lib/chat'
import { createNotificationTargetData, sendExpoPushNotification } from '@/lib/expoPush'

const MAX_MESSAGE_LENGTH = 2000
const MAX_MESSAGES_PER_THREAD = 500
const PUSH_MESSAGE_PREVIEW_LENGTH = 160
const PUSH_MESSAGE_ELLIPSIS = '…'

function toMessagePreview(text: string) {
  if (text.length <= PUSH_MESSAGE_PREVIEW_LENGTH) {
    return text
  }

  return `${text.slice(0, PUSH_MESSAGE_PREVIEW_LENGTH - PUSH_MESSAGE_ELLIPSIS.length)}${PUSH_MESSAGE_ELLIPSIS}`
}

function parseOtherUserId(req: NextRequest): string | null {
  const value = req.nextUrl.searchParams.get('userId')?.trim()
  if (!value || value.length > 191) return null
  return value
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const otherUserId = parseOtherUserId(req)
  if (!otherUserId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const allowed = await canUsersChat(userId, otherUserId)
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.directMessage.updateMany({
    where: {
      senderId: otherUserId,
      recipientId: userId,
      readAt: null,
    },
    data: { readAt: new Date() },
  })

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        {
          senderId: userId,
          recipientId: otherUserId,
        },
        {
          senderId: otherUserId,
          recipientId: userId,
        },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: MAX_MESSAGES_PER_THREAD,
    select: {
      id: true,
      senderId: true,
      recipientId: true,
      body: true,
      createdAt: true,
      readAt: true,
    },
  })

  return NextResponse.json({ messages })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const recipientId = typeof body.recipientId === 'string' ? body.recipientId.trim() : ''
  const rawText = typeof body.body === 'string' ? body.body : ''
  const text = rawText.trim()

  if (!recipientId || recipientId.length > 191) {
    return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 })
  }
  if (!text || text.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: 'Invalid message body' }, { status: 400 })
  }

  const allowed = await canUsersChat(userId, recipientId)
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const message = await prisma.directMessage.create({
    data: {
      senderId: userId,
      recipientId,
      body: text,
    },
    select: {
      id: true,
      senderId: true,
      recipientId: true,
      body: true,
      createdAt: true,
      readAt: true,
      sender: {
        select: {
          name: true,
        },
      },
      recipient: {
        select: {
          expoPushToken: true,
        },
      },
    },
  })

  if (message.recipient.expoPushToken) {
    void sendExpoPushNotification({
      to: message.recipient.expoPushToken,
      title: message.sender.name ?? 'Message received',
      body: toMessagePreview(text),
      data: createNotificationTargetData('/chat'),
    })
  }

  return NextResponse.json(
    {
      id: message.id,
      senderId: message.senderId,
      recipientId: message.recipientId,
      body: message.body,
      createdAt: message.createdAt,
      readAt: message.readAt,
    },
    { status: 201 }
  )
}
