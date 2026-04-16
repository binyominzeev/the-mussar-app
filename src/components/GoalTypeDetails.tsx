'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

type GoalType = 'knowledge' | 'habits'

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
  type: GoalType
  title: string
  description: string
  focuses: Focus[]
}

interface Checkin {
  id: string
  actionId: string
  value: string
}

export default function GoalTypeDetails({ type, title }: { type: GoalType; title: string }) {
  const { t } = useLanguage()
  const [goals, setGoals] = useState<Goal[]>([])
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [editMode, setEditMode] = useState(false)
  const [showFocusForm, setShowFocusForm] = useState(false)
  const [editFocus, setEditFocus] = useState<Focus | null>(null)
  const [showActionForm, setShowActionForm] = useState<string | null>(null)
  const [editAction, setEditAction] = useState<Action | null>(null)
  const today = new Date().toISOString().split('T')[0]

  const typeGoals = useMemo(() => goals.filter((goal) => goal.type === type), [goals, type])
  const focuses = useMemo(
    () => typeGoals.flatMap((goal) => goal.focuses.map((focus) => ({ ...focus, goalId: goal.id }))),
    [typeGoals]
  )

  const load = useCallback(async () => {
    const [goalsRes, checkinsRes] = await Promise.all([
      fetch('/api/goals'),
      fetch(`/api/checkins?date=${today}`),
    ])

    const [goalsData, checkinsData] = await Promise.all([goalsRes.json(), checkinsRes.json()])
    setGoals(goalsData)
    setCheckins(checkinsData)
  }, [today])

  useEffect(() => {
    load()
  }, [load])

  const getCheckin = (actionId: string) => checkins.find((c) => c.actionId === actionId)

  async function ensureGoalId() {
    if (typeGoals[0]) return typeGoals[0].id

    const goal = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        title: type === 'knowledge' ? t.goals.goalTypeKnowledge : t.goals.goalTypeHabits,
        description: '',
      }),
    }).then((r) => r.json())

    await load()
    return goal.id as string
  }

  async function saveFocus(data: { title: string; description: string; startDate: string; endDate: string }, id?: string) {
    if (id) {
      await fetch(`/api/focuses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      const goalId = await ensureGoalId()
      await fetch('/api/focuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, goalId }),
      })
    }

    setShowFocusForm(false)
    setEditFocus(null)
    await load()
  }

  async function deleteFocus(id: string) {
    if (!confirm(t.goals.deleteFocusConfirm)) return
    await fetch(`/api/focuses/${id}`, { method: 'DELETE' })
    await load()
  }

  async function saveAction(data: { title: string; type: string }, focusId: string, id?: string) {
    if (id) {
      await fetch(`/api/actions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, focusId }),
      })
    }

    setShowActionForm(null)
    setEditAction(null)
    await load()
  }

  async function deleteAction(id: string) {
    if (!confirm(t.goals.deleteActionConfirm)) return
    await fetch(`/api/actions/${id}`, { method: 'DELETE' })
    await load()
  }

  async function saveCheckin(actionId: string, value: string | boolean) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <button
          type="button"
          onClick={() => {
            setEditMode((prev) => !prev)
            setShowFocusForm(false)
            setEditFocus(null)
            setShowActionForm(null)
            setEditAction(null)
          }}
          className="inline-flex items-center gap-2 text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 hover:bg-gray-50"
          aria-label={editMode ? t.goals.editModeOn : t.goals.editModeOff}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
            <path d="M4.5 19.5h3.75l9.75-9.75-3.75-3.75L4.5 15.75V19.5Z" />
            <path d="m13.5 6 3.75 3.75" />
          </svg>
          <span>{editMode ? t.goals.editModeOn : t.goals.editModeOff}</span>
        </button>
      </div>

      {focuses.length === 0 && !showFocusForm && (
        <p className="text-gray-400 text-sm text-center py-8">{t.goals.noFocuses}</p>
      )}

      {focuses.map((focus) => (
        <div key={focus.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-medium">{focus.title}</h2>
              <p className="text-sm text-gray-600 mt-0.5">{focus.description}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(focus.startDate).toLocaleDateString()} — {new Date(focus.endDate).toLocaleDateString()}
              </p>
            </div>
            {editMode && (
              <div className="flex gap-2 ml-3">
                <button
                  onClick={() => {
                    setEditFocus(focus)
                    setShowFocusForm(true)
                  }}
                  className="text-xs text-gray-400 hover:text-gray-700"
                >
                  {t.goals.edit}
                </button>
                <button onClick={() => deleteFocus(focus.id)} className="text-xs text-red-400 hover:text-red-600">
                  {t.goals.del}
                </button>
              </div>
            )}
          </div>

          {editMode && showFocusForm && editFocus?.id === focus.id && (
            <FocusForm
              initial={focus}
              onSave={(data) => saveFocus(data, focus.id)}
              onCancel={() => {
                setShowFocusForm(false)
                setEditFocus(null)
              }}
              t={t.goals}
            />
          )}

          <div className="space-y-2">
            {focus.actions.map((action) => {
              const checkin = getCheckin(action.id)
              return (
                <div key={action.id}>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{action.title}</p>
                      {editMode ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditAction(action)
                              setShowActionForm(focus.id)
                            }}
                            className="text-xs text-gray-400 hover:text-gray-700"
                          >
                            {t.goals.edit}
                          </button>
                          <button onClick={() => deleteAction(action.id)} className="text-xs text-red-400 hover:text-red-600">
                            {t.goals.del}
                          </button>
                        </div>
                      ) : action.type !== 'reflection' ? (
                        <ActionCheckinEditor
                          action={action}
                          initialValue={checkin?.value || ''}
                          onSave={(value) => saveCheckin(action.id, value)}
                          reflectionPlaceholder={t.dashboard.writeReflection}
                          compact
                        />
                      ) : null}
                    </div>
                    {!editMode && action.type === 'reflection' && (
                      <div className="mt-2">
                        <ActionCheckinEditor
                          action={action}
                          initialValue={checkin?.value || ''}
                          onSave={(value) => saveCheckin(action.id, value)}
                          reflectionPlaceholder={t.dashboard.writeReflection}
                        />
                      </div>
                    )}
                  </div>

                  {editMode && showActionForm === focus.id && editAction?.id === action.id && (
                    <ActionForm
                      initial={action}
                      onSave={(data) => saveAction(data, focus.id, action.id)}
                      onCancel={() => {
                        setShowActionForm(null)
                        setEditAction(null)
                      }}
                      t={t.goals}
                    />
                  )}
                </div>
              )
            })}

            {editMode && (
              <>
                <button
                  onClick={() => {
                    setEditAction(null)
                    setShowActionForm(focus.id)
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {t.goals.addAction}
                </button>
                {showActionForm === focus.id && !editAction && (
                  <ActionForm
                    onSave={(data) => saveAction(data, focus.id)}
                    onCancel={() => setShowActionForm(null)}
                    t={t.goals}
                  />
                )}
              </>
            )}
          </div>
        </div>
      ))}

      {editMode && (
        <>
          <button
            onClick={() => {
              setEditFocus(null)
              setShowFocusForm(true)
            }}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {t.goals.addFocus}
          </button>
          {showFocusForm && !editFocus && (
            <FocusForm onSave={(data) => saveFocus(data)} onCancel={() => setShowFocusForm(false)} t={t.goals} />
          )}
        </>
      )}
    </div>
  )
}

