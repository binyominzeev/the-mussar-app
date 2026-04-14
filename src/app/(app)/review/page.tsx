'use client'

import { useEffect, useState } from 'react'

interface Checkin {
  id: string
  date: string
  value: string
  action: {
    id: string
    title: string
    type: string
    focus: {
      goal: {
        title: string
        type: string
      }
    }
  }
}

export default function ReviewPage() {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [weeks, setWeeks] = useState(1)
  const [reflection, setReflection] = useState('')

  useEffect(() => {
    fetch(`/api/checkins/weekly?weeks=${weeks}`)
      .then((r) => r.json())
      .then(setCheckins)
  }, [weeks])

  const byAction: Record<string, { title: string; goalTitle: string; goalType: string; values: { date: string; value: string }[] }> = {}
  for (const c of checkins) {
    if (!byAction[c.action.id]) {
      byAction[c.action.id] = {
        title: c.action.title,
        goalTitle: c.action.focus.goal.title,
        goalType: c.action.focus.goal.type,
        values: [],
      }
    }
    byAction[c.action.id].values.push({ date: c.date, value: c.value })
  }

  const dates = Array.from(new Set(checkins.map((c) => c.date.split('T')[0]))).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Weekly Review</h1>
        <select
          value={weeks}
          onChange={(e) => setWeeks(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded px-2 py-1"
        >
          <option value={1}>Last 7 days</option>
          <option value={2}>Last 14 days</option>
          <option value={4}>Last 30 days</option>
        </select>
      </div>

      {checkins.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No check-ins yet.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(byAction).map(([actionId, data]) => {
            const completedDays = data.values.filter(
              (v) => v.value && v.value !== 'false' && v.value !== ''
            ).length
            const pct = dates.length > 0 ? Math.round((completedDays / dates.length) * 100) : 0

            return (
              <div key={actionId} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium">{data.title}</p>
                    <p className="text-xs text-gray-400">
                      {data.goalType === 'knowledge' ? '📚' : '⚡'} {data.goalTitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{pct}%</p>
                    <p className="text-xs text-gray-400">{completedDays}/{dates.length} days</p>
                  </div>
                </div>

                <div className="flex gap-1 mt-3">
                  {dates.map((date) => {
                    const entry = data.values.find((v) => v.date.startsWith(date))
                    const done = entry && entry.value !== 'false' && entry.value !== ''
                    return (
                      <div
                        key={date}
                        title={date}
                        className={`flex-1 h-5 rounded-sm ${done ? 'bg-gray-800' : 'bg-gray-100'}`}
                      />
                    )
                  })}
                </div>

                {data.values.filter((v) => v.value && v.value !== 'true' && v.value !== 'false').map((v) => (
                  <div key={v.date} className="mt-2 text-xs text-gray-500 border-t pt-2">
                    <span className="text-gray-400">{new Date(v.date).toLocaleDateString()}: </span>
                    {v.value}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      <div className="border-t pt-4">
        <h2 className="text-sm font-medium mb-2">Weekly reflection</h2>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={4}
          className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
          placeholder="What went well? What needs improvement? What will you focus on next week?"
        />
        <button className="mt-2 text-xs bg-gray-100 hover:bg-gray-200 rounded px-3 py-1.5">
          Save reflection
        </button>
      </div>
    </div>
  )
}
