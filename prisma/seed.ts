import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'admin@mussar.app' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@mussar.app',
      password,
      isAdmin: true,
    },
  })

  const today = new Date()
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  const knowledgeGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      type: 'knowledge',
      title: 'Chosen Mishpat',
      description: 'Build structured halachic knowledge in Chosen Mishpat and Nida through consistent study and active processing.',
    },
  })

  const knowledgeFocus = await prisma.focus.create({
    data: {
      goalId: knowledgeGoal.id,
      title: 'Learning System',
      description: 'Establish a stable daily learning routine including study, notes, and review.',
      startDate: today,
      endDate: thirtyDays,
    },
  })

  await prisma.action.createMany({
    data: [
      { focusId: knowledgeFocus.id, title: 'Study today', type: 'binary' },
      { focusId: knowledgeFocus.id, title: 'Create notes or Sefaria sheet', type: 'binary' },
      { focusId: knowledgeFocus.id, title: 'Do flashcard review', type: 'binary' },
    ],
  })

  const habitsGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      type: 'habits',
      title: 'Daily Discipline',
      description: 'Build a stable daily rhythm with consistent sleep, reduced lateness, and better time management.',
    },
  })

  const habitsFocus = await prisma.focus.create({
    data: {
      goalId: habitsGoal.id,
      title: 'Stable Rhythm',
      description: 'Fix wake/sleep times and improve use of dead time.',
      startDate: today,
      endDate: thirtyDays,
    },
  })

  await prisma.action.createMany({
    data: [
      { focusId: habitsFocus.id, title: 'Wake up on time', type: 'binary' },
      { focusId: habitsFocus.id, title: 'Go to sleep on time', type: 'binary' },
      { focusId: habitsFocus.id, title: 'Used dead time well', type: 'reflection' },
      { focusId: habitsFocus.id, title: 'Did 10-20 min exercise', type: 'binary' },
    ],
  })

  console.log('Seed complete. Login: admin@mussar.app / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
