# Native Android/iOS Build Guide (Expo React Native)

This project now uses Expo React Native for native mobile.
The Next.js application remains your backend for API routes, authentication, and database access.

## 1) Prerequisites

- Node.js 18+
- Existing backend running/deployed (`npm run dev` or production URL)
- Expo account (for EAS cloud builds)

## 2) Configure mobile backend URL

```bash
cp mobile/.env.example mobile/.env
```

Set:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

For physical devices use your reachable backend hostname/IP, not `localhost`.

## 3) Run the mobile app locally

```bash
npm run mobile:start
```

Then launch:

```bash
npm run mobile:android
npm run mobile:ios
```

## 4) Authentication flow

The Expo app signs in through existing NextAuth credential endpoints:

- `GET /api/auth/csrf`
- `POST /api/auth/callback/credentials`
- `GET /api/auth/session`

No backend auth rewrite is required.

## 5) Notifications

The mobile app uses `expo-notifications`:

- Push token registration at app startup
- Local reminder notifications when due reminders are fetched from backend

Backend reminder data endpoint:

- `GET /api/actions/reminders-due`

## 6) Native build scripts

From repository root:

```bash
npm run mobile:build:android
npm run mobile:build:ios
```

These call EAS build via the mobile app scripts.
