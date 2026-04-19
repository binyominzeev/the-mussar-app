import { StatusBar } from 'expo-status-bar'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { getSession, login, type AuthSession, type ReminderAction, fetchDueReminders, MobileApiError } from './src/api/client'
import { registerForPushNotificationsAsync, scheduleReminderNotification } from './src/notifications'
import { API_BASE_URL } from './src/config'

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pushToken, setPushToken] = useState('')
  const [reminders, setReminders] = useState<ReminderAction[]>([])

  const statusText = useMemo(() => (session ? `Logged in as ${session.user.email}` : 'Not signed in'), [session])

  useEffect(() => {
    getSession()
      .then(setSession)
      .catch(() => {
        setSession(null)
        setError('Unable to restore session from backend.')
      })
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) setPushToken(token)
      })
      .catch(() => {})
  }, [])

  async function handleSignIn() {
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      const nextSession = await getSession()
      setSession(nextSession)
      setReminders([])
    } catch (err) {
      if (err instanceof MobileApiError && err.kind === 'auth') {
        setError('Sign-in failed: invalid credentials.')
      } else if (err instanceof MobileApiError && err.kind === 'network') {
        setError('Sign-in failed: backend is unreachable.')
      } else {
        setError('Sign-in failed: unexpected error.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function loadReminders() {
    try {
      const due = await fetchDueReminders()
      setReminders(due)
      for (const reminder of due) {
        await scheduleReminderNotification(reminder.title, reminder.reminderTime)
      }
    } catch (err) {
      if (err instanceof MobileApiError) {
        setError('Failed to fetch reminders from backend.')
      } else {
        setError('Fetched reminders, but local notification scheduling failed.')
      }
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mussar Mobile (Expo)</Text>
        <Text style={styles.subtitle}>{statusText}</Text>
        <Text style={styles.hint}>Backend: {API_BASE_URL}</Text>
        {pushToken ? <Text style={styles.hint}>Push token acquired ✓</Text> : <Text style={styles.hint}>Push token pending</Text>}

        {!session && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Button title={loading ? 'Signing in...' : 'Sign in'} onPress={() => handleSignIn()} disabled={loading} />
          </View>
        )}

        {session && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reminders</Text>
            <Button title="Load due reminders from backend" onPress={loadReminders} />
            {reminders.map((reminder) => (
              <Text key={reminder.id} style={styles.reminder}>
                • {reminder.title} ({reminder.reminderTime})
              </Text>
            ))}
          </View>
        )}

        {loading && <ActivityIndicator size="small" color="#111827" style={styles.loading} />}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { color: '#111827', fontSize: 14 },
  hint: { color: '#6b7280', fontSize: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  reminder: { color: '#1f2937', fontSize: 13 },
  loading: { marginTop: 8 },
  error: { color: '#b91c1c', fontSize: 13 },
})
