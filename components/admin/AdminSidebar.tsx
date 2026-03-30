'use client'
import Link from 'next/link'
import { Heart, Users, Trophy, Heart as CharityIcon, CheckCircle, BarChart2, LogOut } from 'lucide-react'

export function AdminSidebar({ onLogout, active }: { onLogout: () => void; active: string }) {
  const navItems = [
    { href: '/admin', label: 'Overview', icon: BarChart2 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/draws', label: 'Draw Engine', icon: Trophy },
    { href: '/admin/charities', label: 'Charities', icon: CharityIcon },
    { href: '/admin/winners', label: 'Winners', icon: CheckCircle },
  ]
  return (
    <aside className="w-64 flex-shrink-0 glass border-r border-white/5 flex flex-col p-6">
      <Link href="/" className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
          <Heart className="w-4 h-4 text-dark-900 fill-dark-900" />
        </div>
        <span className="font-display text-lg font-bold text-white">GolfGives</span>
      </Link>
      <div className="text-xs text-brand-400 font-medium mb-8 pl-10">Admin Panel</div>
      <nav className="space-y-1 flex-1">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active === item.href ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <button onClick={onLogout} className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm transition-colors px-4 py-2">
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </aside>
  )
}