'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { generateRandomDraw, generateAlgorithmicDraw, checkMatch, calculatePrizePools, formatCurrency } from '@/utils/drawEngine'
import { Loader2, Play, RefreshCw, Send, Trophy, AlertCircle } from 'lucide-react'

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random')
  const [simResult, setSimResult] = useState<any>(null)
  const [simulating, setSimulating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [activeSubscribers, setActiveSubscribers] = useState(0)
  const [jackpotRollover, setJackpotRollover] = useState(0)
  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => { checkAdmin() }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/dashboard'); return }
    loadData()
  }

  async function loadData() {
    const [drawsRes, subsRes, lastDrawRes] = await Promise.all([
      supabase.from('draws').select('*').order('month', { ascending: false }),
      supabase.from('subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('draws').select('jackpot_rollover, five_match_winner_count').order('month', { ascending: false }).limit(1).single()
    ])
    setDraws(drawsRes.data || [])
    setActiveSubscribers(subsRes.count || 0)
    if (lastDrawRes.data?.five_match_winner_count === 0) {
      setJackpotRollover(lastDrawRes.data?.jackpot_rollover || 0)
    }
    setLoading(false)
  }

  async function runSimulation() {
    setSimulating(true)

    // Get all user scores for algorithmic draw
    const { data: allScores } = await supabase.from('golf_scores').select('score, user_id')

    const winningNumbers = drawType === 'random'
      ? generateRandomDraw()
      : generateAlgorithmicDraw(allScores || [])

    const pools = calculatePrizePools(activeSubscribers, jackpotRollover)

    // Get all subscriber scores and check matches
    const { data: subscribers } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active')

    const userScores: Record<string, number[]> = {}
    if (allScores) {
      allScores.forEach(s => {
        if (!userScores[s.user_id]) userScores[s.user_id] = []
        userScores[s.user_id].push(s.score)
      })
    }

    const matches = { 5: [] as string[], 4: [] as string[], 3: [] as string[] }
    subscribers?.forEach(sub => {
      const scores = userScores[sub.user_id] || []
      const match = checkMatch(scores, winningNumbers)
      if (match === 5) matches[5].push(sub.user_id)
      else if (match === 4) matches[4].push(sub.user_id)
      else if (match === 3) matches[3].push(sub.user_id)
    })

    const fiveMatchPrize = matches[5].length > 0 ? Math.floor(pools.fiveMatch / matches[5].length) : 0
    const fourMatchPrize = matches[4].length > 0 ? Math.floor(pools.fourMatch / matches[4].length) : 0
    const threeMatchPrize = matches[3].length > 0 ? Math.floor(pools.threeMatch / matches[3].length) : 0

    setSimResult({
      winningNumbers,
      pools,
      matches,
      prizes: { 5: fiveMatchPrize, 4: fourMatchPrize, 3: threeMatchPrize },
      isJackpotWon: matches[5].length > 0,
    })
    setSimulating(false)
  }

  async function publishDraw() {
    if (!simResult) return
    setPublishing(true)

    const month = new Date().toISOString().slice(0, 7)

    // Check if draw for this month already exists
    const { data: existing } = await supabase.from('draws').select('id').eq('month', month).single()
    if (existing) {
      alert('A draw for this month already exists!')
      setPublishing(false)
      return
    }

    const newRollover = simResult.isJackpotWon ? 0 : simResult.pools.fiveMatch

    const { data: draw, error } = await supabase.from('draws').insert({
      month,
      status: 'published',
      draw_type: drawType,
      winning_numbers: simResult.winningNumbers,
      five_match_pool: simResult.pools.fiveMatch,
      four_match_pool: simResult.pools.fourMatch,
      three_match_pool: simResult.pools.threeMatch,
      jackpot_rollover: newRollover,
      five_match_winner_count: simResult.matches[5].length,
      four_match_winner_count: simResult.matches[4].length,
      three_match_winner_count: simResult.matches[3].length,
      published_at: new Date().toISOString(),
    }).select().single()

    if (error) { alert('Error publishing draw'); setPublishing(false); return }

    // Create winner records
    const winnerInserts: any[] = []
    const drawId = draw.id

    // Get draw entries for all users
    const { data: allScores } = await supabase.from('golf_scores').select('user_id, score')
    const userScores: Record<string, number[]> = {}
    allScores?.forEach(s => {
      if (!userScores[s.user_id]) userScores[s.user_id] = []
      userScores[s.user_id].push(s.score)
    })

    ;[5, 4, 3].forEach(matchType => {
      simResult.matches[matchType as 3 | 4 | 5].forEach((userId: string) => {
        winnerInserts.push({
          draw_id: drawId,
          user_id: userId,
          match_type: matchType,
          prize_amount: simResult.prizes[matchType as 3 | 4 | 5],
          verification_status: 'pending',
          payment_status: 'pending',
        })
      })
    })

    if (winnerInserts.length > 0) {
      await supabase.from('winners').insert(winnerInserts)
    }

    setSimResult(null)
    loadData()
    setPublishing(false)
    alert(`Draw published! ${winnerInserts.length} winners created.`)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>

  const pools = calculatePrizePools(activeSubscribers, jackpotRollover)

  return (
    <div className="min-h-screen flex">
      <AdminSidebar onLogout={handleLogout} active="/admin/draws" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Draw Engine</h1>
          <p className="text-white/40">Configure, simulate, and publish monthly draws</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <div className="text-xs text-white/40 mb-2">Active Subscribers</div>
            <div className="text-3xl font-bold text-white">{activeSubscribers}</div>
          </div>
          <div className="stat-card">
            <div className="text-xs text-white/40 mb-2">Current Prize Pool</div>
            <div className="text-3xl font-bold text-brand-400">{formatCurrency(pools.total)}</div>
          </div>
          <div className="stat-card">
            <div className="text-xs text-white/40 mb-2">Jackpot Rollover</div>
            <div className="text-3xl font-bold text-yellow-400">{formatCurrency(jackpotRollover)}</div>
          </div>
        </div>

        {/* Pool breakdown */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Pool Breakdown</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '5-Match Jackpot (40%)', value: pools.fiveMatch, color: 'text-brand-400' },
              { label: '4-Match (35%)', value: pools.fourMatch, color: 'text-blue-400' },
              { label: '3-Match (25%)', value: pools.threeMatch, color: 'text-purple-400' },
            ].map((p, i) => (
              <div key={i} className="bg-white/3 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${p.color} mb-1`}>{formatCurrency(p.value)}</div>
                <div className="text-xs text-white/40">{p.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Draw configuration */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Draw Configuration</h2>
          <div className="flex gap-4 mb-6">
            {(['random', 'algorithmic'] as const).map(type => (
              <button
                key={type}
                onClick={() => setDrawType(type)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all capitalize ${drawType === type ? 'bg-brand-500/10 border-brand-500/40 text-brand-400' : 'border-white/10 text-white/40 hover:border-white/20'}`}
              >
                {type === 'random' ? '🎲 Random Draw' : '🧠 Algorithmic Draw'}
                <div className="text-xs font-normal text-white/30 mt-1">
                  {type === 'random' ? 'Standard lottery-style' : 'Weighted by score frequency'}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={runSimulation}
              disabled={simulating}
              className="btn-secondary flex items-center gap-2"
            >
              {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Simulation
            </button>
            {simResult && (
              <button onClick={runSimulation} disabled={simulating} className="btn-secondary flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Re-simulate
              </button>
            )}
          </div>
        </div>

        {/* Simulation result */}
        {simResult && (
          <div className="glass rounded-2xl p-6 mb-6 border-brand-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Simulation Result</h2>
              <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">Preview only — not published</span>
            </div>

            <div className="mb-6">
              <div className="text-sm text-white/40 mb-3">Winning Numbers</div>
              <div className="flex gap-3">
                {simResult.winningNumbers.map((n: number, i: number) => (
                  <div key={i} className="w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/40 flex items-center justify-center text-brand-400 text-xl font-bold font-display">{n}</div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Jackpot Winners', count: simResult.matches[5].length, prize: simResult.prizes[5], color: 'brand' },
                { label: '4-Match Winners', count: simResult.matches[4].length, prize: simResult.prizes[4], color: 'blue' },
                { label: '3-Match Winners', count: simResult.matches[3].length, prize: simResult.prizes[3], color: 'purple' },
              ].map((m, i) => (
                <div key={i} className="bg-white/3 rounded-xl p-4">
                  <div className="text-xs text-white/40 mb-2">{m.label}</div>
                  <div className="text-2xl font-bold text-white mb-1">{m.count}</div>
                  {m.count > 0 && <div className={`text-sm text-${m.color}-400`}>{formatCurrency(m.prize)} each</div>}
                </div>
              ))}
            </div>

            {!simResult.isJackpotWon && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl mb-4 text-sm text-yellow-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                No jackpot winner — {formatCurrency(simResult.pools.fiveMatch)} will roll over to next month
              </div>
            )}

            <button
              onClick={publishDraw}
              disabled={publishing}
              className="btn-primary flex items-center gap-2"
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publish This Draw
            </button>
          </div>
        )}

        {/* Past draws */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Past Draws</h2>
          {draws.length === 0 ? (
            <div className="text-center py-8 text-white/20">No draws yet</div>
          ) : (
            <table className="admin-table">
              <thead><tr><th>Month</th><th>Type</th><th>Winning Numbers</th><th>Winners</th><th>Jackpot</th><th>Status</th></tr></thead>
              <tbody>
                {draws.map(draw => (
                  <tr key={draw.id}>
                    <td className="font-medium text-white">{draw.month}</td>
                    <td className="text-white/50 capitalize">{draw.draw_type}</td>
                    <td>
                      <div className="flex gap-1">
                        {draw.winning_numbers?.map((n: number, i: number) => (
                          <span key={i} className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-500/10 text-brand-400 text-xs font-bold">{n}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="text-white/60">{draw.five_match_winner_count + draw.four_match_winner_count + draw.three_match_winner_count} total</span>
                    </td>
                    <td className={draw.five_match_winner_count > 0 ? 'text-brand-400' : 'text-yellow-400'}>
                      {draw.five_match_winner_count > 0 ? '✓ Won' : `↗ Rolled over`}
                    </td>
                    <td><span className="status-active">{draw.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
