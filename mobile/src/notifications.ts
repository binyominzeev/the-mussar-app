import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

function getTargetFromData(data: Notifications.NotificationContentInput['data']) {
  const payload = data && typeof data === 'object' ? data : undefined
  if (!payload) {
    return null
  }

  const url = payload.url
  if (typeof url === 'string' && url.length > 0) {
    return url
  }

  const path = payload.path
  if (typeof path === 'string' && path.length > 0) {
    return path
  }

  return null
}

function getTargetFromResponse(response: Notifications.NotificationResponse) {
  return getTargetFromData(response.notification.request.content.data)
}

export function addNotificationResponseListener(listener: (targetUrl: string | null) => void) {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    listener(getTargetFromResponse(response))
  })

  return () => subscription.remove()
}

export async function getInitialNotificationTargetAsync() {
  const response = await Notifications.getLastNotificationResponseAsync()
  if (!response) {
    return null
  }

  return getTargetFromResponse(response)
}

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) return null

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') return null

  const token = await Notifications.getExpoPushTokenAsync()
  return token.data
}

export async function scheduleReminderNotification(title: string, reminderTime: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Activity reminder',
      body: `${title} (${reminderTime})`,
    },
    // We fire immediately because due reminders are already filtered by backend time matching.
    trigger: null,
  })
}
