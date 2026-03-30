'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Heart, Trophy, BarChart2, Settings, LogOut, Plus, Trash2, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Score { id: string; score: number; date_played: string }
interface SubData { plan: string; status: string; current_period_end: string; charity_percentage: number; charity?: { name: string } }
interface WinData { id: string; match_type: number; prize_amount: number; verification_status: string; payment_status: string; draw?: { month: string } }

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<SubData | null>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [wins, setWins] = useState<WinData[]>([])
  const [draws, setDraws] = useState<any[]>([])
  const [newScore, setNewScore] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [addingScore, setAddingScore] = useState(false)
  const [activeTab, setActiveTab] = useState<'scores' | 'draws' | 'wins' | 'settings'>('scores')
  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUser(user)

    const [profileRes, subRes, scoresRes, winsRes, drawsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('subscriptions').select('*, charity:charities(name)').eq('user_id', user.id).single(),
      supabase.from('golf_scores').select('*').eq('user_id', user.id).order('date_played', { ascending: false }).limit(5),
      supabase.from('winners').select('*, draw:draws(month)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('draws').select('*').eq('status', 'published').order('month', { ascending: false }).limit(3),
    ])

    setProfile(profileRes.data)
    setSubscription(subRes.data)
    setScores(scoresRes.data || [])
    setWins(winsRes.data || [])
    setDraws(drawsRes.data || [])
    setLoading(false)
  }

  async function addScore() {
    const s = parseInt(newScore)
    if (isNaN(s) || s < 1 || s > 45) return alert('Score must be between 1 and 45')
    setAddingScore(true)

    // Rolling 5-score logic: if already 5, delete oldest
    if (scores.length >= 5) {
      const oldest = [...scores].sort((a, b) => new Date(a.date_played).getTime() - new Date(b.date_played).getTime())[0]
      await supabase.from('golf_scores').delete().eq('id', oldest.id)
    }

    await supabase.from('golf_scores').insert({ user_id: user.id, score: s, date_played: newDate })
    setNewScore('')
    await loadAll()
    setAddingScore(false)
  }

  async function deleteScore(id: string) {
    await supabase.from('golf_scores').delete().eq('id', id)
    setScores(prev => prev.filter(s => s.id !== id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
    </div>
  )

  const totalWon = wins.reduce((sum, w) => sum + (w.prize_amount || 0), 0)
  const isActive = subscription?.status === 'active'

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 glass border-r border-white/5 flex flex-col p-6">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-dark-900 fill-dark-900" />
          </div>
          <span className="font-display text-lg font-bold text-white">GolfGives</span>
        </Link>

        <nav className="space-y-1 flex-1">
          {[
            { key: 'scores', icon: BarChart2, label: 'My Scores' },
            { key: 'draws', icon: Trophy, label: 'Draws' },
            { key: 'wins', icon: CheckCircle, label: 'My Winnings' },
            { key: 'settings', icon: Settings, label: 'Settings' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.key ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm transition-colors px-4 py-2">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {profile?.full_name?.split(' ')[0]} 👋</h1>
            <p className="text-white/40 text-sm mt-1">
              {isActive ? `Subscription active · Renews ${new Date(subscription!.current_period_end).toLocaleDateString()}` : 'No active subscription'}
            </p>
          </div>
          {!isActive && (
            <Link href="/subscribe" className="btn-primary text-sm py-2 px-4">Subscribe Now</Link>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Subscription', value: subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'None', sub: isActive ? '● Active' : '○ Inactive', color: isActive ? 'text-brand-400' : 'text-red-400' },
            { label: 'Scores Entered', value: scores.length + '/5', sub: 'Rolling last 5', color: 'text-white' },
            { label: 'Total Winnings', value: `£${(totalWon / 100).toFixed(2)}`, sub: `${wins.length} prizes`, color: 'text-brand-400' },
            { label: 'Charity', value: subscription?.charity_percentage + '%' || '10%', sub: subscription?.charity?.name?.split(' ')[0] || '–', color: 'text-white' },
          ].map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="text-xs text-white/40 mb-2">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className={`text-xs ${i === 0 ? (isActive ? 'text-brand-400' : 'text-red-400') : 'text-white/30'}`}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'scores' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Add Score</h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number" min="1" max="45" value={newScore}
                    onChange={e => setNewScore(e.target.value)}
                    placeholder="Score (1-45 Stableford)"
                    className="input-field"
                  />
                </div>
                <div className="flex-1">
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="input-field" />
                </div>
                <button onClick={addScore} disabled={addingScore || !isActive} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                  {addingScore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Score
                </button>
              </div>
              {!isActive && <p className="text-xs text-red-400 mt-2">⚠ Active subscription required to enter scores</p>}
              <p className="text-xs text-white/30 mt-2">Only your last 5 scores are kept. Adding a 6th removes the oldest automatically.</p>
            </div>

            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Your Scores ({scores.length}/5)</h2>
              {scores.length === 0 ? (
                <div className="text-center py-12 text-white/30">
                  <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No scores yet. Add your first round above!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scores.map((score, i) => (
                    <div key={score.id} className="flex items-center justify-between p-4 bg-white/3 rounded-xl group">
                      <div className="flex items-center gap-4">
                        <div className="score-badge">{score.score}</div>
                        <div>
                          <div className="text-white font-medium">Stableford Score</div>
                          <div className="text-white/40 text-sm flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(score.date_played).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {i === 0 && <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">Latest</span>}
                        <button onClick={() => deleteScore(score.id)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'draws' && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Recent Draws</h2>
            {draws.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No draws published yet. Check back after month end!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {draws.map(draw => (
                  <div key={draw.id} className="p-5 bg-white/3 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold text-white">Draw — {draw.month}</div>
                        <div className="text-xs text-white/40">Published {new Date(draw.published_at).toLocaleDateString()}</div>
                      </div>
                      <span className="status-active">Published</span>
                    </div>
                    <div className="flex gap-2">
                      {draw.winning_numbers?.map((n: number, i: number) => (
                        <div key={i} className="score-badge text-sm w-10 h-10">{n}</div>
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-sm text-center">
                      <div className="bg-white/3 rounded-lg p-2">
                        <div className="text-brand-400 font-bold">£{(draw.five_match_pool / 100).toFixed(2)}</div>
                        <div className="text-white/30 text-xs">Jackpot</div>
                      </div>
                      <div className="bg-white/3 rounded-lg p-2">
                        <div className="text-blue-400 font-bold">£{(draw.four_match_pool / 100).toFixed(2)}</div>
                        <div className="text-white/30 text-xs">4-Match</div>
                      </div>
                      <div className="bg-white/3 rounded-lg p-2">
                        <div className="text-purple-400 font-bold">£{(draw.three_match_pool / 100).toFixed(2)}</div>
                        <div className="text-white/30 text-xs">3-Match</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'wins' && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">My Winnings</h2>
            {wins.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No wins yet. Keep playing — your numbers could come up!</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Draw Month</th><th>Match Type</th><th>Prize</th><th>Verification</th><th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {wins.map(w => (
                    <tr key={w.id}>
                      <td>{w.draw?.month}</td>
                      <td>{w.match_type}-Number Match</td>
                      <td className="text-brand-400 font-bold">£{(w.prize_amount / 100).toFixed(2)}</td>
                      <td><span className={`status-${w.verification_status === 'approved' ? 'active' : w.verification_status === 'rejected' ? 'inactive' : 'pending'}`}>{w.verification_status}</span></td>
                      <td><span className={`status-${w.payment_status === 'paid' ? 'paid' : 'pending'}`}>{w.payment_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsTab user={user} subscription={subscription} supabase={supabase} onUpdate={loadAll} />
        )}
      </main>
    </div>
  )
}

function SettingsTab({ user, subscription, supabase, onUpdate }: any) {
  const [charityPercent, setCharityPercent] = useState(subscription?.charity_percentage || 10)
  const [saving, setSaving] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const saveCharity = async () => {
    setSaving(true)
    await supabase.from('subscriptions').update({ charity_percentage: charityPercent }).eq('user_id', user.id)
    setSaving(false)
    onUpdate()
  }

  const handleCancelSub = async () => {
    if (!confirm('Are you sure you want to cancel?')) return
    await fetch('/api/stripe/cancel-subscription', { method: 'POST' })
    onUpdate()
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Charity Settings</h2>
        <div className="mb-4">
          <label className="block text-sm text-white/60 mb-2">
            Charity Contribution: <span className="text-brand-400 font-bold">{charityPercent}%</span>
          </label>
          <input type="range" min={10} max={50} value={charityPercent} onChange={e => setCharityPercent(Number(e.target.value))} className="w-full accent-green-500 mb-2" />
          <div className="flex justify-between text-xs text-white/30"><span>10% (minimum)</span><span>50%</span></div>
        </div>
        <button onClick={saveCharity} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Changes
        </button>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-2">Subscription</h2>
        <p className="text-white/40 text-sm mb-4">Plan: {subscription?.plan} · Status: {subscription?.status}</p>
        {subscription?.status === 'active' && (
          <button onClick={handleCancelSub} className="text-red-400 text-sm border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500/5 transition-all">
            Cancel Subscription
          </button>
        )}
      </div>
    </div>
  )
}
