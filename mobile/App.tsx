import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { registerForPushNotificationsAsync, addNotificationResponseListener, getInitialNotificationTargetAsync } from './src/notifications'
import { NotificationScreen } from './src/screens/NotificationScreen'
import { WebViewScreen } from './src/screens/WebViewScreen'

export type RootStackParamList = {
  Main: { targetUrl?: string; nonce?: number } | undefined
  Notification: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>()
  const [pendingTargetUrl, setPendingTargetUrl] = useState<string | null>(null)

  useEffect(() => {
    registerForPushNotificationsAsync().catch(() => {})
    getInitialNotificationTargetAsync()
      .then((targetUrl) => {
        if (targetUrl) {
          setPendingTargetUrl(targetUrl)
        }
      })
      .catch(() => {})

    const unsubscribe = addNotificationResponseListener((targetUrl) => {
      if (targetUrl) {
        setPendingTargetUrl(targetUrl)
        return
      }

      if (navigationRef.isReady()) {
        navigationRef.navigate('Notification')
      }
    })

    return unsubscribe
  }, [navigationRef])

  useEffect(() => {
    if (!pendingTargetUrl || !navigationRef.isReady()) {
      return
    }

    navigationRef.navigate('Main', {
      targetUrl: pendingTargetUrl,
      nonce: Date.now(),
    })
    setPendingTargetUrl(null)
  }, [navigationRef, pendingTargetUrl])

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="dark" />
      <Stack.Navigator>
        <Stack.Screen name="Main" component={WebViewScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Notification" component={NotificationScreen} options={{ title: 'Notification' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