function ActionCheckinEditor({
  action,
  initialValue,
  onSave,
  reflectionPlaceholder,
  compact,
}: {
  action: Action
  initialValue: string
  onSave: (value: string | boolean) => void
  reflectionPlaceholder: string
  compact?: boolean
}) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue, action.id])

  if (action.type === 'binary') {
    const checked = value === 'true'

    return (
      <label className={compact ? 'inline-flex items-center text-sm text-gray-700' : 'inline-flex items-center gap-2 text-sm text-gray-700'}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            const nextValue = String(e.target.checked)
            setValue(nextValue)
            onSave(e.target.checked)
          }}
          className="w-4 h-4 rounded"
        />
      </label>
    )
  }

  if (action.type === 'quantitative') {
    return (
      <div className={compact ? '' : 'flex items-end gap-2'}>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            onSave(e.target.value)
          }}
          className="w-24 border border-gray-200 rounded px-2 py-1 text-sm text-right"
          placeholder="0"
        />
      </div>
    )
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          onSave(e.target.value)
        }}
        rows={2}
        className="w-full border border-gray-200 rounded p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
        placeholder={reflectionPlaceholder}
      />
    </div>
  )
}

function FocusForm({
  initial,
  onSave,
  onCancel,
  t,
}: {
  initial?: { title?: string; description?: string; startDate?: string; endDate?: string }
  onSave: (data: { title: string; description: string; startDate: string; endDate: string }) => void
  onCancel: () => void
  t: ReturnType<typeof useLanguage>['t']['goals']
}) {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [title, setTitle] = useState(initial?.title || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [startDate, setStartDate] = useState(initial?.startDate?.split('T')[0] || today)
  const [endDate, setEndDate] = useState(initial?.endDate?.split('T')[0] || thirtyDays)

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white">
      <h4 className="text-xs font-medium text-gray-600">{initial?.title ? t.focusFormEdit : t.focusFormNew}</h4>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titlePlaceholder} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.descriptionPlaceholder} rows={2} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm resize-none" />
      <div className="flex gap-2">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave({ title, description, startDate, endDate })} className="text-xs bg-gray-900 text-white rounded px-3 py-1.5 hover:bg-gray-700">{t.save}</button>
        <button onClick={onCancel} className="text-xs text-gray-500 px-3 py-1.5">{t.cancel}</button>
      </div>
    </div>
  )
}

function ActionForm({
  initial,
  onSave,
  onCancel,
  t,
}: {
  initial?: { title?: string; type?: string }
  onSave: (data: { title: string; type: string }) => void
  onCancel: () => void
  t: ReturnType<typeof useLanguage>['t']['goals']
}) {
  const [title, setTitle] = useState(initial?.title || '')
  const [type, setType] = useState(initial?.type || 'binary')

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white text-sm">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.actionTitlePlaceholder} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
      <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm">
        <option value="binary">{t.actionTypeBinary}</option>
        <option value="quantitative">{t.actionTypeQuantitative}</option>
        <option value="reflection">{t.actionTypeReflection}</option>
      </select>
      <div className="flex gap-2">
        <button onClick={() => onSave({ title, type })} className="text-xs bg-gray-900 text-white rounded px-3 py-1.5 hover:bg-gray-700">{t.save}</button>
        <button onClick={onCancel} className="text-xs text-gray-500 px-3 py-1.5">{t.cancel}</button>
      </div>
    </div>
  )
}
