'use client'

import { FormEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { CHAT_DESKTOP_MIN_WIDTH_PX, CHAT_UNREAD_REFRESH_EVENT } from '@/lib/chatEvents'

type Thread = {
  user: {
    id: string
    name: string
    email: string
  }
  lastMessage: {
    id: string
    senderId: string
    body: string
    createdAt: string
  } | null
  unreadCount: number
}

type Message = {
  id: string
  senderId: string
  recipientId: string
  body: string
  createdAt: string
  readAt: string | null
}

const THREAD_REFRESH_INTERVAL_MS = 15000
const MESSAGES_REFRESH_INTERVAL_MS = 7000

export default function ChatPage() {
  const { t } = useLanguage()
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.user.id === selectedUserId) ?? null,
    [selectedUserId, threads]
  )

  const loadThreads = useCallback(async () => {
    const res = await fetch('/api/chat/threads', { cache: 'no-store' })
    if (!res.ok) return
    const data = (await res.json()) as { threads: Thread[] }
    setThreads(data.threads)
    setSelectedUserId((current) => {
      if (current && data.threads.some((thread) => thread.user.id === current)) return current
      return data.threads[0]?.user.id ?? null
    })
  }, [])

  const loadMessages = useCallback(async (userId: string) => {
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/chat/messages?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { messages: Message[] }
      setMessages(data.messages)
      window.dispatchEvent(new Event(CHAT_UNREAD_REFRESH_EVENT))
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    loadThreads().finally(() => setLoadingThreads(false))
    const intervalId = window.setInterval(() => {
      loadThreads().catch(() => {})
    }, THREAD_REFRESH_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [loadThreads])

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([])
      return
    }
    loadMessages(selectedUserId)
      .then(() => loadThreads())
      .catch(() => {})
    const intervalId = window.setInterval(() => {
      loadMessages(selectedUserId)
        .then(() => loadThreads())
        .catch(() => {})
    }, MESSAGES_REFRESH_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [loadMessages, loadThreads, selectedUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!selectedUserId || !messageText.trim() || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedUserId,
          body: messageText,
        }),
      })
      if (!res.ok) return
      setMessageText('')
      await Promise.all([loadMessages(selectedUserId), loadThreads()])
    } finally {
      setSending(false)
    }
  }

  function handleMessageInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const isImeComposing = event.nativeEvent.isComposing || event.keyCode === 229
    if (event.key !== 'Enter' || event.shiftKey || isImeComposing) return
    if (!window.matchMedia(`(min-width: ${CHAT_DESKTOP_MIN_WIDTH_PX}px)`).matches) return
    event.preventDefault()
    void sendMessage()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t.chat.title}</h1>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden h-[70vh] flex flex-col md:flex-row">
        <aside className="md:w-80 border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
          {loadingThreads ? (
            <p className="text-sm text-gray-400 p-4">{t.chat.loading}</p>
          ) : threads.length === 0 ? (
            <p className="text-sm text-gray-400 p-4">{t.chat.noConversations}</p>
          ) : (
            <ul>
              {threads.map((thread) => {
                const isActive = selectedUserId === thread.user.id
                return (
                  <li key={thread.user.id}>
                    <button
                      onClick={() => setSelectedUserId(thread.user.id)}
                      className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 ${isActive ? 'bg-gray-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate">{thread.user.name}</p>
                        {thread.unreadCount > 0 && (
                          <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 text-white text-[11px] px-1.5">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {thread.lastMessage?.body ?? t.chat.emptyConversation}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>

        <section className="flex-1 flex flex-col min-h-0">
          {!selectedThread ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400 px-4 text-center">
              {t.chat.selectConversation}
            </div>
          ) : (
            <>
              <header className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium">{selectedThread.user.name}</p>
                <p className="text-xs text-gray-400">{selectedThread.user.email}</p>
              </header>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loadingMessages && messages.length === 0 ? (
                  <p className="text-sm text-gray-400">{t.chat.loading}</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-gray-400">{t.chat.emptyConversation}</p>
                ) : (
                  messages.map((message) => {
                    const isMine = message.senderId !== selectedThread.user.id
                    return (
                      <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                            isMine ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.body}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-gray-300' : 'text-gray-500'}`}>
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={(e: FormEvent) => {
                  e.preventDefault()
                  void sendMessage()
                }}
                className="border-t border-gray-200 p-3 flex items-end gap-2"
              >
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleMessageInputKeyDown}
                  placeholder={t.chat.messagePlaceholder}
                  rows={2}
                  maxLength={2000}
                  className="flex-1 resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="h-10 px-4 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.chat.send}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
