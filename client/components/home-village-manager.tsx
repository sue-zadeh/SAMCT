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
  id?: number
  Id?: number
  role?: string
  Role?: string
  village?: string
  Village?: string
  isActive?: boolean
  IsActive?: boolean
}
type DocumentNotice = {
  id: number
  title: string
  village: string
  isVisibleToResidents: boolean
}

function HomeVillageManager() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5072";

  const firstName = sessionStorage.getItem('firstname') || 'Village'
  const lastName = sessionStorage.getItem('lastname') || 'Manager'
  const fullName =
    sessionStorage.getItem('fullname') || `${firstName} ${lastName}`
  const village = sessionStorage.getItem('village') || 'Ngatea'
  const role = sessionStorage.getItem('role') || 'VillageManager'

  const savedImage =
    sessionStorage.getItem('profileImageUrl') || 'https://via.placeholder.com/100'

  const profileImageUrl = savedImage.startsWith('http')
    ? `${savedImage}?t=${Date.now()}`
    : `${API_BASE_URL}${savedImage}?t=${Date.now()}`

  const [maintenanceItems, setMaintenanceItems] = useState<
    MaintenanceRequest[]
  >([])
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
          `${API_BASE_URL}/api/users/by-village/${encodedVillage}`,
        )
        if (!response.ok) return

        const rawData = await response.json()
        console.log(rawData)
        const data: UserProfile[] = Array.isArray(rawData)
          ? rawData
          : rawData.users || rawData.data || []

        const residents = data.filter((user: any) => {
          const role = String(user.role ?? user.Role ?? '').toLowerCase()
          const active = user.isActive ?? user.IsActive

          return role.includes('resident') && active !== false
        })

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

  const totalMaintenance = maintenanceItems.length
  const pendingCount = maintenanceItems.filter(
    (item) => item.status === 'Pending',
  ).length
  const inProgressCount = maintenanceItems.filter(
    (item) => item.status === 'In Progress',
  ).length
  const completedCount = maintenanceItems.filter(
    (item) => item.status === 'Completed',
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
                  to="/village-manager/my-village"
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
            <div className="col-md-6 col-xl-2">
              <Link
                to="/village-manager/maintenance"
                className="text-decoration-none text-dark"
              >
                <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                  <p className="text-secondary mb-2">Total Maintenance</p>
                  <h2 className="fw-bold mb-1">{totalMaintenance}</h2>
                  <p className="small text-secondary mb-0">All requests</p>
                </div>
              </Link>
            </div>

            <div className="col-md-6 col-xl-2">
              <Link
                to="/village-manager/maintenance"
                className="text-decoration-none text-dark"
              >
                <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                  <p className="text-secondary mb-2">Pending</p>
                  <h2 className="fw-bold text-warning mb-1">{pendingCount}</h2>
                  <p className="small text-secondary mb-0">Waiting action</p>
                </div>
              </Link>
            </div>

            <div className="col-md-6 col-xl-2">
              <Link
                to="/village-manager/maintenance"
                className="text-decoration-none text-dark"
              >
                <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                  <p className="text-secondary mb-2">In Progress</p>
                  <h2 className="fw-bold text-info mb-1">{inProgressCount}</h2>
                  <p className="small text-secondary mb-0">Being handled</p>
                </div>
              </Link>
            </div>

            <div className="col-md-6 col-xl-2">
              <Link
                to="/village-manager/maintenance"
                className="text-decoration-none text-dark"
              >
                <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                  <p className="text-secondary mb-2">Completed</p>
                  <h2 className="fw-bold text-success mb-1">
                    {completedCount}
                  </h2>
                  <p className="small text-secondary mb-0">Resolved</p>
                </div>
              </Link>
            </div>

            <div className="col-md-6 col-xl-2">
              <Link
                to="/village-manager/residents"
                className="text-decoration-none text-dark"
              >
                <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                  <p className="text-secondary mb-2">Residents</p>
                  <h2 className="fw-bold mb-1">{residentCount}</h2>
                  <p className="small text-secondary mb-0">Active profiles</p>
                </div>
              </Link>
            </div>

            <div className="col-md-6 col-xl-2">
              <Link
                to="/village-manager/documents"
                className="text-decoration-none text-dark"
              >
                <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                  <p className="text-secondary mb-2">Documents</p>
                  <h2 className="fw-bold text-primary mb-1">{documentCount}</h2>
                  <p className="small text-secondary mb-0">Saved files</p>
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
                    to="/village-manager/my-village"
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
                  Recent Maintenance Activity
                </p>
                <h2 className="fw-bold mb-3">Latest requests</h2>

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
                    You manage only data related to <strong>{village}</strong>.
                  </li>
                  <li className="mb-2">
                    Maintenance requests are visible only for your village.
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
