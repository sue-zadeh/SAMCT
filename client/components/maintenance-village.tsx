import { useEffect, useState } from 'react'
import Navbar from './navbar'

type MaintenanceRequest = {
  id: number
  residentName: string
  residentUserName: string
  title: string
  description: string
  unitOrAddress: string
  priority: string
  status: string
  village: string
  imageUrl1?: string
  imageUrl2?: string
  managerAnswer?: string
  createdAt: string
}

function MaintenanceVillage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5072";
  const village = sessionStorage.getItem('village') || 'Ngatea'
  const managerUserName = sessionStorage.getItem('username') || ''

  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [statuses, setStatuses] = useState<Record<number, string>>({})
  const [searchText, setSearchText] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!message && !error) return

    const timer = setTimeout(() => {
      setMessage('')
      setError('')
    }, 50000)

    return () => clearTimeout(timer)
  }, [message, error])

  const loadRequests = async () => {
    try {
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/maintenance/village/${encodeURIComponent(village)}`,
      )

      const text = await response.text()
      const data = text ? JSON.parse(text) : []

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load village requests.')
      }

      setRequests(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load village requests.')
    }
  }

  useEffect(() => {
    loadRequests()
  }, [village])

  const handleSaveResponse = async (id: number) => {
    try {
      setMessage('')
      setError('')

      const managerAnswer = answers[id] || ''
      const status = statuses[id] || 'Completed'

      if (!managerAnswer.trim()) {
        setError('Please write a manager answer before saving.')
        return
      }

      const response = await fetch(
        `${API_BASE_URL}/api/maintenance/${id}/manager-response`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            managerUserName,
            managerAnswer,
            status,
          }),
        },
      )

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update request.')
      }

      setMessage('Maintenance request updated successfully.')
      setAnswers((prev) => ({ ...prev, [id]: '' }))
      await loadRequests()
    } catch (err: any) {
      setError(err.message || 'Failed to update request.')
    }
  }

  const getStatusClass = (status: string) => {
    if (status === 'Completed') return 'bg-success'
    if (status === 'In Progress') return 'bg-info text-dark'
    return 'bg-warning text-dark'
  }

  const imageLink = (url?: string) => {
    if (!url) return ''
    return url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  }

  const filteredRequests = requests.filter((request) => {
    const text = searchText.trim().toLowerCase()

    if (!text) return true

    return (
      request.unitOrAddress.toLowerCase().includes(text) ||
      request.title.toLowerCase().includes(text) ||
      request.description.toLowerCase().includes(text) ||
      request.residentName.toLowerCase().includes(text)
    )
  })

  return (
    <>
      <Navbar userType="villageManager" />

      <main className="container py-5">
        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <p className="text-uppercase text-primary fw-semibold mb-1">
              Village Manager Maintenance
            </p>
            <h1 className="fw-bold mb-2">Maintenance Requests - {village}</h1>
            <p className="text-secondary mb-0">
              View resident maintenance requests, photos, descriptions, and send
              responses.
            </p>
          </div>
        </section>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <section>
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <div className="text-center mb-4">
              <h2 className="h4 fw-bold mb-1">Request Queue</h2>
              <p className="text-secondary mb-3">
                Search by unit number, resident name, issue title, or
                description.
              </p>

              <div className="d-flex justify-content-center">
                <input
                  className="form-control text-center"
                  style={{ maxWidth: '420px' }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search maintenance requests..."
                />
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="alert alert-warning text-center">
                No maintenance request matched your search.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Resident</th>
                      <th>Issue Details</th>
                      <th>Photos</th>
                      <th>Village</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Manager Response</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td style={{ minWidth: '160px' }}>
                          <strong>{request.residentName}</strong>
                          <div className="small text-secondary">
                            {request.residentUserName}
                          </div>
                          <div className="small text-secondary">
                            Unit: {request.unitOrAddress || '-'}
                          </div>
                        </td>

                        <td style={{ minWidth: '260px' }}>
                          <strong>{request.title}</strong>
                          <div className="small text-secondary">
                            {request.description}
                          </div>
                          <div className="small text-secondary mt-1">
                            Submitted:{' '}
                            {new Date(request.createdAt).toLocaleDateString(
                              'en-NZ',
                            )}
                          </div>
                        </td>

                        <td style={{ minWidth: '130px' }}>
                          {request.imageUrl1 || request.imageUrl2 ? (
                            <div className="d-flex flex-column gap-1">
                              {request.imageUrl1 && (
                                <a
                                  href={imageLink(request.imageUrl1)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-outline-primary btn-sm"
                                >
                                  Open Photo 1
                                </a>
                              )}

                              {request.imageUrl2 && (
                                <a
                                  href={imageLink(request.imageUrl2)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-outline-primary btn-sm"
                                >
                                  Open Photo 2
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-secondary small">
                              No photos
                            </span>
                          )}
                        </td>

                        <td>{request.village}</td>
                        <td>{request.priority}</td>

                        <td>
                          <span
                            className={`badge ${getStatusClass(
                              request.status,
                            )}`}
                          >
                            {request.status}
                          </span>
                        </td>

                        <td style={{ minWidth: '260px' }}>
                          {request.managerAnswer && (
                            <div className="p-2 bg-light border rounded-3 small mb-2">
                              {request.managerAnswer}
                            </div>
                          )}

                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Write update or resolution..."
                            value={answers[request.id] || ''}
                            onChange={(e) =>
                              setAnswers((prev) => ({
                                ...prev,
                                [request.id]: e.target.value,
                              }))
                            }
                          />
                        </td>

                        <td style={{ minWidth: '160px' }}>
                          <select
                            className="form-select form-select-sm mb-2"
                            value={statuses[request.id] || request.status}
                            onChange={(e) =>
                              setStatuses((prev) => ({
                                ...prev,
                                [request.id]: e.target.value,
                              }))
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>

                          <button
                            className="btn btn-primary btn-sm w-100"
                            onClick={() => handleSaveResponse(request.id)}
                          >
                            Save Response
                          </button>
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

export default MaintenanceVillage