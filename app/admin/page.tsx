'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Heart, Users, Trophy, Heart as CharityIcon, CheckCircle, BarChart2, LogOut, Loader2, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => { checkAdmin() }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/dashboard'); return }
    loadStats()
  }

  async function loadStats() {
    const [usersRes, subsRes, winsRes, charitiesRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('winners').select('prize_amount'),
      supabase.from('charities').select('id', { count: 'exact' }).eq('is_active', true),
    ])
    const totalPaid = winsRes.data?.reduce((s: number, w: any) => s + (w.prize_amount || 0), 0) || 0
    setStats({ totalUsers: usersRes.count || 0, activeSubscribers: subsRes.count || 0, totalPaid, activeCharities: charitiesRes.count || 0 })
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>

  return (
    <div className="min-h-screen flex">
      <AdminSidebar onLogout={handleLogout} active="/admin" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Admin Overview</h1>
          <p className="text-white/40">Platform performance at a glance</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-white' },
            { label: 'Active Subscribers', value: stats.activeSubscribers, icon: TrendingUp, color: 'text-brand-400' },
            { label: 'Prizes Paid Out', value: `£${(stats.totalPaid / 100).toFixed(2)}`, icon: Trophy, color: 'text-brand-400' },
            { label: 'Active Charities', value: stats.activeCharities, icon: CharityIcon, color: 'text-pink-400' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40">{s.label}</span>
                <s.icon className="w-4 h-4 text-white/20" />
              </div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { href: '/admin/users', label: 'User Management', desc: 'View, edit, manage subscriptions', icon: Users },
            { href: '/admin/draws', label: 'Draw Engine', desc: 'Configure, simulate, publish draws', icon: Trophy },
            { href: '/admin/charities', label: 'Charities', desc: 'Add, edit, manage charity listings', icon: CharityIcon },
            { href: '/admin/winners', label: 'Winners', desc: 'Verify submissions, manage payouts', icon: CheckCircle },
          ].map(item => (
            <Link key={item.href} href={item.href} className="glass rounded-2xl p-6 flex items-center gap-4 hover:border-brand-500/30 transition-all group">
              <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center group-hover:bg-brand-500/20 transition-all">
                <item.icon className="w-6 h-6 text-brand-400" />
              </div>
              <div>
                <div className="font-semibold text-white">{item.label}</div>
                <div className="text-sm text-white/40">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
