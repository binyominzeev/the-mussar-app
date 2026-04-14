import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isSessionAdmin } from '@/lib/session'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!isSessionAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const pairs = await prisma.accountabilityPair.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      partner: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json(pairs)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isSessionAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const pair = await prisma.accountabilityPair.create({
    data: { userId: body.userId, partnerId: body.partnerId, type: body.type },
    include: {
      user: { select: { id: true, name: true } },
      partner: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(pair)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isSessionAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  await prisma.accountabilityPair.delete({ where: { id: body.id } })
  return NextResponse.json({ ok: true })
}
