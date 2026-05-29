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
  const API_BASE_URL = 'http://localhost:5072'
  const village = localStorage.getItem('village') || 'Papakura'
  const userName = localStorage.getItem('username') || ''

  const [documents, setDocuments] = useState<DocumentNotice[]>([])
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Notice')
  const [description, setDescription] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isVisibleToResidents, setIsVisibleToResidents] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

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

  const handleSubmit = async () => {
    try {
      setMessage('')
      setError('')

      if (!title.trim() || !description.trim()) {
        setError('Please enter title and description.')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          description,
          village,
          fileUrl,
          createdByUserName: userName,
          isVisibleToResidents,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save document.')
      }

      setMessage('Document or notice saved successfully.')
      setTitle('')
      setType('Notice')
      setDescription('')
      setFileUrl('')
      setSelectedFile(null)
      setIsVisibleToResidents(true)

      await loadDocuments()
    } catch (err: any) {
      setError(err.message || 'Failed to save document.')
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
              Add village notices, minutes, and Code of Practice information.
            </p>
          </div>
        </section>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <h2 className="h4 fw-bold mb-3">Add New Document or Notice</h2>

            <div className="row g-3">
              <div className="col-md-6">
                <option value="Notice">Notice</option>
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
              
              <div className="col-md-8">
                <label className="form-label fw-semibold">
                  File URL optional
                </label>
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
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

            <button className="btn btn-primary mt-4" onClick={handleSubmit}>
              Save Document / Notice
            </button>
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
                      <th>Visible</th>
                      <th>Created By</th>
                      <th>File</th>
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
                        <td>
                          <span
                            className={`badge ${
                              doc.isVisibleToResidents
                                ? 'bg-success'
                                : 'bg-secondary'
                            }`}
                          >
                            {doc.isVisibleToResidents
                              ? 'Residents can view'
                              : 'Internal only'}
                          </span>
                        </td>
                        <td>{doc.createdBy}</td>
                        <td>
                          {doc.fileUrl ? (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open
                            </a>
                          ) : (
                            <span className="text-secondary">No file</span>
                          )}
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
