import { Button, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../App'

type Props = NativeStackScreenProps<RootStackParamList, 'Notification'>

export function NotificationScreen({ navigation }: Props) {
  return (
    <View style={styles.container} accessible accessibilityLabel="Notification opened. Continue to app.">
      <Text style={styles.title} accessibilityRole="header">
        Notification opened
      </Text>
      <Text style={styles.body}>This notification has no specific target page. Continue to the app.</Text>
      <Button title="Continue to app" onPress={() => navigation.navigate('Main')} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  body: {
    textAlign: 'center',
    color: '#374151',
  },
})
