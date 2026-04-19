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
      title: 'Mussar reminder',
      body: `${title} (${reminderTime})`,
    },
    trigger: null,
  })
}
