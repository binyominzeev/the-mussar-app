import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const userId = (session.user as any).id

  const focus = await prisma.focus.findUnique({ where: { id: body.focusId }, include: { goal: true } })
  if (!focus || focus.goal.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const action = await prisma.action.create({
    data: {
      focusId: body.focusId,
      title: body.title,
      type: body.type,
    },
  })

  return NextResponse.json(action)
}
