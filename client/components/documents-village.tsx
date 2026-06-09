import { useEffect, useState } from 'react'
import Navbar from './navbar'

type DocumentNotice = {
  id: number
  title: string
  type: string
  description: string
  village: string
  fileUrl: string
  isVisibleToResidents: boolean
  createdBy: string
  createdAt: string
}

function DocumentsVillage() {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5072'
  const village = localStorage.getItem('village') || 'Papakura'
  const userName = localStorage.getItem('username') || ''

  const [documents, setDocuments] = useState<DocumentNotice[]>([])
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Notice')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isVisibleToResidents, setIsVisibleToResidents] = useState(true)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const getFileLink = (fileUrl: string) => {
    if (!fileUrl) return ''
    return fileUrl.startsWith('http') ? fileUrl : `${API_BASE_URL}${fileUrl}`
  }

  const loadDocuments = async () => {
    try {
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/documents/village/${encodeURIComponent(village)}`,
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load documents.')
      }

      setDocuments(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load documents.')
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [village])

  const resetForm = () => {
    setTitle('')
    setType('Notice')
    setDescription('')
    setSelectedFile(null)
    setIsVisibleToResidents(true)
    setEditingId(null)
  }

  const handleSubmit = async () => {
    try {
      setMessage('')
      setError('')

      if (!title.trim() || !description.trim()) {
        setError('Please enter title and description.')
        return
      }

      const formData = new FormData()
      formData.append('title', title)
      formData.append('type', type)
      formData.append('description', description)
      formData.append('village', village)
      formData.append('createdByUserName', userName)
      formData.append('isVisibleToResidents', String(isVisibleToResidents))

      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      const url = editingId
        ? `${API_BASE_URL}/api/documents/${editingId}`
        : `${API_BASE_URL}/api/documents`

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save document.')
      }

      setMessage(
        editingId
          ? 'Document updated successfully.'
          : 'Document saved successfully.',
      )
      resetForm()
      await loadDocuments()
    } catch (err: any) {
      setError(err.message || 'Failed to save document.')
    }
  }

  const handleEdit = (doc: DocumentNotice) => {
    setEditingId(doc.id)
    setTitle(doc.title)
    setType(doc.type)
    setDescription(doc.description)
    setIsVisibleToResidents(doc.isVisibleToResidents)
    setSelectedFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Delete this document or notice?')

    if (!confirmed) return

    try {
      setMessage('')
      setError('')

      const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete document.')
      }

      setMessage('Document deleted successfully.')
      await loadDocuments()
    } catch (err: any) {
      setError(err.message || 'Failed to delete document.')
    }
  }

  const toggleVisibility = async (doc: DocumentNotice) => {
    try {
      setMessage('')
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/documents/${doc.id}/visibility`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(!doc.isVisibleToResidents),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update visibility.')
      }

      await loadDocuments()
    } catch (err: any) {
      setError(err.message || 'Failed to update visibility.')
    }
  }

  return (
    <>
      <Navbar userType="villageManager" />

      <main className="container py-5">
        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <p className="text-uppercase text-primary fw-semibold mb-1">
              Village Documents & Notices
            </p>
            <h1 className="fw-bold mb-2">Documents & Notices - {village}</h1>
            <p className="text-secondary mb-0">
              Upload notices, minutes, Code of Practice documents, and village
              files.
            </p>
          </div>
        </section>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <h2 className="h4 fw-bold mb-3">
              {editingId
                ? 'Edit Document or Notice'
                : 'Add New Document or Notice'}
            </h2>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Title</label>
                <input
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: Water shutdown notice"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Type</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Notice">Notice</option>
                  <option value="Minutes">Minutes</option>
                  <option value="Consultation Minutes">
                    Consultation Minutes
                  </option>
                  <option value="Code of Practice">Code of Practice</option>
                  <option value="Village Data">Village Data</option>
                  <option value="General Document">General Document</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Village</label>
                <input className="form-control" value={village} readOnly />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Description</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write the notice or document details..."
                />
              </div>

              <div className="col-md-8">
                <label className="form-label fw-semibold">Upload File</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <p className="small text-secondary mt-1 mb-0">
                  Allowed: PDF, Word, Excel, JPG, PNG.
                </p>
              </div>

              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isVisibleToResidents}
                    onChange={(e) => setIsVisibleToResidents(e.target.checked)}
                    id="visibleToResidents"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="visibleToResidents"
                  >
                    Visible to residents
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingId
                  ? 'Update Document / Notice'
                  : 'Save Document / Notice'}
              </button>

              {editingId && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <h2 className="h4 fw-bold mb-3">Saved Documents & Notices</h2>

            {documents.length === 0 ? (
              <p className="text-secondary mb-0">
                No documents or notices saved yet.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Uploaded By</th>
                      <th>Resident Access</th>
                      <th>File</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          {new Date(doc.createdAt).toLocaleDateString('en-NZ')}
                        </td>

                        <td>
                          <strong>{doc.title}</strong>
                          <div className="small text-secondary">
                            {doc.description}
                          </div>
                        </td>

                        <td>{doc.type}</td>

                        <td>{doc.createdBy || 'Unknown'}</td>

                        <td>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={doc.isVisibleToResidents}
                              onChange={() => toggleVisibility(doc)}
                            />
                            <label className="form-check-label small">
                              {doc.isVisibleToResidents ? 'Visible' : 'Hidden'}
                            </label>
                          </div>
                        </td>

                        <td>
                          {doc.fileUrl ? (
                            <a
                              className="btn btn-outline-primary btn-sm"
                              href={getFileLink(doc.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open / Download
                            </a>
                          ) : (
                            <span className="text-secondary">No file</span>
                          )}
                        </td>

                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() => handleEdit(doc)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(doc.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}

export default DocumentsVillage
