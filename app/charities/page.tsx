'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import Link from 'next/link'
import { Heart, Search, Star, ExternalLink, ArrowLeft } from 'lucide-react'

export default function CharitiesPage() {
  const [charities, setCharities] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    supabase.from('charities').select('*').eq('is_active', true).order('is_featured', { ascending: false }).then(({ data }) => {
      setCharities(data || [])
      setLoading(false)
    })
  }, [])

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  )
  const featured = filtered.filter(c => c.is_featured)
  const rest = filtered.filter(c => !c.is_featured)

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-dark-900 fill-dark-900" />
          </div>
          <span className="font-display text-xl font-bold text-white">GolfGives</span>
        </Link>
        <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl font-bold text-white mb-4">Our Charity Partners</h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">Every subscription contributes to one of these verified charities. You choose which one.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text" placeholder="Search charities..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4 text-sm text-white/40">
              <Star className="w-4 h-4 text-brand-400 fill-brand-400" />
              <span>Spotlight Charities</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featured.map(c => (
                <div key={c.id} className="glass rounded-3xl p-8 border-brand-500/20 relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center gap-1 text-xs text-brand-400 bg-brand-500/10 px-2 py-1 rounded-full font-medium">
                      <Star className="w-3 h-3 fill-brand-400" /> Featured
                    </span>
                  </div>
                  {c.image_url && (
                    <img src={c.image_url} alt={c.name} className="w-16 h-16 rounded-2xl object-cover mb-4 border border-white/10" />
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{c.name}</h3>
                  <p className="text-white/50 leading-relaxed mb-4">{c.description}</p>
                  <div className="flex items-center justify-between">
                    {c.website_url && (
                      <a href={c.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-sm transition-colors">
                        Visit website <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">Support This Charity</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All charities */}
        {rest.length > 0 && (
          <div>
            <div className="text-sm text-white/40 mb-4">All Charities</div>
            <div className="grid md:grid-cols-3 gap-4">
              {rest.map(c => (
                <div key={c.id} className="glass rounded-2xl p-6 hover:border-brand-500/20 transition-all">
                  {c.image_url && (
                    <img src={c.image_url} alt={c.name} className="w-10 h-10 rounded-xl object-cover mb-3 border border-white/10" />
                  )}
                  <h3 className="font-semibold text-white mb-2">{c.name}</h3>
                  <p className="text-white/40 text-sm line-clamp-3 mb-3">{c.description}</p>
                  {c.website_url && (
                    <a href={c.website_url} target="_blank" rel="noopener noreferrer" className="text-brand-400 text-xs hover:text-brand-300 transition-colors flex items-center gap-1">
                      Learn more <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-16 text-white/30">No charities found matching "{search}"</div>
        )}

        <div className="text-center mt-16">
          <Link href="/auth/signup" className="btn-primary text-lg py-4 px-8 inline-flex items-center gap-2">
            <Heart className="w-5 h-5" /> Start Supporting a Charity
          </Link>
        </div>
      </div>
    </div>
  )
}
