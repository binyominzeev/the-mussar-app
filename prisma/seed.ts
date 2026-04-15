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

  // Skip seeding goals if user already has them
  const existingGoals = await prisma.goal.count({ where: { userId: user.id } })
  if (existingGoals > 0) {
    console.log('Seed data already exists, skipping goal creation.')
    return
  }

  const today = new Date()
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  const knowledgeGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      type: 'knowledge',
      title: 'Chosen Mishpat',
      description: 'Építs strukturált halachikus tudást Chosen Mishpatban és Nidában következetes tanulással és aktív feldolgozással.',
    },
  })

  const knowledgeFocus = await prisma.focus.create({
    data: {
      goalId: knowledgeGoal.id,
      title: 'Tanulási rendszer',
      description: 'Alapíts stabil napi tanulási rutint, amely magában foglalja a tanulást, a jegyzetelést és az ismétlést.',
      startDate: today,
      endDate: thirtyDays,
    },
  })

  await prisma.action.createMany({
    data: [
      { focusId: knowledgeFocus.id, title: 'Tanulj ma', type: 'binary' },
      { focusId: knowledgeFocus.id, title: 'Készíts jegyzeteket vagy Sefaria lapot', type: 'binary' },
      { focusId: knowledgeFocus.id, title: 'Végezd el a kártyás ismétlést', type: 'binary' },
    ],
  })

  const habitsGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      type: 'habits',
      title: 'Napi fegyelem',
      description: 'Építs stabil napi ritmust következetes alvással, kevesebb késéssel és jobb időgazdálkodással.',
    },
  })

  const habitsFocus = await prisma.focus.create({
    data: {
      goalId: habitsGoal.id,
      title: 'Stabil ritmus',
      description: 'Rögzítsd az ébredési/alvási időket és javítsd a holt idő felhasználását.',
      startDate: today,
      endDate: thirtyDays,
    },
  })

  await prisma.action.createMany({
    data: [
      { focusId: habitsFocus.id, title: 'Ébredj fel időben', type: 'binary' },
      { focusId: habitsFocus.id, title: 'Feküdj le időben', type: 'binary' },
      { focusId: habitsFocus.id, title: 'Jól használtad a holt időt', type: 'reflection' },
      { focusId: habitsFocus.id, title: 'Végezz 10-20 perces edzést', type: 'binary' },
    ],
  })

  console.log('Seed complete. Login: admin@mussar.app / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
