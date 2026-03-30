'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Loader2, Search, Edit2, Save, X } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => { checkAdmin() }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/dashboard'); return }
    loadUsers()
  }

  async function loadUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*, subscriptions(plan, status, charity_percentage, charity:charities(name)), golf_scores(score, date_played)')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  async function saveEdit(userId: string) {
    await supabase.from('profiles').update({ full_name: editName }).eq('id', userId)
    setEditingUser(null)
    loadUsers()
  }

  async function toggleSubStatus(userId: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    await supabase.from('subscriptions').update({ status: newStatus }).eq('user_id', userId)
    loadUsers()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>

  return (
    <div className="min-h-screen flex">
      <AdminSidebar onLogout={handleLogout} active="/admin/users" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Users</h1>
            <p className="text-white/40">{users.length} total members</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 w-64" />
          </div>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr><th>Name / Email</th><th>Subscription</th><th>Charity</th><th>Scores</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const sub = user.subscriptions?.[0]
                const scores = user.golf_scores || []
                return (
                  <tr key={user.id}>
                    <td>
                      {editingUser === user.id ? (
                        <div className="flex items-center gap-2">
                          <input value={editName} onChange={e => setEditName(e.target.value)} className="input-field py-1 text-sm w-40" />
                          <button onClick={() => saveEdit(user.id)} className="text-brand-400"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setEditingUser(null)} className="text-white/30"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-white font-medium">{user.full_name}</div>
                          <div className="text-white/40 text-xs">{user.email}</div>
                        </div>
                      )}
                    </td>
                    <td>
                      {sub ? (
                        <div className="flex items-center gap-2">
                          <span className={sub.status === 'active' ? 'status-active' : 'status-inactive'}>{sub.status}</span>
                          <span className="text-xs text-white/30 capitalize">{sub.plan}</span>
                        </div>
                      ) : <span className="text-white/20 text-sm">None</span>}
                    </td>
                    <td>
                      {sub ? (
                        <div>
                          <div className="text-white/70 text-sm">{sub.charity?.name || '–'}</div>
                          <div className="text-white/30 text-xs">{sub.charity_percentage}%</div>
                        </div>
                      ) : '–'}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {scores.slice(0, 5).map((s: any, i: number) => (
                          <span key={i} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 text-xs font-bold">{s.score}</span>
                        ))}
                        {scores.length === 0 && <span className="text-white/20 text-sm">–</span>}
                      </div>
                    </td>
                    <td className="text-white/40 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingUser(user.id); setEditName(user.full_name) }} className="text-white/30 hover:text-brand-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        {sub && (
                          <button onClick={() => toggleSubStatus(user.id, sub.status)} className="text-xs px-2 py-1 rounded-lg border border-white/10 text-white/40 hover:border-brand-500/30 hover:text-brand-400 transition-all">
                            {sub.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-white/20">No users found</div>}
        </div>
      </main>
    </div>
  )
}
