import { useState } from 'react'
import { API_BASE_URL, apiFetch } from '../security/api'

export type MarketingContent = {
  id: number
  village: string
  kind: string
  title: string
  description: string
  address: string
  images: string[]
  priceNzd: number | null
  availability: string
  sourceLabel: string
  isPublished?: boolean
}

export default function MarketingContentEditor({ village }: { village: string }) {
  const [entries, setEntries] = useState<MarketingContent[]>([])
  const [selected, setSelected] = useState<MarketingContent | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [formVersion, setFormVersion] = useState(0)

  async function load() {
    setBusy(true); setError('')
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/marketing-content/manage/${encodeURIComponent(village)}`)
      if (!response.ok) throw new Error('Could not load brochure content.')
      setEntries(await response.json())
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not load brochure content.') }
    finally { setBusy(false) }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!selected) return
    setError(''); setMessage('')
    if (selected.images.length + photos.length > 10) { setError('Keep or upload at most 10 photos.'); return }
    if (photos.some(photo => photo.size > 2 * 1024 * 1024 || !/\.(png|jpe?g)$/i.test(photo.name))) {
      setError('Use JPEG or PNG photos, at most 2 MB each.'); return
    }
    setBusy(true)
    try {
      const body = new FormData()
      for (const [key, value] of Object.entries({ title: selected.title, description: selected.description,
        address: selected.address, availability: selected.availability, sourceLabel: selected.sourceLabel,
        isPublished: String(!!selected.isPublished) })) body.append(key, value)
      if (selected.priceNzd !== null) body.append('priceNzd', String(selected.priceNzd))
      selected.images.forEach(image => body.append('retainedImages', image))
      photos.forEach(photo => body.append('photos', photo))
      const response = await apiFetch(`${API_BASE_URL}/api/marketing-content/${selected.id}`, { method: 'PUT', body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not save marketing content.')
      setSelected(null); setPhotos([]); setMessage('Marketing content saved.'); setFormVersion(version => version + 1)
      await load()
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not save marketing content.') }
    finally { setBusy(false) }
  }

  return <details className="samct-card p-4 my-4 border rounded-4 bg-white" onToggle={event => { if (event.currentTarget.open) void load() }}>
    <summary className="h4 mb-3">Manage brochure content — {village}</summary>
    <p>Update the public area descriptions, unit adverts, FAQs and photos. Check prices, availability and the source date before publishing. Resident records are managed separately above.</p>
    {error && <p role="alert" className="alert alert-danger">{error}</p>}
    {message && <p role="status" className="alert alert-success">{message}</p>}
    <label htmlFor="marketing-entry" className="form-label">Brochure entry</label>
    <select id="marketing-entry" className="form-select mb-3" value={selected?.id ?? ''} disabled={busy} onChange={event => {
      setSelected(entries.find(entry => entry.id === Number(event.target.value)) ?? null)
      setPhotos([]); setMessage(''); setError(''); setFormVersion(version => version + 1)
    }}>
      <option value="">{busy ? 'Loading…' : entries.length ? 'Choose an entry' : 'No brochure content for this village'}</option>
      {entries.map(entry => <option key={entry.id} value={entry.id}>{entry.title}{entry.isPublished ? '' : ' (hidden)'}</option>)}
    </select>
    {selected && <form key={formVersion} onSubmit={save}>
      <label htmlFor="brochure-title" className="form-label">Title</label>
      <input id="brochure-title" className="form-control mb-3" required maxLength={160} value={selected.title} onChange={event => setSelected({ ...selected, title: event.target.value })} />
      <label htmlFor="brochure-description" className="form-label">Description</label>
      <textarea id="brochure-description" className="form-control mb-3" required maxLength={5000} rows={6} value={selected.description} onChange={event => setSelected({ ...selected, description: event.target.value })} />
      {selected.kind === 'unit' && <div className="row g-3 mb-3">
        <div className="col-md-6"><label htmlFor="brochure-price" className="form-label">Advertised price (NZD)</label>
          <input id="brochure-price" type="number" min={0} max={9999999999} step="0.01" className="form-control" value={selected.priceNzd ?? ''} onChange={event => setSelected({ ...selected, priceNzd: event.target.value === '' ? null : Number(event.target.value) })} /></div>
        <div className="col-md-6"><label htmlFor="brochure-availability" className="form-label">Availability</label>
          <select id="brochure-availability" className="form-select" value={selected.availability} onChange={event => setSelected({ ...selected, availability: event.target.value })}>
            {['Enquire', 'Applications invited', 'Under offer', 'Unavailable'].map(status => <option key={status}>{status}</option>)}
          </select></div>
      </div>}
      <label htmlFor="brochure-source" className="form-label">Information source / date</label>
      <input id="brochure-source" className="form-control mb-3" required maxLength={160} value={selected.sourceLabel} onChange={event => setSelected({ ...selected, sourceLabel: event.target.value })} />
      <div className="form-check mb-3"><input id="brochure-published" type="checkbox" className="form-check-input" checked={!!selected.isPublished} onChange={event => setSelected({ ...selected, isPublished: event.target.checked })} />
        <label htmlFor="brochure-published" className="form-check-label">Publish on the marketing page</label></div>
      <p className="small">{selected.images.length + photos.length}/10 photos. The first photo is the cover. Remove a photo to make room for its replacement. JPEG or PNG, up to 2 MB each.</p>
      <div className="row g-3 mb-3">{selected.images.map((image, index) => <div key={image} className="col-6 col-md-3">
        <img src={`${API_BASE_URL}${image}`} alt={`${selected.title}, photo ${index + 1}`} className="w-100 rounded" style={{ height: 120, objectFit: 'contain' }} />
        <button type="button" className="btn btn-sm btn-outline-danger mt-2" onClick={() => setSelected({ ...selected, images: selected.images.filter(existing => existing !== image) })}>Remove photo {index + 1}</button>
      </div>)}</div>
      <label htmlFor="brochure-photos" className="form-label">Add photos</label>
      <input id="brochure-photos" className="form-control mb-3" type="file" accept=".jpg,.jpeg,.png" multiple onChange={event => setPhotos(Array.from(event.target.files ?? []))} />
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save brochure entry'}</button>
    </form>}
  </details>
}
