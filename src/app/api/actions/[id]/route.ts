import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resolveWriteUserId } from '@/lib/mentorMode'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const writeUserId = await resolveWriteUserId(req, userId)
  if (!writeUserId) {
    return NextResponse.json({ error: 'Mentor mode is read-only' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const action = await prisma.action.findUnique({
    where: { id },
    include: { focus: { include: { goal: true } } },
  })
  if (!action || action.focus.goal.userId !== writeUserId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updated = await prisma.action.update({
    where: { id },
    data: { title: body.title, type: body.type },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const writeUserId = await resolveWriteUserId(req, userId)
  if (!writeUserId) {
    return NextResponse.json({ error: 'Mentor mode is read-only' }, { status: 403 })
  }

  const { id } = await params
  const action = await prisma.action.findUnique({
    where: { id },
    include: { focus: { include: { goal: true } } },
  })
  if (!action || action.focus.goal.userId !== writeUserId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.action.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
