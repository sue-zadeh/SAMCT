import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './navbar'

type MaintenanceSummary = {
  total: number
  pending: number
  inProgress: number
  completed: number
  newResponses: number
}

function HomeResidents() {
  const API_BASE_URL = 'http://localhost:5072'

  const fullName = localStorage.getItem('fullname') || 'Resident User'
  const firstName = localStorage.getItem('firstname') || 'Resident'
  const village = localStorage.getItem('village') || 'Papakura'
  const username = localStorage.getItem('username') || ''

  const savedImage =
    localStorage.getItem('profileImageUrl') || 'https://via.placeholder.com/80'

  const profileImageUrl = savedImage.startsWith('http')
    ? `${savedImage}?t=${Date.now()}`
    : `${API_BASE_URL}${savedImage}?t=${Date.now()}`

  const [maintenanceSummary, setMaintenanceSummary] =
    useState<MaintenanceSummary>({
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      newResponses: 0,
    })

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/maintenance/summary/resident/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setMaintenanceSummary({
          total: data.total || 0,
          pending: data.pending || 0,
          inProgress: data.inProgress || 0,
          completed: data.completed || 0,
          newResponses: data.newResponses || 0,
        })
      })
      .catch((err) => {
        console.error('Failed to load resident summary', err)
      })
  }, [username])

  return (
    <>
      <Navbar userType="resident" />

      <main className="container py-5">
        {/* HEADER */}
        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={profileImageUrl}
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

                  <h1 className="fw-bold mb-1">Welcome, {firstName}</h1>

                  <p className="text-secondary mb-0">
                    {fullName} | Village: {village}
                  </p>
                </div>
              </div>

              <div className="d-flex gap-2 p-5 flex-wrap">
                <Link to="/resident/maintenance" className="btn btn-primary">
                  Log Maintenance Issue
                </Link>

                {/* <Link
                  to="/resident/maintenance"
                  className="btn btn-outline-dark"
                >
                  View My Requests
                </Link> */}
              </div>
            </div>
          </div>
        </section>

        {/* REAL DATABASE STATS */}
        <section className="mb-4">
          <div className="row g-3">
            <div className="col-md-6 col-xl-3">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-secondary mb-2">Total Requests</p>

                <h2 className="fw-bold">{maintenanceSummary.total}</h2>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-secondary mb-2">Pending</p>

                <h2 className="fw-bold text-warning">
                  {maintenanceSummary.pending}
                </h2>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-secondary mb-2">In Progress</p>

                <h2 className="fw-bold text-info">
                  {maintenanceSummary.inProgress}
                </h2>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-secondary mb-2">Completed</p>

                <h2 className="fw-bold text-success">
                  {maintenanceSummary.completed}
                </h2>

                {maintenanceSummary.newResponses > 0 && (
                  <span className="badge bg-primary mt-2">
                    {maintenanceSummary.newResponses} new response
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mb-5">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
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
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <h3 className="h5 fw-bold">Notices & Documents</h3>

                <p className="text-secondary">
                  Access resident notices and village documents.
                </p>

                <button className="btn btn-outline-primary btn-sm">
                  Open Notices
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default HomeResidents
