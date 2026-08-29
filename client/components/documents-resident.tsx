import { useEffect, useState } from 'react'
import Navbar from './navbar'

type DocumentNotice = {
  id: number
  title: string
  type: string
  description: string
  village: string
  fileUrl: string
  fileName: string
  createdBy: string
  createdAt: string
}

function DocumentsResident() {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5072'
  const village = sessionStorage.getItem('village') || 'Ngatea'

  const [documents, setDocuments] = useState<DocumentNotice[]>([])
  const [error, setError] = useState('')

  const getFileLink = (fileUrl: string) => {
    if (!fileUrl) return ''
    return fileUrl.startsWith('http') ? fileUrl : `${API_BASE_URL}${fileUrl}`
  }

  const loadDocuments = async () => {
    try {
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/documents/resident/${encodeURIComponent(village)}`,
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

  return (
    <>
      <Navbar userType="resident" />

      <main className="container py-5">
        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <p className="text-uppercase text-primary fw-semibold mb-1">
              Resident Documents
            </p>
            <h1 className="fw-bold mb-2">Documents & Notices - {village}</h1>
            <p className="text-secondary mb-0">
              View notices, minutes, Code of Practice documents, and shared
              village files.
            </p>
          </div>
        </section>

        {error && <div className="alert alert-danger">{error}</div>}

        <section>
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <h2 className="h4 fw-bold mb-3">Available Documents & Notices</h2>

            {documents.length === 0 ? (
              <p className="text-secondary mb-0">
                No documents or notices available yet.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Document</th>
                      <th>Type</th>
                      <th>Uploaded By</th>
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
                          <div className="small text-secondary mt-1">
                            {doc.description || 'No description'}
                          </div>
                        </td>

                        <td>
                          <span className="badge bg-primary">{doc.type}</span>
                        </td>

                        <td>{doc.createdBy || 'Unknown'}</td>

                        <td>
                          {doc.fileUrl ? (
                            <div className="d-grid gap-2">
                              <span className="small text-secondary">
                                {doc.fileName || 'Attached file'}
                              </span>

                              <div className="d-flex flex-wrap gap-2">
                                <a
                                  className="btn btn-outline-primary btn-sm"
                                  href={getFileLink(doc.fileUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Open
                                </a>

                                <a
                                  className="btn btn-outline-dark btn-sm"
                                  href={getFileLink(doc.fileUrl)}
                                  download={doc.fileName || true}
                                >
                                  Download
                                </a>
                              </div>
                            </div>
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

export default DocumentsResident
