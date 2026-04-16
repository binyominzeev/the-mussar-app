'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

type GoalType = 'knowledge' | 'habits'

interface Focus {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  isActive: boolean
  sortOrder: number
}

interface Goal {
  id: string
  type: GoalType
  focuses: Focus[]
}

interface FocusWithGoal extends Focus {
  goalId: string
  goalType: GoalType
}

export default function GoalsPage() {
  const { t } = useLanguage()
  const [goals, setGoals] = useState<Goal[]>([])
  const [editMode, setEditMode] = useState(false)
  const [showFocusForm, setShowFocusForm] = useState(false)
  const [editFocus, setEditFocus] = useState<FocusWithGoal | null>(null)
  const [newFocusType, setNewFocusType] = useState<GoalType>('knowledge')
  const [draggedFocusId, setDraggedFocusId] = useState<string | null>(null)

  const focuses = useMemo(
    () =>
      goals.flatMap((goal) =>
        goal.focuses.map((focus) => ({
          ...focus,
          goalId: goal.id,
          goalType: goal.type,
        }))
      ),
    [goals]
  )

  const load = useCallback(async () => {
    const res = await fetch('/api/goals')
    setGoals(await res.json())
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function ensureGoalId(type: GoalType) {
    const existing = goals.find((goal) => goal.type === type)
    if (existing) return existing.id

    const created = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        title: type === 'knowledge' ? t.goals.goalTypeKnowledge : t.goals.goalTypeHabits,
        description: '',
      }),
    }).then((r) => r.json())

    await load()
    return created.id as string
  }

  async function saveFocus(data: { title: string; description: string; startDate: string; endDate: string }, id?: string) {
    if (id) {
      await fetch(`/api/focuses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      const goalId = await ensureGoalId(newFocusType)
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

  async function toggleFocusActive(focus: FocusWithGoal) {
    await fetch(`/api/focuses/${focus.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !focus.isActive }),
    })
    await load()
  }

  async function reorderFocuses(draggedId: string, targetId: string) {
    const dragged = focuses.find((focus) => focus.id === draggedId)
    const target = focuses.find((focus) => focus.id === targetId)
    if (!dragged || !target || dragged.id === target.id) return
    if (dragged.goalId !== target.goalId) return

    const siblings = focuses.filter((focus) => focus.goalId === dragged.goalId)
    const fromIndex = siblings.findIndex((focus) => focus.id === dragged.id)
    const toIndex = siblings.findIndex((focus) => focus.id === target.id)
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return

    const reordered = [...siblings]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)

    const changed = reordered
      .map((focus, index) => ({ id: focus.id, nextSortOrder: index, currentSortOrder: focus.sortOrder }))
      .filter((item) => item.currentSortOrder !== item.nextSortOrder)
    if (changed.length === 0) return

    await Promise.all(
      changed.map((item) =>
        fetch(`/api/focuses/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: item.nextSortOrder }),
        })
      )
    )

    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t.goals.title}</h1>
        <button
          type="button"
          onClick={() => {
            setEditMode((prev) => !prev)
            setShowFocusForm(false)
            setEditFocus(null)
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
        <div
          key={focus.id}
          className={[
            'border rounded-xl p-4 space-y-2',
            editMode ? 'cursor-grab active:cursor-grabbing' : '',
            focus.isActive ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-50 opacity-70',
          ]
            .filter(Boolean)
            .join(' ')}
          draggable={editMode}
          onDragStart={() => setDraggedFocusId(focus.id)}
          onDragOver={(event) => {
            if (!editMode || !draggedFocusId || draggedFocusId === focus.id) return
            event.preventDefault()
          }}
          onDrop={async (event) => {
            event.preventDefault()
            if (!editMode || !draggedFocusId || draggedFocusId === focus.id) return
            await reorderFocuses(draggedFocusId, focus.id)
            setDraggedFocusId(null)
          }}
          onDragEnd={() => setDraggedFocusId(null)}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                {focus.goalType === 'knowledge' ? t.goals.knowledge : t.goals.habits}
              </p>
              <h2 className="font-medium">
                {focus.title}
                {!focus.isActive && (
                  <span className="ml-2 text-[11px] uppercase tracking-wide text-gray-500">{t.goals.inactive}</span>
                )}
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">{focus.description}</p>
            </div>
            {editMode && (
              <div className="flex gap-2 ml-3">
                <button
                  onClick={() => toggleFocusActive(focus)}
                  className="text-xs text-gray-400 hover:text-gray-700"
                >
                  {focus.isActive ? t.goals.deactivate : t.goals.activate}
                </button>
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
            {t.goals.addFocusFor}
          </button>
          {showFocusForm && !editFocus && (
            <FocusForm
              type={newFocusType}
              onTypeChange={setNewFocusType}
              onSave={(data) => saveFocus(data)}
              onCancel={() => setShowFocusForm(false)}
              t={t.goals}
            />
          )}
        </>
      )}
    </div>
  )
}

function FocusForm({
  initial,
  type,
  onTypeChange,
  onSave,
  onCancel,
  t,
}: {
  initial?: { title?: string; description?: string; startDate?: string; endDate?: string }
  type?: GoalType
  onTypeChange?: (type: GoalType) => void
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
      {type && onTypeChange && (
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as GoalType)}
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
        >
          <option value="knowledge">{t.goalTypeKnowledge}</option>
          <option value="habits">{t.goalTypeHabits}</option>
        </select>
      )}
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
