import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'
import { getChatContactIds } from '@/lib/chat'

const MAX_RECENT_MESSAGES = 500

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contactIds = await getChatContactIds(userId)
  if (contactIds.length === 0) {
    return NextResponse.json({ threads: [], totalUnread: 0 })
  }

  const [contacts, recentMessages, unreadMessages] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: contactIds } },
      select: { id: true, name: true, email: true },
    }),
    prisma.directMessage.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            recipientId: { in: contactIds },
          },
          {
            senderId: { in: contactIds },
            recipientId: userId,
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: MAX_RECENT_MESSAGES,
      select: {
        id: true,
        senderId: true,
        recipientId: true,
        body: true,
        createdAt: true,
      },
    }),
    prisma.directMessage.findMany({
      where: {
        recipientId: userId,
        readAt: null,
        senderId: { in: contactIds },
      },
      select: { senderId: true },
    }),
  ])

  const contactById = new Map(contacts.map((contact) => [contact.id, contact]))
  const lastMessageByContactId = new Map<
    string,
    { id: string; senderId: string; body: string; createdAt: Date }
  >()

  for (const message of recentMessages) {
    const contactId = message.senderId === userId ? message.recipientId : message.senderId
    if (!lastMessageByContactId.has(contactId)) {
      lastMessageByContactId.set(contactId, {
        id: message.id,
        senderId: message.senderId,
        body: message.body,
        createdAt: message.createdAt,
      })
    }
  }

  const unreadCountByContactId = new Map<string, number>()
  for (const unreadMessage of unreadMessages) {
    unreadCountByContactId.set(
      unreadMessage.senderId,
      (unreadCountByContactId.get(unreadMessage.senderId) ?? 0) + 1
    )
  }

  const threads = contactIds
    .map((contactId) => {
      const contact = contactById.get(contactId)
      if (!contact) return null
      return {
        user: contact,
        lastMessage: lastMessageByContactId.get(contactId) ?? null,
        unreadCount: unreadCountByContactId.get(contactId) ?? 0,
      }
    })
    .filter((thread): thread is NonNullable<typeof thread> => Boolean(thread))
    .sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0
      const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0
      if (aTime !== bTime) return bTime - aTime
      return a.user.name.localeCompare(b.user.name)
    })

  const totalUnread = Array.from(unreadCountByContactId.values()).reduce((sum, count) => sum + count, 0)

  return NextResponse.json({ threads, totalUnread })
}
