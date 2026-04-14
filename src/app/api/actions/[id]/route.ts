import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()

  const action = await prisma.action.findUnique({
    where: { id: params.id },
    include: { focus: { include: { goal: true } } },
  })
  if (!action || action.focus.goal.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updated = await prisma.action.update({
    where: { id: params.id },
    data: { title: body.title, type: body.type },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const action = await prisma.action.findUnique({
    where: { id: params.id },
    include: { focus: { include: { goal: true } } },
  })
  if (!action || action.focus.goal.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.action.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
