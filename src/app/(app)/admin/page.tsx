'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

interface Pair {
  id: string
  type: string
  user: { id: string; name: string }
  partner: { id: string; name: string }
}

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const [users, setUsers] = useState<User[]>([])
  const [pairs, setPairs] = useState<Pair[]>([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [showPairForm, setShowPairForm] = useState(false)
  const [tab, setTab] = useState<'users' | 'pairs'>('users')

  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/goals')
    }
  }, [session, router])

  async function loadUsers() {
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
  }

  async function loadPairs() {
    const res = await fetch('/api/admin/pairs')
    if (res.ok) setPairs(await res.json())
  }

  useEffect(() => {
    loadUsers()
    loadPairs()
  }, [])

  async function saveUser(data: any, id?: string) {
    if (id) {
      await fetch(`/api/admin/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    } else {
      await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    }
    setShowUserForm(false)
    setEditUser(null)
    loadUsers()
  }

  async function deleteUser(id: string) {
    if (!confirm(t.admin.deleteUserConfirm)) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    loadUsers()
  }

  async function deletePair(id: string) {
    if (!confirm(t.admin.deletePairConfirm)) return
    await fetch('/api/admin/pairs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    loadPairs()
  }

  async function savePair(data: any) {
    await fetch('/api/admin/pairs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setShowPairForm(false)
    loadPairs()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{t.admin.title}</h1>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setTab('users')}
          className={`text-sm pb-2 ${tab === 'users' ? 'border-b-2 border-gray-900 font-medium' : 'text-gray-500'}`}
        >
          {t.admin.users}
        </button>
        <button
          onClick={() => setTab('pairs')}
          className={`text-sm pb-2 ${tab === 'pairs' ? 'border-b-2 border-gray-900 font-medium' : 'text-gray-500'}`}
        >
          {t.admin.pairs}
        </button>
      </div>

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setEditUser(null); setShowUserForm(true) }}
              className="text-sm bg-gray-900 text-white rounded-lg px-3 py-1.5 hover:bg-gray-700"
            >
              {t.admin.newUser}
            </button>
          </div>

          {showUserForm && (
            <UserForm
              initial={editUser || undefined}
              onSave={saveUser}
              onCancel={() => { setShowUserForm(false); setEditUser(null) }}
              t={t.admin}
            />
          )}

          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  {user.isAdmin && <span className="text-xs text-blue-500">{t.admin.isAdmin}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditUser(user); setShowUserForm(true) }} className="text-xs text-gray-400 hover:text-gray-700">{t.admin.edit}</button>
                  <button onClick={() => deleteUser(user.id)} className="text-xs text-red-400 hover:text-red-600">{t.admin.delete}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'pairs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowPairForm(true)}
              className="text-sm bg-gray-900 text-white rounded-lg px-3 py-1.5 hover:bg-gray-700"
            >
              {t.admin.addPair}
            </button>
          </div>

          {showPairForm && (
            <PairForm
              users={users}
              onSave={savePair}
              onCancel={() => setShowPairForm(false)}
              t={t.admin}
            />
          )}

          <div className="space-y-2">
            {pairs.map((pair) => (
              <div key={pair.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg">
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{pair.user.name}</span>
                    <span className="text-gray-400 mx-2">↔</span>
                    <span className="font-medium">{pair.partner.name}</span>
                  </p>
                  <p className="text-xs text-gray-400">{pair.type}</p>
                </div>
                <button onClick={() => deletePair(pair.id)} className="text-xs text-red-400 hover:text-red-600">{t.admin.remove}</button>
              </div>
            ))}
            {pairs.length === 0 && <p className="text-sm text-gray-400 text-center py-4">{t.admin.noPairs}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

function UserForm({
  initial,
  onSave,
  onCancel,
  t,
}: {
  initial?: User
  onSave: (data: any, id?: string) => void
  onCancel: () => void
  t: ReturnType<typeof useLanguage>['t']['admin']
}) {
  const [name, setName] = useState(initial?.name || '')
  const [email, setEmail] = useState(initial?.email || '')
  const [password, setPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(initial?.isAdmin || false)

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
      <h3 className="text-sm font-medium">{initial?.id ? t.editUser : t.newUserForm}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} type="email" className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder={initial ? t.passwordChangePlaceholder : t.passwordPlaceholder} type="password" className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
        {t.isAdmin}
      </label>
      <div className="flex gap-2">
        <button onClick={() => onSave({ name, email, password, isAdmin }, initial?.id)} className="text-xs bg-gray-900 text-white rounded px-3 py-1.5">{t.save}</button>
        <button onClick={onCancel} className="text-xs text-gray-500 px-3 py-1.5">{t.cancel}</button>
      </div>
    </div>
  )
}

function PairForm({
  users,
  onSave,
  onCancel,
  t,
}: {
  users: User[]
  onSave: (data: any) => void
  onCancel: () => void
  t: ReturnType<typeof useLanguage>['t']['admin']
}) {
  const [userId, setUserId] = useState(users[0]?.id || '')
  const [partnerId, setPartnerId] = useState(users[1]?.id || '')
  const [type, setType] = useState('chavruta')

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
      <h3 className="text-sm font-medium">{t.addPairForm}</h3>
      <select value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm">
        {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
      <select value={partnerId} onChange={(e) => setPartnerId(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm">
        {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
      <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm">
        <option value="chavruta">{t.pairTypeChavruta}</option>
        <option value="coach">{t.pairTypeCoach}</option>
      </select>
      <div className="flex gap-2">
        <button onClick={() => onSave({ userId, partnerId, type })} className="text-xs bg-gray-900 text-white rounded px-3 py-1.5">{t.save}</button>
        <button onClick={onCancel} className="text-xs text-gray-500 px-3 py-1.5">{t.cancel}</button>
      </div>
    </div>
  )
}
