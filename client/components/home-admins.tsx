import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './navbar'

type AdminMaintenanceSummary = {
  village: string
  total: number
  pending: number
  inProgress: number
  completed: number
}

type VillageProperty = {
  id: number
  village: string
  unitNumber: string
  address: string
  residentCount: number
  residentName: string
  residentEmail: string
  residentOccupation: string
  villageManagerName: string
  documentUrl1: string
  documentUrl2: string
  isVisibleOnMarketing: boolean
  marketingTitle: string
  createdAt: string
}

function HomeAdmins() {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5072'
  const fullName = sessionStorage.getItem('fullname') || 'Admin'
  const firstName = sessionStorage.getItem('firstname') || 'Admin'
  const role = sessionStorage.getItem('role') || 'Administrator'

  const savedImage =
    sessionStorage.getItem('profileImageUrl') || 'https://via.placeholder.com/100'

  const profileImageSrc = savedImage.startsWith('http')
    ? `${savedImage}?t=${Date.now()}`
    : `${API_BASE_URL}${savedImage}?t=${Date.now()}`

  const [maintenanceSummary, setMaintenanceSummary] = useState<
    AdminMaintenanceSummary[]
  >([])

  const [villageProperties, setVillageProperties] = useState<VillageProperty[]>(
    [],
  )

  const [error, setError] = useState('')

  const loadDashboardData = async () => {
    try {
      setError('')

      const maintenanceResponse = await fetch(
        `${API_BASE_URL}/api/maintenance/summary/admin`,
      )

      const maintenanceData = await maintenanceResponse.json()

      if (maintenanceResponse.ok) {
        setMaintenanceSummary(
          Array.isArray(maintenanceData) ? maintenanceData : [],
        )
      }

      const propertiesResponse = await fetch(
        `${API_BASE_URL}/api/village-properties/admin/all`,
      )

      const propertiesData = await propertiesResponse.json()

      if (propertiesResponse.ok) {
        setVillageProperties(
          Array.isArray(propertiesData) ? propertiesData : [],
        )
      }
    } catch {
      setError('Failed to load admin dashboard data.')
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (!error) return

    const timer = setTimeout(() => {
      setError('')
    }, 50000)

    return () => clearTimeout(timer)
  }, [error])

  const totalMaintenance = maintenanceSummary.reduce(
    (total, item) => total + item.total,
    0,
  )

  const totalPending = maintenanceSummary.reduce(
    (total, item) => total + item.pending,
    0,
  )

  const totalInProgress = maintenanceSummary.reduce(
    (total, item) => total + item.inProgress,
    0,
  )

  const totalCompleted = maintenanceSummary.reduce(
    (total, item) => total + item.completed,
    0,
  )

  const totalDocuments = villageProperties.reduce(
    (total, item) =>
      total + (item.documentUrl1 ? 1 : 0) + (item.documentUrl2 ? 1 : 0),
    0,
  )

  const totalMarketingListings = villageProperties.filter(
    (item) => item.isVisibleOnMarketing,
  ).length

  const recentProperties = villageProperties.slice(0, 5)

  return (
    <>
      <Navbar userType="admin" />

      <main className="container py-5">
        <section className="mb-5">
          <div className="samct-card p-4 h-100 border rounded-4 shadow-sm d-flex justify-content-between align-items-center flex-wrap gap-4">
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
                  Admin Portal
                </p>

                <h1 className="fw-bold mb-1">Welcome, {firstName}</h1>

                <p className="text-secondary mb-0">
                  {fullName} | {role}
                </p>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Link
                to="/admin/profile"
                className="btn btn-primary samct-button"
              >
                My Profile
              </Link>

              <Link to="/admin/people" className="btn btn-outline-dark">
                Manage Users
              </Link>
            </div>
          </div>
        </section>

        {error && <div className="alert alert-danger">{error}</div>}

        <section className="mb-5">
          <div className="row g-3">
            <div className="col-md-4 col-xl-2">
              <Link
                to="/admin/maintenance"
                className="text-decoration-none text-dark"
              >
                <div className="samct-card p-4 h-100 border rounded-4 shadow-sm bg-white">
                  <p className="text-secondary mb-2">Maintenance</p>
                  <h2 className="fw-bold mb-1">{totalMaintenance}</h2>
                  <p className="small text-secondary mb-0">All requests</p>
                </div>
              </Link>
            </div>

            <div className="col-md-4 col-xl-2">
              <div className="samct-card p-4 h-100 border rounded-4 shadow-sm bg-white">
                <p className="text-secondary mb-2">Pending</p>
                <h2 className="fw-bold text-warning mb-1">{totalPending}</h2>
                <p className="small text-secondary mb-0">Waiting action</p>
              </div>
            </div>

            <div className="col-md-4 col-xl-2">
              <div className="samct-card p-4 h-100 border rounded-4 shadow-sm bg-white">
                <p className="text-secondary mb-2">In Progress</p>
                <h2 className="fw-bold text-info mb-1">{totalInProgress}</h2>
                <p className="small text-secondary mb-0">Being handled</p>
              </div>
            </div>

            <div className="col-md-4 col-xl-2">
              <div className="samct-card p-4 h-100 border rounded-4 shadow-sm bg-white">
                <p className="text-secondary mb-2">Completed</p>
                <h2 className="fw-bold text-success mb-1">{totalCompleted}</h2>
                <p className="small text-secondary mb-0">Resolved</p>
              </div>
            </div>

            <div className="col-md-4 col-xl-2">
              <Link
                to="/admin/village-properties"
                className="text-decoration-none text-dark"
              >
                <div className="samct-card p-4 h-100 border rounded-4 shadow-sm bg-white">
                  <p className="text-secondary mb-2">Village Data</p>
                  <h2 className="fw-bold mb-1">{villageProperties.length}</h2>
                  <p className="small text-secondary mb-0">Property records</p>
                </div>
              </Link>
            </div>

            <div className="col-md-4 col-xl-2">
              <Link
                to="/admin/village-properties"
                className="text-decoration-none text-dark"
              >
                <div className="samct-card p-4 h-100 border rounded-4 shadow-sm bg-white">
                  <p className="text-secondary mb-2">Marketing</p>
                  <h2 className="fw-bold text-primary mb-1">
                    {totalMarketingListings}
                  </h2>
                  <p className="small text-secondary mb-0">Public listings</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-5">
          <div className="samct-card p-4 mb-4 border rounded-4 shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div>
                <p className="text-uppercase text-primary fw-semibold mb-1">
                  Maintenance Overview
                </p>
                <h2 className="fw-bold mb-0">Village Maintenance Status</h2>
              </div>

              <Link
                to="/admin/maintenance"
                className="btn btn-outline-primary shadow"
              >
                View Maintenance
              </Link>
            </div>

            {maintenanceSummary.length === 0 ? (
              <p className="text-secondary mb-0">
                No maintenance summary available yet.
              </p>
            ) : (
              <div className="row g-3">
                {maintenanceSummary.map((item) => (
                  <div className="col-md-6 col-xl-4" key={item.village}>
                    <div className="p-4 border rounded-4 h-100 bg-white shadow-sm">
                      <h3 className="h5 fw-bold">{item.village}</h3>

                      <div className="d-flex flex-wrap gap-2 mt-3">
                        <span className="badge bg-warning text-dark">
                          Pending: {item.pending}
                        </span>

                        <span className="badge bg-info text-dark">
                          In Progress: {item.inProgress}
                        </span>

                        <span className="badge bg-success">
                          Completed: {item.completed}
                        </span>
                      </div>

                      <p className="small text-secondary mt-3 mb-0">
                        Total requests: {item.total}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mb-5">
          <div className="samct-card p-4 shadow-sm border rounded-4 bg-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div>
                <p className="text-uppercase text-primary fw-semibold mb-1">
                  Village Data Overview
                </p>
                <h2 className="fw-bold mb-0">Property & Marketing Activity</h2>
              </div>

              <Link
                to="/admin/village-properties"
                className="btn btn-outline-primary"
              >
                View Village Data
              </Link>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="p-4 border rounded-4 bg-white h-100 shadow-sm">
                  <p className="text-secondary mb-2">Total Properties</p>
                  <h3 className="fw-bold mb-1">{villageProperties.length}</h3>
                  <p className="small text-secondary mb-0">
                    All village property records
                  </p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-4 border rounded-4 bg-white h-100">
                  <p className="text-secondary mb-2">Marketing Listings</p>
                  <h3 className="fw-bold text-primary mb-1">
                    {totalMarketingListings}
                  </h3>
                  <p className="small text-secondary mb-0">
                    Visible on public website
                  </p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-4 border rounded-4 bg-white h-100 shadow-sm">
                  <p className="text-secondary mb-2">Documents Uploaded</p>
                  <h3 className="fw-bold text-primary mb-1">
                    {totalDocuments}
                  </h3>
                  <p className="small text-secondary mb-0">
                    Property documents and images
                  </p>
                </div>
              </div>
            </div>

            {recentProperties.length === 0 ? (
              <p className="text-secondary mb-0">
                No village property records saved yet.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Village</th>
                      <th>Unit</th>
                      <th>Resident</th>
                      <th>Manager</th>
                      <th>Marketing</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentProperties.map((item) => (
                      <tr key={item.id}>
                        <td>{item.village}</td>
                        <td>
                          <strong>{item.unitNumber}</strong>
                          <div className="small text-secondary">
                            {item.address}
                          </div>
                        </td>
                        <td>{item.residentName || '-'}</td>
                        <td>{item.villageManagerName || '-'}</td>
                        <td>
                          <span
                            className={`badge ${
                              item.isVisibleOnMarketing
                                ? 'bg-success'
                                : 'bg-secondary'
                            }`}
                          >
                            {item.isVisibleOnMarketing ? 'Visible' : 'Hidden'}
                          </span>
                          {item.marketingTitle && (
                            <div className="small text-secondary mt-1">
                              {item.marketingTitle}
                            </div>
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

export default HomeAdmins
