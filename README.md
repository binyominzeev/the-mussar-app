# The Mussar App

A structured personal growth and accountability web app built with Next.js, Prisma, and SQLite.

## Features

- **Dashboard** — today's actions with quick check-in (binary, quantitative, reflection)
- **Goals** — manage Knowledge and Habits goals with 30-day focuses and daily actions
- **Weekly Review** — completion stats and reflection
- **Admin Panel** — user management and accountability pairs
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
