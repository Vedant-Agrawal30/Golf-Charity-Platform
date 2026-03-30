'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { PLANS } from '@/lib/stripe'

export default function SubscribePage() {
  const [selected, setSelected] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')

    const supabase = createBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      window.location.href = '/auth/login'
      return
    }

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: selected }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Something went wrong.')
        setLoading(false)
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const savings = Math.round(
    ((PLANS.monthly.price * 12 - PLANS.yearly.price) / (PLANS.monthly.price * 12)) * 100
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden"
      style={{ background: '#080c0a' }}>

      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #22c55e 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px] pointer-events-none"
        style={{ background: '#15803d' }} />

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: '#22c55e' }}>⛳</div>
        <span className="text-white font-bold text-xl tracking-tight">GolfGives</span>
      </div>

      {/* Heading */}
      <div className="text-center mb-3">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          Choose Your Plan
        </h1>
        <p className="text-white/50 text-base max-w-sm mx-auto">
          Every subscription contributes to a charity pool. Play golf. Give back.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-3 mt-8 mb-8">
        <span className={`text-sm font-medium transition-colors ${selected === 'monthly' ? 'text-white' : 'text-white/40'}`}>Monthly</span>
        <button
          onClick={() => setSelected(selected === 'monthly' ? 'yearly' : 'monthly')}
          className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none"
          style={{ background: '#22c55e' }}
        >
          <div className={`absolute top-1 w-5 h-5 rounded-full bg-black transition-all duration-300 ${selected === 'yearly' ? 'left-8' : 'left-1'}`} />
        </button>
        <span className={`text-sm font-medium transition-colors ${selected === 'yearly' ? 'text-white' : 'text-white/40'}`}>
          Yearly
          <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
            Save {savings}%
          </span>
        </span>
      </div>

      {/* Plan Cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        {(['monthly', 'yearly'] as const).map((plan) => {
          const p = PLANS[plan]
          const isSelected = selected === plan
          const priceInPounds = (p.price / 100).toFixed(2)
          const poolInPounds = (p.pool_contribution / 100).toFixed(2)

          return (
            <button
              key={plan}
              onClick={() => setSelected(plan)}
              className="relative flex-1 text-left rounded-2xl p-6 transition-all duration-300 focus:outline-none"
              style={{
                background: isSelected ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                border: isSelected ? '1.5px solid rgba(34,197,94,0.5)' : '1.5px solid rgba(255,255,255,0.07)',
                boxShadow: isSelected ? '0 0 40px rgba(34,197,94,0.12)' : 'none',
              }}
            >
              {/* Popular badge */}
              {plan === 'yearly' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: '#22c55e', color: '#000' }}>
                  Most Popular
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold text-lg">{p.name}</span>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: isSelected ? '#22c55e' : 'rgba(255,255,255,0.2)',
                    background: isSelected ? '#22c55e' : 'transparent'
                  }}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                </div>
              </div>

              {/* Price */}
              <div className="mb-1">
                <span className="text-white/40 text-sm"> ₹</span>
                <span className="text-white font-extrabold text-4xl">{priceInPounds.split('.')[0]}</span>
                <span className="text-white/60 text-lg">.{priceInPounds.split('.')[1]}</span>
                <span className="text-white/40 text-sm ml-1">/ {p.interval}</span>
              </div>

              {plan === 'yearly' && (
                <p className="text-white/30 text-xs mb-4 line-through">
                  ₹{(PLANS.monthly.price * 12 / 100).toFixed(2)} / year
                </p>
              )}
              {plan === 'monthly' && <div className="mb-4" />}

              {/* Divider */}
              <div className="w-full h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />

              {/* Features */}
              <ul className="space-y-2.5">
                {[
                  `Min. ${p.charity_min_percent}% to your charity`,
                  ` ₹${poolInPounds} to community pool`,
                  'Full tournament access',
                  'Live leaderboard',
                  'Charity impact dashboard',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-white/70">
                    <span style={{ color: '#22c55e' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <p className="mt-5 text-red-400 text-sm">{error}</p>
      )}

      {/* CTA Button */}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="mt-8 font-bold text-base px-10 py-4 rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: loading ? 'rgba(34,197,94,0.5)' : '#22c55e',
          color: '#000',
          boxShadow: '0 0 30px rgba(34,197,94,0.35)',
        }}
      >
        {loading ? 'Redirecting to checkout...' : `Subscribe ${PLANS[selected].name} —  ₹${(PLANS[selected].price / 100).toFixed(2)}`}
      </button>

      <p className="mt-4 text-white/25 text-xs text-center max-w-xs">
        Secure payment via Stripe. Cancel anytime. Your subscription helps fund real charities.
      </p>
    </div>
  )
}
