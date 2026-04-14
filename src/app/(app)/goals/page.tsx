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

interface Goal {
  id: string
  type: string
  title: string
  description: string
  focuses: Focus[]
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)
  const [showFocusForm, setShowFocusForm] = useState<string | null>(null)
  const [editFocus, setEditFocus] = useState<Focus | null>(null)
  const [showActionForm, setShowActionForm] = useState<string | null>(null)
  const [editAction, setEditAction] = useState<Action | null>(null)

  async function load() {
    const res = await fetch('/api/goals')
    setGoals(await res.json())
  }

  useEffect(() => { load() }, [])

  async function saveGoal(data: { type: string; title: string; description: string }, id?: string) {
    if (id) {
      await fetch(`/api/goals/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    } else {
      await fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    }
    setShowGoalForm(false)
    setEditGoal(null)
    load()
  }

  async function deleteGoal(id: string) {
    if (!confirm('Delete this goal?')) return
    await fetch(`/api/goals/${id}`, { method: 'DELETE' })
    load()
  }

  async function saveFocus(data: any, goalId: string, id?: string) {
    if (id) {
      await fetch(`/api/focuses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    } else {
      await fetch('/api/focuses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, goalId }) })
    }
    setShowFocusForm(null)
    setEditFocus(null)
    load()
  }

  async function deleteFocus(id: string) {
    if (!confirm('Delete this focus?')) return
    await fetch(`/api/focuses/${id}`, { method: 'DELETE' })
    load()
  }

  async function saveAction(data: any, focusId: string, id?: string) {
    if (id) {
      await fetch(`/api/actions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    } else {
      await fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, focusId }) })
    }
    setShowActionForm(null)
    setEditAction(null)
    load()
  }

  async function deleteAction(id: string) {
    if (!confirm('Delete this action?')) return
    await fetch(`/api/actions/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Goals</h1>
        <button
          onClick={() => { setEditGoal(null); setShowGoalForm(true) }}
          className="text-sm bg-gray-900 text-white rounded-lg px-3 py-1.5 hover:bg-gray-700"
        >
          + New Goal
        </button>
      </div>

      {showGoalForm && (
        <GoalForm
          initial={editGoal || undefined}
          onSave={saveGoal}
          onCancel={() => { setShowGoalForm(false); setEditGoal(null) }}
        />
      )}

      {goals.length === 0 && !showGoalForm && (
        <p className="text-gray-400 text-sm text-center py-8">No goals yet.</p>
      )}

      {goals.map((goal) => (
        <div key={goal.id} className="border border-gray-200 rounded-xl p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                {goal.type === 'knowledge' ? '📚 Knowledge' : '⚡ Habits'}
              </div>
              <h2 className="font-semibold">{goal.title}</h2>
              <p className="text-sm text-gray-600 mt-0.5">{goal.description}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <button onClick={() => { setEditGoal(goal); setShowGoalForm(true) }} className="text-xs text-gray-400 hover:text-gray-700">Edit</button>
              <button onClick={() => deleteGoal(goal.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
            </div>
          </div>

          <div className="pl-2 border-l-2 border-gray-100 space-y-3">
            {goal.focuses.map((focus) => (
              <div key={focus.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{focus.title}</p>
                    <p className="text-xs text-gray-500">{focus.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(focus.startDate).toLocaleDateString()} — {new Date(focus.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button onClick={() => { setEditFocus(focus); setShowFocusForm(goal.id) }} className="text-xs text-gray-400 hover:text-gray-700">Edit</button>
                    <button onClick={() => deleteFocus(focus.id)} className="text-xs text-red-400 hover:text-red-600">Del</button>
                  </div>
                </div>
                {showFocusForm === goal.id && editFocus?.id === focus.id && (
                  <FocusForm
                    initial={focus}
                    onSave={(data) => saveFocus(data, goal.id, focus.id)}
                    onCancel={() => { setShowFocusForm(null); setEditFocus(null) }}
                  />
                )}

                <div className="pl-2 space-y-1">
                  {focus.actions.map((action) => (
                    <div key={action.id}>
                      <div className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded text-sm">
                        <span>{action.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{action.type}</span>
                          <button onClick={() => { setEditAction(action); setShowActionForm(focus.id) }} className="text-xs text-gray-400 hover:text-gray-700">Edit</button>
                          <button onClick={() => deleteAction(action.id)} className="text-xs text-red-400 hover:text-red-600">Del</button>
                        </div>
                      </div>
                      {showActionForm === focus.id && editAction?.id === action.id && (
                        <ActionForm
                          initial={action}
                          onSave={(data) => saveAction(data, focus.id, action.id)}
                          onCancel={() => { setShowActionForm(null); setEditAction(null) }}
                        />
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => { setEditAction(null); setShowActionForm(focus.id) }}
                    className="text-xs text-gray-400 hover:text-gray-700 py-1 px-2"
                  >
                    + Add action
                  </button>
                  {showActionForm === focus.id && !editAction && (
                    <ActionForm
                      onSave={(data) => saveAction(data, focus.id)}
                      onCancel={() => setShowActionForm(null)}
                    />
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={() => { setEditFocus(null); setShowFocusForm(goal.id) }}
              className="text-xs text-gray-400 hover:text-gray-700 py-1"
            >
              + Add focus
            </button>
            {showFocusForm === goal.id && !editFocus && (
              <FocusForm
                onSave={(data) => saveFocus(data, goal.id)}
                onCancel={() => setShowFocusForm(null)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function GoalForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { id?: string; type?: string; title?: string; description?: string }
  onSave: (data: any, id?: string) => void
  onCancel: () => void
}) {
  const [type, setType] = useState(initial?.type || 'knowledge')
  const [title, setTitle] = useState(initial?.title || '')
  const [description, setDescription] = useState(initial?.description || '')

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
      <h3 className="text-sm font-medium">{initial?.id ? 'Edit Goal' : 'New Goal'}</h3>
      <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm">
        <option value="knowledge">Knowledge</option>
        <option value="habits">Habits</option>
      </select>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm resize-none" />
      <div className="flex gap-2">
        <button onClick={() => onSave({ type, title, description }, initial?.id)} className="text-xs bg-gray-900 text-white rounded px-3 py-1.5 hover:bg-gray-700">Save</button>
        <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5">Cancel</button>
      </div>
    </div>
  )
}

function FocusForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { title?: string; description?: string; startDate?: string; endDate?: string }
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [title, setTitle] = useState(initial?.title || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [startDate, setStartDate] = useState(initial?.startDate?.split('T')[0] || today)
  const [endDate, setEndDate] = useState(initial?.endDate?.split('T')[0] || thirtyDays)

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white">
      <h4 className="text-xs font-medium text-gray-600">{initial?.title ? 'Edit Focus' : 'New Focus'}</h4>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm resize-none" />
      <div className="flex gap-2">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave({ title, description, startDate, endDate })} className="text-xs bg-gray-800 text-white rounded px-3 py-1.5">Save</button>
        <button onClick={onCancel} className="text-xs text-gray-500 px-3 py-1.5">Cancel</button>
      </div>
    </div>
  )
}

function ActionForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { title?: string; type?: string }
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(initial?.title || '')
  const [type, setType] = useState(initial?.type || 'binary')

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white text-sm">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Action title" className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
      <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm">
        <option value="binary">Binary (yes/no)</option>
        <option value="quantitative">Quantitative (number)</option>
        <option value="reflection">Reflection (text)</option>
      </select>
      <div className="flex gap-2">
        <button onClick={() => onSave({ title, type })} className="text-xs bg-gray-800 text-white rounded px-3 py-1.5">Save</button>
        <button onClick={onCancel} className="text-xs text-gray-500 px-3 py-1.5">Cancel</button>
      </div>
    </div>
  )
}
