'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit2, Trash2, Star, Loader2, Check, X } from 'lucide-react'

const EMPTY = { name: '', description: '', image_url: '', website_url: '', is_featured: false, is_active: true }

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => { loadCharities() }, [])

  async function loadCharities() {
    const { data } = await supabase.from('charities').select('*').order('created_at', { ascending: false })
    setCharities(data || [])
    setLoading(false)
  }

  async function saveCharity(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (editId) {
      await supabase.from('charities').update(form).eq('id', editId)
    } else {
      await supabase.from('charities').insert(form)
    }
    setForm({ ...EMPTY })
    setEditId(null)
    setShowForm(false)
    setSaving(false)
    loadCharities()
  }

  async function deleteCharity(id: string) {
    if (!confirm('Delete this charity?')) return
    await supabase.from('charities').delete().eq('id', id)
    loadCharities()
  }

  async function toggleFeatured(id: string, current: boolean) {
    await supabase.from('charities').update({ is_featured: !current }).eq('id', id)
    loadCharities()
  }

  function startEdit(c: any) {
    setForm({ name: c.name, description: c.description, image_url: c.image_url || '', website_url: c.website_url || '', is_featured: c.is_featured, is_active: c.is_active })
    setEditId(c.id)
    setShowForm(true)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-white/40 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Charity Management</h1>
              <p className="text-white/40 text-sm">{charities.length} charities listed</p>
            </div>
          </div>
          <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setShowForm(true) }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Charity
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="glass rounded-2xl p-6 mb-6 border-brand-500/20">
            <h2 className="text-lg font-bold text-white mb-4">{editId ? 'Edit Charity' : 'Add New Charity'}</h2>
            <form onSubmit={saveCharity} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Charity Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Cancer Research UK" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Website URL</label>
                  <input type="url" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} className="input-field" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Description *</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none" placeholder="Describe what this charity does..." />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Image URL</label>
                <input type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="input-field" placeholder="https://..." />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="accent-green-500" />
                  <span className="text-sm text-white/70">Featured on homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="accent-green-500" />
                  <span className="text-sm text-white/70">Active (visible to users)</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editId ? 'Save Changes' : 'Add Charity'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Charities grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {charities.map(c => (
            <div key={c.id} className={`glass rounded-2xl p-6 ${!c.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{c.name}</span>
                    {c.is_featured && <Star className="w-4 h-4 text-brand-400 fill-brand-400" />}
                  </div>
                  <span className={c.is_active ? 'status-active' : 'status-inactive'}>{c.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleFeatured(c.id, c.is_featured)} title="Toggle featured" className="p-1.5 text-white/30 hover:text-brand-400 transition-colors">
                    <Star className={`w-4 h-4 ${c.is_featured ? 'fill-brand-400 text-brand-400' : ''}`} />
                  </button>
                  <button onClick={() => startEdit(c)} className="p-1.5 text-white/30 hover:text-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteCharity(c.id)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-white/50 text-sm line-clamp-2">{c.description}</p>
              {c.website_url && (
                <a href={c.website_url} target="_blank" rel="noopener noreferrer" className="text-brand-400 text-xs hover:text-brand-300 transition-colors mt-2 block">
                  {c.website_url} ↗
                </a>
              )}
            </div>
          ))}
          {charities.length === 0 && (
            <div className="col-span-2 text-center py-16 text-white/30">
              No charities yet. Add your first one above.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
