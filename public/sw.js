self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload = {}
  try {
    payload = event.data.json()
  } catch {
    payload = { body: event.data.text() }
  }

  const title = payload.title || 'Mussar App'
  const options = {
    body: payload.body || '',
    data: payload.data || {},
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification?.data?.url || '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const matchingClient = clientList.find((client) => 'focus' in client)
        if (matchingClient) {
          matchingClient.navigate(targetUrl)
          return matchingClient.focus()
        }
        return clients.openWindow(targetUrl)
      })
  )
})

async function notifyDueReminders() {
  const response = await fetch('/api/actions/reminders-due', { credentials: 'include' })
  if (!response.ok) return

  const data = await response.json()
  if (!data.actions?.length) return

  for (const action of data.actions) {
    await self.registration.showNotification('Activity reminder', {
      body: `${action.title} (${action.reminderTime})`,
      tag: `action-reminder-${action.id}`,
      data: { url: '/goals' },
    })
  }
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag !== 'action-reminders') return
  event.waitUntil(notifyDueReminders())
})

self.addEventListener('sync', (event) => {
  if (event.tag !== 'action-reminders') return
  event.waitUntil(notifyDueReminders())
})
