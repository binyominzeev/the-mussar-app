import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isSessionAdmin } from '@/lib/session'

function normalizePairType(type: unknown): 'mutual_coach' | 'general_mentor' {
  if (type === 'general_mentor') return 'general_mentor'
  return 'mutual_coach'
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!isSessionAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const pairs = await prisma.accountabilityPair.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      partner: { select: { id: true, name: true, email: true } },
    },
  })

  const mutualByKey = new Map<string, (typeof pairs)[number]>()
  const generalPairs: (typeof pairs)[number][] = []

  for (const pair of pairs) {
    const normalizedType = normalizePairType(pair.type)
    if (normalizedType === 'general_mentor') {
      generalPairs.push({ ...pair, type: normalizedType })
      continue
    }

    const key = [pair.userId, pair.partnerId].sort().join(':')
    if (!mutualByKey.has(key)) {
      const shouldSwap = (pair.user.name ?? '').localeCompare(pair.partner.name ?? '') > 0
      mutualByKey.set(key, shouldSwap
        ? { ...pair, userId: pair.partnerId, partnerId: pair.userId, user: pair.partner, partner: pair.user, type: normalizedType }
        : { ...pair, type: normalizedType })
    }
  }

  return NextResponse.json([...generalPairs, ...Array.from(mutualByKey.values())])
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isSessionAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const pairType = normalizePairType(body.type)
  if (!body.userId || !body.partnerId || body.userId === body.partnerId) {
    return NextResponse.json({ error: 'Invalid pair' }, { status: 400 })
  }

  if (pairType === 'general_mentor') {
    const pair = await prisma.accountabilityPair.create({
      data: { userId: body.userId, partnerId: body.partnerId, type: pairType },
      include: {
        user: { select: { id: true, name: true } },
        partner: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json(pair)
  }

  const existing = await prisma.accountabilityPair.findFirst({
    where: {
      OR: [
        { userId: body.userId, partnerId: body.partnerId },
        { userId: body.partnerId, partnerId: body.userId },
      ],
      type: { in: ['mutual_coach', 'coach', 'chavruta'] },
    },
  })

  if (existing) {
    return NextResponse.json({ error: 'Pair already exists' }, { status: 409 })
  }

  const pair = await prisma.accountabilityPair.create({
    data: { userId: body.userId, partnerId: body.partnerId, type: pairType },
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
