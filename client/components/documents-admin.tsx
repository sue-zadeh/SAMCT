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

function DocumentsAdmin() {
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5072";
  const [documents, setDocuments] = useState<DocumentNotice[]>([])
  const [error, setError] = useState('')

  const getFileLink = (fileUrl: string) => {
    if (!fileUrl) return ''
    return fileUrl.startsWith('http') ? fileUrl : `${API_BASE_URL}${fileUrl}`
  }

  const loadDocuments = async () => {
    try {
      setError('')

      const response = await fetch(`${API_BASE_URL}/api/documents/admin`)
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
  }, [])

  return (
    <>
      <Navbar userType="admin" />

      <main className="container py-5">
        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <p className="text-uppercase text-primary fw-semibold mb-1">
              Admin Read Only
            </p>
            <h1 className="fw-bold mb-2">All Documents & Notices</h1>
            <p className="text-secondary mb-0">
              Read-only view of village manager document and notice activity.
            </p>
          </div>
        </section>

        {error && <div className="alert alert-danger">{error}</div>}

        <section>
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <h2 className="h4 fw-bold mb-3">Uploaded Documents & Notices</h2>

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
                      <th>Village</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Uploaded By</th>
                      <th>Resident Access</th>
                      <th>File</th>
                    </tr>
                  </thead>

                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id}>
                        <td>{new Date(doc.createdAt).toLocaleDateString('en-NZ')}</td>

                        <td>{doc.village}</td>

                        <td>
                          <strong>{doc.title}</strong>
                          <div className="small text-secondary">{doc.description}</div>
                        </td>

                        <td>{doc.type}</td>

                        <td>{doc.createdBy || 'Unknown'}</td>

                        <td>
                          <span
                            className={`badge ${
                              doc.isVisibleToResidents ? 'bg-success' : 'bg-secondary'
                            }`}
                          >
                            {doc.isVisibleToResidents ? 'Visible to residents' : 'Internal only'}
                          </span>
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

export default DocumentsAdmin