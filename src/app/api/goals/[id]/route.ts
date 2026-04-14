import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const goal = await prisma.goal.findUnique({ where: { id } })
  if (!goal || goal.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updated = await prisma.goal.update({
    where: { id },
    data: { title: body.title, description: body.description },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const goal = await prisma.goal.findUnique({ where: { id } })
  if (!goal || goal.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.goal.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
