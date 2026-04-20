import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, BackHandler, Platform, StyleSheet, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { WebView } from 'react-native-webview'
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes'
import type { RootStackParamList } from '../../App'
import { API_BASE_URL } from '../config'

type Props = NativeStackScreenProps<RootStackParamList, 'WebView'>

function resolveTargetUrl(targetUrl?: string) {
  if (!targetUrl) {
    return API_BASE_URL
  }

  if (/^https?:\/\//i.test(targetUrl)) {
    try {
      const appUrl = new URL(API_BASE_URL)
      const notificationUrl = new URL(targetUrl)
      return notificationUrl.origin === appUrl.origin ? notificationUrl.toString() : API_BASE_URL
    } catch {
      return API_BASE_URL
    }
  }

  const normalizedPath = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`
  return `${API_BASE_URL}${normalizedPath}`
}

export function WebViewScreen({ route }: Props) {
  const webViewRef = useRef<WebView>(null)
  const [currentUrl, setCurrentUrl] = useState(API_BASE_URL)
  const [canGoBack, setCanGoBack] = useState(false)

  const targetUrl = useMemo(() => resolveTargetUrl(route.params?.targetUrl), [route.params?.targetUrl])

  useEffect(() => {
    if (targetUrl !== currentUrl) {
      setCurrentUrl(targetUrl)
    }
  }, [currentUrl, targetUrl])

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return () => {}
      }

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (!canGoBack) {
          return false
        }

        webViewRef.current?.goBack()
        return true
      })

      return () => subscription.remove()
    }, [canGoBack])
  )

  const onNavigationStateChange = useCallback((nextState: WebViewNavigation) => {
    setCanGoBack(nextState.canGoBack)
  }, [])

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        onNavigationStateChange={onNavigationStateChange}
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        setSupportMultipleWindows={false}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="small" />
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
