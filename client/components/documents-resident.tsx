import { useEffect, useState } from 'react'
import Navbar from './navbar'

type DocumentNotice = {
  id: number
  title: string
  type: string
  description: string
  village: string
  fileUrl: string
  createdBy: string
  createdAt: string
}

function DocumentsResident() {
  const API_BASE_URL = 'http://localhost:5072'
  const village = localStorage.getItem('village') || 'Papakura'

  const [documents, setDocuments] = useState<DocumentNotice[]>([])
  const [error, setError] = useState('')

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
              View notices, minutes, and documents shared for your village.
            </p>
          </div>
        </section>

        {error && <div className="alert alert-danger">{error}</div>}

        <section>
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            {documents.length === 0 ? (
              <p className="text-secondary mb-0">
                No documents or notices available yet.
              </p>
            ) : (
              <div className="row g-3">
                {documents.map((doc) => (
                  <div className="col-md-6" key={doc.id}>
                    <div className="p-4 border rounded-4 h-100">
                      <span className="badge bg-primary mb-2">{doc.type}</span>
                      <h2 className="h5 fw-bold">{doc.title}</h2>
                      <p className="text-secondary">{doc.description}</p>
                      <p className="small text-secondary mb-2">
                        Posted:{' '}
                        {new Date(doc.createdAt).toLocaleDateString('en-NZ')}
                      </p>

                      {doc.fileUrl && (
                        <a
                          className="btn btn-outline-primary btn-sm"
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open File
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}

export default DocumentsResident
