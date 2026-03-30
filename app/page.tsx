'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Heart, Trophy, TrendingUp, ArrowRight, Star, CheckCircle, ChevronDown } from 'lucide-react'

const CHARITIES = [
  { name: "Cancer Research UK", raised: "£2.4M", color: "#22c55e" },
  { name: "British Heart Foundation", raised: "£1.8M", color: "#16a34a" },
  { name: "Alzheimer's Society", raised: "£1.2M", color: "#15803d" },
]

const STATS = [
  { value: "£847,200", label: "Raised for charity", icon: Heart },
  { value: "12,400+", label: "Active members", icon: Star },
  { value: "£234,000", label: "Prizes paid out", icon: Trophy },
]

export default function HomePage() {
  const [activeCharity, setActiveCharity] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCharity(p => (p + 1) % CHARITIES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const target = 847200
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + increment, target)
      setCount(Math.floor(current))
      if (current >= target) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-dark-900 fill-dark-900" />
          </div>
          <span className="font-display text-xl font-bold text-white">GolfGives</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <Link href="/charities" className="hover:text-white transition-colors">Charities</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link href="#prizes" className="hover:text-white transition-colors">Prizes</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-white/60 hover:text-white transition-colors">Sign in</Link>
          <Link href="/subscribe" className="btn-primary text-sm py-2 px-4">
            Start Playing
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-700/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-brand-400/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Live counter pill */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 text-sm">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-white/60">Live:</span>
            <span className="text-brand-400 font-semibold">£{count.toLocaleString()} raised this year</span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-bold leading-tight mb-6">
            <span className="text-white">Your Golf Round</span>
            <br />
            <span className="text-brand-400">Changes Lives</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto mb-4">
            Track your Stableford scores, enter monthly prize draws,
            and automatically support the charities that matter to you.
          </p>

          <div className="flex items-center justify-center gap-2 mb-10 text-sm text-white/40">
            <span>Currently supporting</span>
            <span className="text-brand-400 font-medium transition-all duration-500">
              {CHARITIES[activeCharity].name}
            </span>
            <span>and more</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/subscribe" className="btn-primary text-lg py-4 px-8 flex items-center gap-2">
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-lg py-4 px-8">
              See How It Works
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {STATS.map((stat, i) => (
              <div key={i} className="glass rounded-2xl p-5 text-center">
                <stat.icon className="w-6 h-6 text-brand-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <a href="#how-it-works" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 hover:text-white/60 transition-colors animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </a>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl font-bold text-white mb-4">Simple as a birdie</h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">Three steps between you and making a real difference</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Subscribe & Choose",
                desc: "Pick monthly or yearly. Choose your charity. A portion of every payment goes directly to your cause.",
                icon: "🎯"
              },
              {
                step: "02",
                title: "Enter Your Scores",
                desc: "Log your last 5 Stableford scores after each round. These are your lottery tickets — automatically entered into the monthly draw.",
                icon: "⛳"
              },
              {
                step: "03",
                title: "Win Prizes, Fund Good",
                desc: "Match 3, 4, or all 5 numbers to win. Whether you win or not, your charity benefits every single month.",
                icon: "🏆"
              }
            ].map((item, i) => (
              <div key={i} className="glass rounded-3xl p-8 relative group hover:border-brand-500/30 transition-all duration-300">
                <div className="text-6xl mb-4">{item.icon}</div>
                <div className="text-brand-500/40 font-display text-5xl font-bold absolute top-6 right-6">{item.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIZE SECTION */}
      <section id="prizes" className="py-24 px-6 bg-gradient-to-b from-transparent via-brand-950/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl font-bold text-white mb-4">Monthly Prizes</h2>
            <p className="text-white/40 text-lg">The more members, the bigger the pot</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { match: "5 Numbers", share: "40%", label: "JACKPOT", color: "brand-400", note: "Rolls over if unclaimed" },
              { match: "4 Numbers", share: "35%", label: "SECOND PRIZE", color: "blue-400", note: "Split equally" },
              { match: "3 Numbers", share: "25%", label: "THIRD PRIZE", color: "purple-400", note: "Split equally" },
            ].map((tier, i) => (
              <div key={i} className={`glass rounded-3xl p-8 text-center ${i === 0 ? 'border-brand-500/30' : ''}`}>
                {i === 0 && <div className="text-xs font-bold text-brand-400 tracking-widest mb-4 uppercase">★ {tier.label} ★</div>}
                {i !== 0 && <div className="text-xs font-bold text-white/30 tracking-widest mb-4 uppercase">{tier.label}</div>}
                <div className={`text-5xl font-display font-bold text-${tier.color} mb-2`}>{tier.share}</div>
                <div className="text-white/60 mb-2">of prize pool</div>
                <div className="text-white font-semibold mb-1">Match {tier.match}</div>
                <div className="text-sm text-white/30">{tier.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHARITY SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-brand-400 text-sm font-medium tracking-widest uppercase mb-4">Charity Impact</div>
            <h2 className="font-display text-5xl font-bold text-white mb-6 leading-tight">
              At least 10% of every subscription — guaranteed
            </h2>
            <p className="text-white/50 text-lg mb-8 leading-relaxed">
              You choose where your money goes. Want to give more? Increase your charity percentage any time from your dashboard. Every pound tracked, every donation transparent.
            </p>
            <div className="space-y-4">
              {[
                "Choose from our verified charity directory",
                "Increase your giving percentage at any time",
                "See exactly how much you've raised",
                "One-off donations also available"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-400 flex-shrink-0" />
                  <span className="text-white/70">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {CHARITIES.map((charity, i) => (
              <div key={i} className="glass rounded-2xl p-6 flex items-center justify-between group hover:border-brand-500/30 transition-all">
                <div>
                  <div className="font-semibold text-white mb-1">{charity.name}</div>
                  <div className="text-sm text-white/40">Platform total raised</div>
                </div>
                <div className="text-brand-400 font-bold text-xl">{charity.raised}</div>
              </div>
            ))}
            <Link href="/charities" className="flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors pl-2">
              View all charities <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-16 border-brand-500/20">
          <div className="text-6xl mb-6">⛳</div>
          <h2 className="font-display text-5xl font-bold text-white mb-4">Ready to play with purpose?</h2>
          <p className="text-white/50 text-lg mb-8">Join thousands of golfers making every round count.</p>
          <Link href="/subscribe" className="btn-primary text-lg py-4 px-10 inline-flex items-center gap-2">
            Subscribe Now — From £19.99/month
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="mt-6 text-sm text-white/30">Cancel any time. No lock-in.</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-500 rounded-md flex items-center justify-center">
              <Heart className="w-3 h-3 text-dark-900 fill-dark-900" />
            </div>
            <span className="font-display font-bold text-white">GolfGives</span>
          </div>
          <div className="text-sm text-white/30">© 2026 GolfGives. All rights reserved.</div>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/charities" className="hover:text-white transition-colors">Charities</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/subscribe" className="hover:text-white transition-colors">Subscribe</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
