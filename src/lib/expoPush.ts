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

export function createNotificationTargetData(targetPath: string): NotificationData {
  return {
    // Keep both keys for compatibility with existing mobile/web notification routing.
    path: targetPath,
    url: targetPath,
  }
}

export async function sendExpoPushNotification(message: ExpoPushMessage) {
  if (!isValidExpoPushToken(message.to)) {
    return
  }

  try {
    const response = await fetch(EXPO_PUSH_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })
    if (!response.ok) {
      console.warn(`Expo push delivery failed with status ${response.status}`)
      return
    }
  } catch (error) {
    // Ignore push delivery errors so primary API operations succeed.
    console.warn('Expo push delivery error', error)
  }
}
