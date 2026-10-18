import { useEffect, useState } from 'react'
import { API_BASE_URL, apiFetch } from '../security/api'

type Faq = {
  id: number
  kind: string
  village: string
  title: string
  description: string
  sourceLabel: string
  isPublished: boolean
}

type Form = {
  title: string
  description: string
  sourceLabel: string
  isPublished: boolean
}

const emptyForm: Form = {
  title: '',
  description: '',
  sourceLabel: 'SAMCT',
  isPublished: false,
}

export default function FaqManager({ village }: { village: string }) {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState<Form>(emptyForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadFaqs() {
    setError('')
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/api/marketing-content/manage/${encodeURIComponent(village)}`,
      )
      if (!response.ok)
        throw new Error(`Could not load FAQs (HTTP ${response.status}).`)
      const data: unknown = await response.json()
      if (!Array.isArray(data)) throw new Error('Invalid API response.')
      setFaqs((data as Faq[]).filter((item) => item.kind === 'faq'))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not load FAQs.')
    }
  }

  useEffect(() => {
    void loadFaqs()
  }, [village])

  function edit(faq: Faq) {
    setSelectedId(faq.id)
    setForm({
      title: faq.title,
      description: faq.description,
      sourceLabel: faq.sourceLabel,
      isPublished: faq.isPublished,
    })
    setMessage('')
    setError('')
  }

  function clear() {
    setSelectedId(null)
    setForm(emptyForm)
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const url =
        selectedId === null
          ? `${API_BASE_URL}/api/marketing-content/faqs`
          : `${API_BASE_URL}/api/marketing-content/faqs/${selectedId}`
      const response = await apiFetch(url, {
        method: selectedId === null ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, village }),
      })
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          message?: string
        } | null
        throw new Error(
          data?.message || `Failed to save FAQ (HTTP ${response.status}).`,
        )
      }
      clear()
      setMessage('FAQ saved.')
      await loadFaqs()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save FAQ.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(faq: Faq) {
    if (
      !window.confirm(`Delete the FAQ "${faq.title}"? This cannot be undone.`)
    )
      return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/api/marketing-content/faqs/${faq.id}`,
        { method: 'DELETE' },
      )
      if (!response.ok)
        throw new Error(`Delete failed (HTTP ${response.status}).`)
      if (selectedId === faq.id) clear()
      setMessage('FAQ deleted.')
      await loadFaqs()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not delete FAQ.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="samct-card p-4 border rounded-4 bg-white">
      <h2 className="h4">Manage FAQs: {village}</h2>
      <p className="text-secondary">
        Add, edit, publish or remove frequently asked questions for this
        village.
      </p>
      {error && (
        <p className="alert alert-danger" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="alert alert-success" role="status">
          {message}
        </p>
      )}
      <div className="table-responsive mb-4">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Question</th>
              <th>Public status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id}>
                <td>{faq.title}</td>
                <td>{faq.isPublished ? 'Published' : 'Hidden'}</td>
                <td className="d-flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => edit(faq)}
                    disabled={busy}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => void remove(faq)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {faqs.length === 0 && (
          <p className="text-secondary">No FAQs saved for this village yet.</p>
        )}
      </div>
      <h3 className="h5">{selectedId === null ? 'Add FAQ' : 'Edit FAQ'}</h3>
      <form onSubmit={(event) => void submit(event)}>
        <label htmlFor="faq-question" className="form-label">
          Question
        </label>
        <input
          id="faq-question"
          className="form-control mb-3"
          required
          maxLength={160}
          value={form.title}
          onChange={(event) =>
            setForm((value) => ({ ...value, title: event.target.value }))
          }
        />
        <label htmlFor="faq-answer" className="form-label">
          Answer
        </label>
        <textarea
          id="faq-answer"
          className="form-control mb-3"
          required
          maxLength={5000}
          rows={5}
          value={form.description}
          onChange={(event) =>
            setForm((value) => ({ ...value, description: event.target.value }))
          }
        />
        <label htmlFor="faq-source" className="form-label">
          Source / date
        </label>
        <input
          id="faq-source"
          className="form-control mb-3"
          required
          maxLength={160}
          value={form.sourceLabel}
          onChange={(event) =>
            setForm((value) => ({ ...value, sourceLabel: event.target.value }))
          }
        />
        <div className="form-check mb-3">
          <input
            id="faq-published"
            type="checkbox"
            className="form-check-input"
            checked={form.isPublished}
            onChange={(event) =>
              setForm((value) => ({
                ...value,
                isPublished: event.target.checked,
              }))
            }
          />
          <label htmlFor="faq-published" className="form-check-label">
            Show FAQ on the public Marketing page
          </label>
        </div>
        <button type="submit" disabled={busy} className="btn btn-primary me-2">
          {busy ? 'Saving…' : 'Save FAQ'}
        </button>
        {selectedId !== null && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={clear}
            disabled={busy}
          >
            Cancel edit
          </button>
        )}
      </form>
    </section>
  )
}
