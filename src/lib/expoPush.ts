const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send'
const EXPO_PUSH_TOKEN_RE = /^(ExpoPushToken|ExponentPushToken)\[[^\]]+\]$/

type NotificationData = {
  url?: string
  path?: string
}

type ExpoPushMessage = {
  to: string
  title: string
  body: string
  data?: NotificationData
}

export function isValidExpoPushToken(token: string | null | undefined): token is string {
  return typeof token === 'string' && EXPO_PUSH_TOKEN_RE.test(token.trim())
}

export async function sendExpoPushNotification(message: ExpoPushMessage) {
  if (!isValidExpoPushToken(message.to)) {
    return
  }

  try {
    await fetch(EXPO_PUSH_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })
  } catch {
    // Ignore push delivery errors so primary API operations succeed.
  }
}
