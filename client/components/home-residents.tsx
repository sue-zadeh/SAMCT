import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './navbar'

type MaintenanceRequest = {
  id: number
  title: string
  description: string
  unitOrAddress: string
  village: string
  priority: string
  status: string
  managerAnswer?: string
  createdAt: string
}

function HomeResidents() {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5072'
  const fullName = sessionStorage.getItem('fullname') || 'Resident User'
  const firstName = sessionStorage.getItem('firstname') || 'Resident'
  const village = sessionStorage.getItem('village') || 'Ngatea'
  const userName = sessionStorage.getItem('username') || ''
  const profileImageUrl =
    sessionStorage.getItem('profileImageUrl') || 'https://via.placeholder.com/80'

  const profileImageSrc = profileImageUrl.startsWith('http')
    ? profileImageUrl
    : `${API_BASE_URL}${profileImageUrl}`

  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [documentCount, setDocumentCount] = useState(0)

  useEffect(() => {
    async function loadRequests() {
      if (!userName) return

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/maintenance/resident/${userName}`,
        )

        if (!response.ok) return

        const data = await response.json()
        setRequests(data)
      } catch {
        setRequests([])
      }
    }

    async function loadDocumentSummary() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/documents/summary/resident/${encodeURIComponent(
            village,
          )}`,
        )

        if (!response.ok) return

        const data = await response.json()
        setDocumentCount(data.totalDocuments || 0)
      } catch {
        setDocumentCount(0)
      }
    }

    loadRequests()
    loadDocumentSummary()
  }, [userName, village])

  const total = requests.length
  const pending = requests.filter((r) => r.status === 'Pending').length
  const inProgress = requests.filter((r) => r.status === 'In Progress').length
  const completed = requests.filter((r) => r.status === 'Completed').length

  return (
    <>
      <Navbar userType="resident" />

      <main className="container py-5">
        <section className="mb-5">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4 p-4 border rounded-4 shadow-sm bg-white">
            <div className="d-flex align-items-center gap-3">
              <img
                src={profileImageSrc}
                alt={fullName}
                width="80"
                height="80"
                className="rounded-circle border"
                style={{ objectFit: 'cover' }}
              />

              <div>
                <p className="text-uppercase text-primary fw-semibold mb-1">
                  Resident Portal
                </p>
                <h3 className="fw-semibold mb-1">Welcome, {firstName}</h3>
                <p className="text-secondary mb-0">
                  {fullName} | Village: {village}
                </p>
              </div>
            </div>

            <div>
              <h2 className="h4 fw-bold fs-2 mb-2">Resident Dashboard</h2>
              <p className="text-secondary mb-0">
                Log maintenance issues, view submitted requests, and check
                village updates.
              </p>
            </div>

            <div className="d-flex flex-wrap p-3 gap-2">
              <Link to="/resident/maintenance" className="btn btn-primary">
                Log Maintenance Issue
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="row g-3 justify-content-center">
            <div className="col-md-2">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-secondary mb-2">Total Requests</p>
                <h2 className="fw-bold mb-0">{total}</h2>
              </div>
            </div>

            <div className="col-md-2">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-secondary mb-2">Pending</p>
                <h2 className="fw-bold text-warning mb-0">{pending}</h2>
              </div>
            </div>

            <div className="col-md-2">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-secondary mb-2">In Progress</p>
                <h2 className="fw-bold text-info mb-0">{inProgress}</h2>
              </div>
            </div>

            <div className="col-md-2">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-secondary mb-2">Completed</p>
                <h2 className="fw-bold text-success mb-0">{completed}</h2>
              </div>
            </div>

            <div className="col-md-2">
              <Link
                to="/resident/documents"
                className="text-decoration-none text-dark"
              >
                <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                  <p className="text-secondary mb-2">Documents & Notices</p>
                  <h2 className="fw-bold text-primary mb-0">{documentCount}</h2>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-5">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
                <h3 className="h5 fw-bold">Maintenance Requests</h3>
                <p className="text-secondary">
                  Submit issues and track responses from your village manager.
                </p>
                <Link
                  to="/resident/maintenance"
                  className="btn btn-outline-primary btn-sm"
                >
                  Open Maintenance
                </Link>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
                <h3 className="h5 fw-bold">Documents & Notices</h3>
                <p className="text-secondary">
                  Access resident notices and village documents.
                </p>
                <Link
                  to="/resident/documents"
                  className="btn btn-outline-primary btn-sm"
                >
                  Open Notices
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default HomeResidents
