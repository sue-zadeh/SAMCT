import { useEffect, useState } from 'react'
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
  contactName: string
  contactPhone: string
  isPublished?: boolean
}

type Props = { village: string; kinds?: string[] }

export default function MarketingContentEditor({ village, kinds }: Props) {
  const [entries, setEntries] = useState<MarketingContent[]>([])
  const [selected, setSelected] = useState<MarketingContent | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formVersion, setFormVersion] = useState(0)

  async function load() {
    setBusy(true)
    setError('')
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/api/marketing-content/manage/${encodeURIComponent(village)}`,
      )
      if (!response.ok)
        throw new Error(
          `Could not load brochure content (HTTP ${response.status}).`,
        )
      const data: unknown = await response.json()
      if (!Array.isArray(data)) throw new Error('Unexpected API response.')
      setEntries(data as MarketingContent[])
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not load brochure content.',
      )
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void load()
  }, [village])

  const visibleEntries = entries.filter(
    (entry) => !kinds || kinds.includes(entry.kind),
  )

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    setError('')
    setMessage('')
    if (selected.images.length + photos.length > 30) {
      setError('Keep at most 30 images per entry.')
      return
    }
    if (photos.length > 10) {
      setError('Upload at most 10 new photos per save.')
      return
    }
    if (!!selected.contactName.trim() !== !!selected.contactPhone.trim()) {
      setError('Enter both contact name and phone number, or leave both empty.')
      return
    }
    if (
      photos.some(
        (photo) =>
          photo.size > 2 * 1024 * 1024 || !/\.(png|jpe?g)$/i.test(photo.name),
      )
    ) {
      setError('Use JPEG or PNG, at most 2 MB per photo.')
      return
    }
    setBusy(true)
    try {
      const body = new FormData()
      const fields = {
        title: selected.title,
        description: selected.description,
        address: selected.address,
        availability: selected.availability,
        sourceLabel: selected.sourceLabel,
        contactName: selected.contactName,
        contactPhone: selected.contactPhone,
        isPublished: String(Boolean(selected.isPublished)),
      }
      Object.entries(fields).forEach(([name, value]) =>
        body.append(name, value),
      )
      if (selected.priceNzd !== null)
        body.append('priceNzd', String(selected.priceNzd))
      selected.images.forEach((image) => body.append('retainedImages', image))
      photos.forEach((photo) => body.append('photos', photo))
      const response = await apiFetch(
        `${API_BASE_URL}/api/marketing-content/${selected.id}`,
        {
          method: 'PUT',
          body,
        },
      )
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          message?: string
        } | null
        throw new Error(
          result?.message ||
            `Could not save brochure content (HTTP ${response.status}).`,
        )
      }
      setSelected(null)
      setPhotos([])
      setFormVersion((version) => version + 1)
      setMessage('Marketing content saved.')
      await load()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not save marketing content.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="samct-card p-4 border rounded-4 bg-white">
      <h2 className="h4">Marketing & Brochure: {village}</h2>
      <p className="text-secondary">
        Edit home adverts, street areas and public village information. FAQs are
        managed separately.
      </p>
      {error && (
        <p role="alert" className="alert alert-danger">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="alert alert-success">
          {message}
        </p>
      )}
      <label className="form-label" htmlFor="brochure-entry">
        Brochure entry
      </label>
      <select
        id="brochure-entry"
        className="form-select mb-3"
        value={selected?.id ?? ''}
        disabled={busy}
        onChange={(event) => {
          setSelected(
            visibleEntries.find(
              (entry) => entry.id === Number(event.target.value),
            ) ?? null,
          )
          setPhotos([])
          setMessage('')
          setError('')
          setFormVersion((version) => version + 1)
        }}
      >
        <option value="">{busy ? 'Loading…' : 'Choose an entry'}</option>
        {visibleEntries.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.title} ({entry.kind}){entry.isPublished ? '' : ' (hidden)'}
          </option>
        ))}
      </select>
      {visibleEntries.length === 0 && !busy && (
        <p>No brochure entries for this village.</p>
      )}
      {selected && (
        <form key={formVersion} onSubmit={(event) => void save(event)}>
          <label htmlFor="brochure-title" className="form-label">
            Title
          </label>
          <input
            id="brochure-title"
            className="form-control mb-3"
            required
            maxLength={160}
            value={selected.title}
            onChange={(event) =>
              setSelected({ ...selected, title: event.target.value })
            }
          />
          <label htmlFor="brochure-description" className="form-label">
            Description
          </label>
          <textarea
            id="brochure-description"
            className="form-control mb-3"
            required
            rows={5}
            maxLength={5000}
            value={selected.description}
            onChange={(event) =>
              setSelected({ ...selected, description: event.target.value })
            }
          />
          {selected.kind === 'unit' && (
            <>
              <label htmlFor="brochure-address" className="form-label">
                Address
              </label>
              <input
                id="brochure-address"
                className="form-control mb-3"
                maxLength={250}
                value={selected.address}
                onChange={(event) =>
                  setSelected({ ...selected, address: event.target.value })
                }
              />
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label htmlFor="brochure-price" className="form-label">
                    Advertised price (NZD)
                  </label>
                  <input
                    id="brochure-price"
                    type="number"
                    min={0}
                    max={9999999999}
                    step="0.01"
                    className="form-control"
                    value={selected.priceNzd ?? ''}
                    onChange={(event) =>
                      setSelected({
                        ...selected,
                        priceNzd:
                          event.target.value === ''
                            ? null
                            : Number(event.target.value),
                      })
                    }
                  />
                </div>
                <div className="col-sm-6">
                  <label htmlFor="brochure-availability" className="form-label">
                    Availability
                  </label>
                  <select
                    id="brochure-availability"
                    className="form-select"
                    value={selected.availability}
                    onChange={(event) =>
                      setSelected({
                        ...selected,
                        availability: event.target.value,
                      })
                    }
                  >
                    {[
                      'Enquire',
                      'Applications invited',
                      'Under offer',
                      'Unavailable',
                    ].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label htmlFor="brochure-contact-name" className="form-label">
                Contact name
              </label>
              <input
                id="brochure-contact-name"
                className="form-control"
                maxLength={100}
                value={selected.contactName}
                onChange={(event) =>
                  setSelected({ ...selected, contactName: event.target.value })
                }
              />
            </div>
            <div className="col-sm-6">
              <label htmlFor="brochure-contact-phone" className="form-label">
                Contact phone
              </label>
              <input
                id="brochure-contact-phone"
                className="form-control"
                maxLength={32}
                value={selected.contactPhone}
                onChange={(event) =>
                  setSelected({ ...selected, contactPhone: event.target.value })
                }
              />
            </div>
          </div>
          <label htmlFor="brochure-source" className="form-label">
            Information source / date
          </label>
          <input
            id="brochure-source"
            className="form-control mb-3"
            required
            maxLength={160}
            value={selected.sourceLabel}
            onChange={(event) =>
              setSelected({ ...selected, sourceLabel: event.target.value })
            }
          />
          <div className="form-check mb-3">
            <input
              id="brochure-published"
              type="checkbox"
              className="form-check-input"
              checked={Boolean(selected.isPublished)}
              onChange={(event) =>
                setSelected({ ...selected, isPublished: event.target.checked })
              }
            />
            <label htmlFor="brochure-published" className="form-check-label">
              Publish on Marketing
            </label>
          </div>
          <p className="small">
            {selected.images.length + photos.length}/30 images. JPEG/PNG only,
            maximum 2 MB each; add up to 10 photos per save.
          </p>
          <div className="row g-3 mb-3">
            {selected.images.map((image, index) => (
              <div className="col-6 col-md-3" key={`${image}-${index}`}>
                <img
                  src={`${API_BASE_URL}${image}`}
                  alt={`${selected.title}, photo ${index + 1}`}
                  className="w-100 rounded"
                  style={{ height: 110, objectFit: 'contain' }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger mt-2"
                  onClick={() =>
                    setSelected({
                      ...selected,
                      images: selected.images.filter(
                        (existing) => existing !== image,
                      ),
                    })
                  }
                >
                  Remove photo
                </button>
              </div>
            ))}
          </div>
          <label htmlFor="brochure-photos" className="form-label">
            Add photos
          </label>
          <input
            id="brochure-photos"
            className="form-control mb-3"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png"
            onChange={(event) =>
              setPhotos(Array.from(event.target.files ?? []))
            }
          />
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save brochure entry'}
          </button>
        </form>
      )}
    </section>
  )
}
