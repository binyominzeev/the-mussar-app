# The Mussar App

A structured personal growth and accountability web app built with Next.js, Prisma, and SQLite.

## Features

- **Dashboard** — today's actions with quick check-in (binary, quantitative, reflection)
- **Goals** — manage Knowledge and Habits goals with 30-day focuses and daily actions
- **Weekly Review** — completion stats and reflection
- **Admin Panel** — user management and accountability pairs
- **Direct Chat** — instant messaging between accountability partners and mentor relationships
- **Action Reminders** — optional HH:MM reminders with selected weekdays for each action
- **Native App Ready** — Expo React Native mobile app with push + local notifications
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

## Native App (Expo React Native)

The repository now includes a dedicated Expo React Native app under [`mobile/`](./mobile).
The Next.js app remains the backend (API routes, auth, database) and the mobile app communicates with it over HTTP.

For full native build, push configuration, testing, and store submission steps, see:

- [`NATIVE_BUILD_GUIDE.md`](./NATIVE_BUILD_GUIDE.md)

```bash
# configure mobile backend URL
cp mobile/.env.example mobile/.env

# run mobile app
npm run mobile:start

# open native dev builds
npm run mobile:android
npm run mobile:ios
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

- **Next.js 15** (App Router backend)
- **Expo + React Native** (native mobile client)
- **Prisma** + SQLite
- **NextAuth.js** (email/password)
- **Tailwind CSS**
