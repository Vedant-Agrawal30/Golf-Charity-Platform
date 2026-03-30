'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, X, CreditCard, Loader2, ExternalLink } from 'lucide-react'

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('pending')
  const [processing, setProcessing] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => { loadWinners() }, [])

  async function loadWinners() {
    const { data } = await supabase
      .from('winners')
      .select(`
        *,
        profile:profiles(full_name, email),
        draw:draws(month, winning_numbers)
      `)
      .order('created_at', { ascending: false })
    setWinners(data || [])
    setLoading(false)
  }

  async function updateVerification(id: string, status: 'approved' | 'rejected') {
    setProcessing(id)
    await supabase.from('winners').update({ verification_status: status }).eq('id', id)
    setProcessing(null)
    loadWinners()
  }

  async function markPaid(id: string) {
    setProcessing(id)
    await supabase.from('winners').update({ payment_status: 'paid' }).eq('id', id)
    setProcessing(null)
    loadWinners()
  }

  const filtered = winners.filter(w => {
    if (filter === 'pending') return w.verification_status === 'pending'
    if (filter === 'approved') return w.verification_status === 'approved' && w.payment_status === 'pending'
    if (filter === 'paid') return w.payment_status === 'paid'
    return true
  })

  const counts = {
    all: winners.length,
    pending: winners.filter(w => w.verification_status === 'pending').length,
    approved: winners.filter(w => w.verification_status === 'approved' && w.payment_status === 'pending').length,
    paid: winners.filter(w => w.payment_status === 'paid').length,
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-white/40 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Winner Verification</h1>
            <p className="text-white/40 text-sm">Review proof uploads and process payouts</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'paid'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all flex items-center gap-2 ${
                filter === f ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'glass text-white/50 hover:text-white'
              }`}
            >
              {f}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-brand-500/20' : 'bg-white/10'}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {/* Winners table */}
        <div className="glass rounded-2xl overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Winner</th>
                <th>Draw</th>
                <th>Match</th>
                <th>Prize</th>
                <th>Proof</th>
                <th>Verification</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(w => (
                <tr key={w.id}>
                  <td>
                    <div className="font-medium text-white">{w.profile?.full_name}</div>
                    <div className="text-white/40 text-xs">{w.profile?.email}</div>
                  </td>
                  <td>
                    <div className="text-white/80">{w.draw?.month}</div>
                    <div className="flex gap-1 mt-1">
                      {w.draw?.winning_numbers?.map((n: number, i: number) => (
                        <span key={i} className="text-xs bg-brand-500/10 text-brand-400 w-5 h-5 rounded flex items-center justify-center font-bold">{n}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="font-bold" style={{ color: w.match_type === 5 ? '#22c55e' : w.match_type === 4 ? '#60a5fa' : '#a78bfa' }}>
                      {w.match_type}-Match
                    </span>
                  </td>
                  <td className="text-brand-400 font-bold">£{(w.prize_amount / 100).toFixed(2)}</td>
                  <td>
                    {w.proof_url ? (
                      <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-sm transition-colors">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-white/30 text-sm">Not uploaded</span>
                    )}
                  </td>
                  <td>
                    <span className={
                      w.verification_status === 'approved' ? 'status-active' :
                      w.verification_status === 'rejected' ? 'status-inactive' : 'status-pending'
                    }>{w.verification_status}</span>
                  </td>
                  <td>
                    <span className={w.payment_status === 'paid' ? 'status-paid' : 'status-pending'}>
                      {w.payment_status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {w.verification_status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateVerification(w.id, 'approved')}
                            disabled={processing === w.id}
                            title="Approve"
                            className="p-1.5 text-white/30 hover:text-brand-400 transition-colors"
                          >
                            {processing === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => updateVerification(w.id, 'rejected')}
                            disabled={processing === w.id}
                            title="Reject"
                            className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {w.verification_status === 'approved' && w.payment_status === 'pending' && (
                        <button
                          onClick={() => markPaid(w.id)}
                          disabled={processing === w.id}
                          title="Mark as paid"
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-lg hover:bg-brand-500/20 transition-all"
                        >
                          {processing === w.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/30">
              {filter === 'pending' ? 'No pending verifications 🎉' : `No ${filter} records`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
