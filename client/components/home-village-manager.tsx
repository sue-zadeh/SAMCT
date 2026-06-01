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

type UserProfile = {
  id: number
  role: string
  village: string
  isActive: boolean
}

type DocumentNotice = {
  id: number
  title: string
  village: string
  isVisibleToResidents: boolean
}

function HomeVillageManager() {
  const API_BASE_URL = 'http://localhost:5072'

  const firstName = localStorage.getItem('firstname') || 'Village'
  const lastName = localStorage.getItem('lastname') || 'Manager'
  const fullName = localStorage.getItem('fullname') || `${firstName} ${lastName}`
  const village = localStorage.getItem('village') || 'Papakura'
  const role = localStorage.getItem('role') || 'VillageManager'

  const savedImage =
    localStorage.getItem('profileImageUrl') || 'https://via.placeholder.com/100'

  const profileImageUrl = savedImage.startsWith('http')
    ? `${savedImage}?t=${Date.now()}`
    : `${API_BASE_URL}${savedImage}?t=${Date.now()}`

  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceRequest[]>([])
  const [residentCount, setResidentCount] = useState(0)
  const [documentCount, setDocumentCount] = useState(0)

  useEffect(() => {
    const encodedVillage = encodeURIComponent(village)

    async function loadMaintenance() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/maintenance/village/${encodedVillage}`,
        )

        if (!response.ok) return

        const data = await response.json()
        setMaintenanceItems(data)
      } catch {
        setMaintenanceItems([])
      }
    }

    async function loadResidents() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/village/${encodedVillage}`,
        )

        if (!response.ok) return

        const data: UserProfile[] = await response.json()

        const residents = data.filter(
          (user) => user.role === 'Resident' && user.isActive,
        )

        setResidentCount(residents.length)
      } catch {
        setResidentCount(0)
      }
    }

    async function loadDocuments() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/documents/village/${encodedVillage}`,
        )

        if (!response.ok) return

        const data: DocumentNotice[] = await response.json()
        setDocumentCount(data.length)
      } catch {
        setDocumentCount(0)
      }
    }

    loadMaintenance()
    loadResidents()
    loadDocuments()
  }, [village])

  const openMaintenanceCount = maintenanceItems.filter(
    (item) => item.status !== 'Completed',
  ).length

  const recentItems = maintenanceItems.slice(0, 5)

  const statusStyles: Record<string, React.CSSProperties> = {
    Pending: { backgroundColor: '#fef3c7', color: '#92400e' },
    'In Progress': { backgroundColor: '#cffafe', color: '#155e75' },
    Completed: { backgroundColor: '#dcfce7', color: '#166534' },
  }

  return (
    <>
      <Navbar userType="villageManager" />

      <main className="container py-5">
        <section className="mb-4">
          <div className="p-4 p-lg-5 border rounded-4 shadow-sm bg-white">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={profileImageUrl}
                  alt={fullName}
                  width="90"
                  height="90"
                  className="rounded-circle border"
                  style={{ objectFit: 'cover' }}
                />

                <div>
                  <p className="text-uppercase text-primary fw-semibold mb-1">
                    Village Manager Portal
                  </p>
                  <h3 className="fw-semibold mb-1">Welcome, {firstName}</h3>
                  <p className="text-secondary mb-0">
                    {fullName} | {role} | Village: {village}
                  </p>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <Link
                  to="/village-manager/residents"
                  className="btn btn-primary"
                >
                  View Village Data
                </Link>

                <Link
                  to="/village-manager/maintenance"
                  className="btn btn-outline-dark"
                >
                  Open Maintenance
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <Link
                to="/village-manager/maintenance"
                className="text-decoration-none text-dark"
              >
                <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                  <p className="text-secondary mb-2">Open Maintenance</p>
                  <h2 className="fw-bold mb-1">{openMaintenanceCount}</h2>
                  <p className="small text-secondary mb-0">
                    Requests waiting for action
                  </p>
                </div>
              </Link>
            </div>

            <div className="col-md-4">
              <Link
                to="/village-manager/residents"
                className="text-decoration-none text-dark"
              >
                <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                  <p className="text-secondary mb-2">Residents</p>
                  <h2 className="fw-bold mb-1">{residentCount}</h2>
                  <p className="small text-secondary mb-0">
                    Active resident profiles in this village
                  </p>
                </div>
              </Link>
            </div>

            <div className="col-md-4">
              <Link
                to="/village-manager/documents"
                className="text-decoration-none text-dark"
              >
                <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                  <p className="text-secondary mb-2">Documents</p>
                  <h2 className="fw-bold mb-1">{documentCount}</h2>
                  <p className="small text-secondary mb-0">
                    Real saved notices and village files
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <p className="text-uppercase text-primary fw-semibold mb-1">
              Quick Actions
            </p>
            <h2 className="fw-bold mb-3">Manage your village area</h2>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="p-4 border rounded-4 h-100">
                  <h3 className="h5 fw-bold">Village Data</h3>
                  <p className="text-secondary">
                    View village-related resident and profile data.
                  </p>
                  <Link
                    to="/village-manager/residents"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Open Village Data
                  </Link>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-4 border rounded-4 h-100">
                  <h3 className="h5 fw-bold">Maintenance Requests</h3>
                  <p className="text-secondary">
                    Review and respond to resident maintenance issues.
                  </p>
                  <Link
                    to="/village-manager/maintenance"
                    className="btn btn-sm btn-outline-primary"
                  >
                    View Maintenance
                  </Link>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-4 border rounded-4 h-100">
                  <h3 className="h5 fw-bold">Residents</h3>
                  <p className="text-secondary">
                    Manage resident profiles for your village.
                  </p>
                  <Link
                    to="/village-manager/residents"
                    className="btn btn-sm btn-outline-primary"
                  >
                    View Residents
                  </Link>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-4 border rounded-4 h-100">
                  <h3 className="h5 fw-bold">Documents & Notices</h3>
                  <p className="text-secondary">
                    Upload and manage village notices and files.
                  </p>
                  <Link
                    to="/village-manager/documents"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Open Documents
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-uppercase text-primary fw-semibold mb-1">
                  Recent Activity
                </p>
                <h2 className="fw-bold mb-3">Latest village updates</h2>

                {recentItems.length === 0 ? (
                  <p className="text-secondary mb-0">
                    No maintenance updates yet.
                  </p>
                ) : (
                  <div className="d-grid gap-3">
                    {recentItems.map((item) => (
                      <Link
                        key={item.id}
                        to="/village-manager/maintenance"
                        className="text-decoration-none text-dark"
                      >
                        <div className="p-3 border rounded-3 d-flex justify-content-between align-items-start flex-column flex-md-row gap-3">
                          <div>
                            <h3 className="h6 fw-bold mb-1">{item.title}</h3>
                            <p className="text-secondary small mb-1">
                              {item.description}
                            </p>
                            <p className="text-secondary small mb-0">
                              Unit: {item.unitOrAddress || 'N/A'}
                            </p>
                          </div>

                          <span
                            className="badge rounded-pill px-3 py-2"
                            style={statusStyles[item.status] || {}}
                          >
                            {item.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-5">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-uppercase text-primary fw-semibold mb-1">
                  Access Notes
                </p>
                <h2 className="fw-bold mb-3">Your role access</h2>

                <ul className="text-secondary ps-3 mb-0">
                  <li className="mb-2">
                    You should manage only data related to{' '}
                    <strong>{village}</strong>.
                  </li>
                  <li className="mb-2">
                    Maintenance requests are private between residents,
                    village management, and admin visibility.
                  </li>
                  <li className="mb-2">
                    Documents can be visible or hidden from residents.
                  </li>
                  <li className="mb-2">
                    Admins can monitor village activity in read-only mode.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default HomeVillageManager