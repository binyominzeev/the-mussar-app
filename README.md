# The Mussar App

A structured personal growth and accountability web app built with Next.js, Prisma, and SQLite.

## Features

- **Dashboard** — today's actions with quick check-in (binary, quantitative, reflection)
- **Goals** — manage Knowledge and Habits goals with 30-day focuses and daily actions
- **Weekly Review** — completion stats and reflection
- **Admin Panel** — user management and accountability pairs
- **Direct Chat** — instant messaging between accountability partners and mentor relationships
- **Action Reminders** — optional HH:MM reminders with selected weekdays for each action
- **Native App Ready** — Capacitor Android/iOS wrappers with push + local notification support
- **Authentication** — email + password login

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` and set a secure `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`).

### 3. Set up database

```bash
npx prisma db push
npx prisma db seed
```

Default login after seeding: `admin@mussar.app` / `password123`

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Native App (Capacitor)

Capacitor is configured for Android/iOS wrappers and native notifications.

For full native build, push configuration, testing, and store submission steps, see:

- [`NATIVE_BUILD_GUIDE.md`](./NATIVE_BUILD_GUIDE.md)

```bash
# build web bundle first
npm run build

# sync native projects
npm run cap:sync

# open native IDE projects
npm run cap:open:android
npm run cap:open:ios
```

## Data Structure

```
User
└── Goal (type: "knowledge" | "habits")
    └── Focus (30-day period)
        └── Action (type: "binary" | "quantitative" | "reflection")
            └── Checkin (daily)
```

## Tech Stack

- **Next.js 14** (App Router)
- **Prisma** + SQLite
- **NextAuth.js** (email/password)
- **Tailwind CSS**
