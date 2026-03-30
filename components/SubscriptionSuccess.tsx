'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  // This is just used for the ?subscribed=true redirect page
  // The actual dashboard is already defined, so this handles the success state
  const params = useSearchParams()
  const justSubscribed = params.get('subscribed') === 'true'

  if (!justSubscribed) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/90 backdrop-blur">
      <div className="glass rounded-3xl p-12 text-center max-w-sm mx-4">
        <CheckCircle className="w-16 h-16 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">You're subscribed! 🎉</h2>
        <p className="text-white/50 mb-6">Welcome to GolfGives. Start entering your scores to be in the next draw.</p>
        <button onClick={() => window.location.href = '/dashboard'} className="btn-primary w-full">
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}
