import { useEffect, useState } from 'react'
import Navbar from './navbar'

type MaintenanceRequest = {
  id: number
  title: string
  description: string
  unitOrAddress: string
  priority: string
  status: string
  village: string
  managerAnswer?: string
  imageUrl1?: string
  imageUrl2?: string
  createdAt: string
  updatedAt?: string
}

function MaintenanceResident() {
  const API_BASE_URL = 'http://localhost:5072'
  const userName = localStorage.getItem('username') || ''
  const village = localStorage.getItem('village') || 'Papakura'

  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [unitOrAddress, setUnitOrAddress] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [image1, setImage1] = useState<File | null>(null)
  const [image2, setImage2] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)

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
        `${API_BASE_URL}/api/maintenance/resident/${encodeURIComponent(userName)}`,
      )

      const text = await response.text()
      const data = text ? JSON.parse(text) : []

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load maintenance requests.')
      }

      setRequests(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load maintenance requests.')
    }
  }

  useEffect(() => {
    if (userName) {
      loadRequests()
    }
  }, [userName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!userName) {
      setError('Login user was not found. Please login again.')
      return
    }

    if (!title.trim() || !description.trim()) {
      setError('Please add a title and description.')
      return
    }

    try {
      const formData = new FormData()

      formData.append('userName', userName)
      formData.append('village', village)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('unitOrAddress', unitOrAddress)
      formData.append('priority', priority)

      if (image1) formData.append('image1', image1)
      if (image2) formData.append('image2', image2)

      const response = await fetch(`${API_BASE_URL}/api/maintenance/resident`, {
        method: 'POST',
        body: formData,
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit request.')
      }

      setMessage('Maintenance request submitted successfully.')
      setTitle('')
      setDescription('')
      setUnitOrAddress('')
      setPriority('Normal')
      setImage1(null)
      setImage2(null)
      setFileInputKey((prev) => prev + 1)

      await loadRequests()
    } catch (err: any) {
      setError(err.message || 'Failed to submit request.')
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

  return (
    <>
      <Navbar userType="resident" />

      <main className="container py-5">
        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <p className="text-uppercase text-primary fw-semibold mb-1">
              Resident Maintenance
            </p>
            <h1 className="fw-bold mb-2">Maintenance Requests</h1>
            <p className="text-secondary mb-0">
              Submit a private maintenance request for your village: {village}.
            </p>
          </div>
        </section>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <h2 className="h4 fw-bold mb-4">New Maintenance Request</h2>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Issue Title</label>
                  <input
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Example: Leaking tap"
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Unit / Address
                  </label>
                  <input
                    className="form-control"
                    value={unitOrAddress}
                    onChange={(e) => setUnitOrAddress(e.target.value)}
                    placeholder="Example: Unit 6"
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">Priority</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write the issue clearly..."
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Photo 1 optional
                  </label>
                  <input
                    key={`image1-${fileInputKey}`}
                    type="file"
                    className="form-control"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => setImage1(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Photo 2 optional
                  </label>
                  <input
                    key={`image2-${fileInputKey}`}
                    type="file"
                    className="form-control"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => setImage2(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <button className="btn btn-primary mt-4" type="submit">
                Submit Request
              </button>
            </form>
          </div>
        </section>

        <section>
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <h2 className="h4 fw-bold mb-4">My Requests</h2>

            {requests.length === 0 ? (
              <p className="text-secondary mb-0">
                No maintenance requests submitted yet.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Issue</th>
                      <th>Location</th>
                      <th>Village</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Photos</th>
                      <th>Manager Answer</th>
                    </tr>
                  </thead>

                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          {new Date(request.createdAt).toLocaleDateString(
                            'en-NZ',
                          )}
                        </td>

                        <td style={{ minWidth: '250px' }}>
                          <strong>{request.title}</strong>
                          <div className="small text-secondary">
                            {request.description}
                          </div>
                        </td>

                        <td>{request.unitOrAddress || '-'}</td>
                        <td>{request.village || village}</td>
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

                        <td style={{ minWidth: '130px' }}>
                          {request.imageUrl1 || request.imageUrl2 ? (
                            <div className="d-flex flex-column gap-1">
                              {request.imageUrl1 && (
                                <a
                                  className="btn btn-outline-primary btn-sm"
                                  href={imageLink(request.imageUrl1)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Open Photo 1
                                </a>
                              )}

                              {request.imageUrl2 && (
                                <a
                                  className="btn btn-outline-primary btn-sm"
                                  href={imageLink(request.imageUrl2)}
                                  target="_blank"
                                  rel="noreferrer"
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

                        <td style={{ minWidth: '220px' }}>
                          {request.managerAnswer ? (
                            <div className="p-2 bg-light border rounded-3 small">
                              {request.managerAnswer}
                            </div>
                          ) : (
                            <span className="text-secondary small">
                              Waiting for manager response
                            </span>
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

export default MaintenanceResident