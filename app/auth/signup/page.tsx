'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { Heart, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [charities, setCharities] = useState<any[]>([])
  const [selectedCharity, setSelectedCharity] = useState('')
  const [charityPercent, setCharityPercent] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    supabase.from('charities').select('id, name, description').eq('is_active', true).then(({ data }) => {
      if (data) setCharities(data)
    })
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }

    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: 'subscriber'
        })

      if (profileError) {
        console.error(profileError)
        setError(profileError.message)
        setLoading(false)
        return
      }

      // 🔥 ADD THIS (AUTO LOGIN)
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) {
        setError(loginError.message)
        setLoading(false)
        return
      }
    }
    router.push('/subscribe')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-dark-900 fill-dark-900" />
            </div>
            <span className="font-display text-2xl font-bold text-white">GolfGives</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Join GolfGives</h1>
          <p className="text-white/40">Step {step} of 2 — {step === 1 ? 'Your details' : 'Choose your charity'}</p>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s <= step ? 'bg-brand-500' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="glass rounded-3xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Full Name</label>
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" placeholder="John Smith" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Password</label>
                  <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Min 8 characters" />
                </div>
                <button type="submit" className="btn-primary w-full">Continue →</button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm text-white/60 mb-3">Choose Your Charity</label>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {charities.length === 0 && (
                      <p className="text-white/30 text-sm text-center py-4">Loading charities...</p>
                    )}
                    {charities.map(c => (
                      <label key={c.id} className={`flex items-center gap-3 glass rounded-xl p-3 cursor-pointer transition-all ${selectedCharity === c.id ? 'border-brand-500/50 bg-brand-500/5' : 'hover:border-white/20'}`}>
                        <input type="radio" name="charity" value={c.id} checked={selectedCharity === c.id} onChange={() => setSelectedCharity(c.id)} className="accent-green-500" required />
                        <div>
                          <div className="text-white font-medium text-sm">{c.name}</div>
                          <div className="text-white/40 text-xs">{c.description?.substring(0, 60)}...</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Charity Contribution: <span className="text-brand-400 font-bold">{charityPercent}%</span>
                    <span className="text-white/30 text-xs ml-2">(minimum 10%)</span>
                  </label>
                  <input
                    type="range" min={10} max={50} value={charityPercent}
                    onChange={e => setCharityPercent(Number(e.target.value))}
                    className="w-full accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-white/30 mt-1">
                    <span>10%</span><span>50%</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                  <button type="submit" disabled={loading || !selectedCharity} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 transition-colors">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
