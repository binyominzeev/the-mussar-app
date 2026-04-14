'use client'

import { useEffect, useState } from 'react'

interface Action {
  id: string
  title: string
  type: string
}

interface Focus {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  actions: Action[]
}

interface Checkin {
  id: string
  actionId: string
  value: string
}

interface GoalWithFocuses {
  id: string
  type: string
  title: string
  description: string
  focuses: Focus[]
}

export default function DashboardPage() {
  const [goals, setGoals] = useState<GoalWithFocuses[]>([])
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [reflection, setReflection] = useState('')
  const [saved, setSaved] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetch('/api/goals').then((r) => r.json()).then(setGoals)
    fetch(`/api/checkins?date=${today}`).then((r) => r.json()).then(setCheckins)
  }, [today])

  const getCheckin = (actionId: string) =>
    checkins.find((c) => c.actionId === actionId)

  async function handleCheckin(actionId: string, value: string | boolean) {
    const res = await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, value: String(value), date: today }),
    })
    const updated = await res.json()
    setCheckins((prev) => {
      const idx = prev.findIndex((c) => c.actionId === actionId)
      if (idx >= 0) return prev.map((c, i) => (i === idx ? updated : c))
      return [...prev, updated]
    })
  }

  const allActions = goals.flatMap((g) =>
    g.focuses.flatMap((f) => f.actions.map((a) => ({ ...a, goalTitle: g.title, goalType: g.type })))
  )
  const completedCount = allActions.filter((a) => {
    const c = getCheckin(a.id)
    return c && c.value !== '' && c.value !== 'false'
  }).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Today</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {allActions.length > 0 && (
        <div className="text-sm text-gray-500">
          {completedCount} / {allActions.length} completed
        </div>
      )}

      {goals.length === 0 && (
        <div className="text-gray-400 text-sm py-8 text-center">
          No goals yet. <a href="/goals" className="underline">Create your first goal</a>
        </div>
      )}

      {goals.map((goal) => (
        <section key={goal.id}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            {goal.type === 'knowledge' ? '📚' : '⚡'} {goal.title}
          </h2>
          {goal.focuses.map((focus) => (
            <div key={focus.id} className="space-y-2">
              {focus.actions.map((action) => {
                const checkin = getCheckin(action.id)
                return (
                  <ActionItem
                    key={action.id}
                    action={action}
                    checkin={checkin}
                    onCheckin={handleCheckin}
                  />
                )
              })}
            </div>
          ))}
        </section>
      ))}

      <section className="border-t pt-4">
        <h2 className="text-sm font-medium mb-2">Daily reflection</h2>
        <p className="text-xs text-gray-500 mb-2">What was the biggest difficulty today?</p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
          placeholder="Optional..."
        />
        <button
          onClick={() => setSaved(true)}
          className="mt-2 text-xs bg-gray-100 hover:bg-gray-200 rounded px-3 py-1.5"
        >
          {saved ? '✓ Saved' : 'Save reflection'}
        </button>
      </section>
    </div>
  )
}

function ActionItem({
  action,
  checkin,
  onCheckin,
}: {
  action: { id: string; title: string; type: string }
  checkin?: { value: string }
  onCheckin: (id: string, value: string | boolean) => void
}) {
  if (action.type === 'binary') {
    const checked = checkin?.value === 'true'
    return (
      <label className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckin(action.id, e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <span className={`text-sm ${checked ? 'line-through text-gray-400' : ''}`}>{action.title}</span>
      </label>
    )
  }

  if (action.type === 'quantitative') {
    return (
      <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
        <span className="text-sm flex-1">{action.title}</span>
        <input
          type="number"
          defaultValue={checkin?.value || ''}
          onBlur={(e) => onCheckin(action.id, e.target.value)}
          className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-right"
          placeholder="0"
        />
      </div>
    )
  }

  return (
    <div className="p-3 bg-white border border-gray-100 rounded-lg">
      <p className="text-sm mb-2">{action.title}</p>
      <textarea
        defaultValue={checkin?.value || ''}
        rows={2}
        className="w-full border border-gray-200 rounded p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
        placeholder="Write your reflection..."
        onBlur={(e) => onCheckin(action.id, e.target.value)}
      />
    </div>
  )
}
