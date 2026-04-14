import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()

  const focus = await prisma.focus.findUnique({ where: { id: params.id }, include: { goal: true } })
  if (!focus || focus.goal.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updated = await prisma.focus.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const focus = await prisma.focus.findUnique({ where: { id: params.id }, include: { goal: true } })
  if (!focus || focus.goal.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.focus.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
