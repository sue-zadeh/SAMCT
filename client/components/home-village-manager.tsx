import React, { useEffect, useState } from 'react'
import Navbar from './navbar'

interface DashboardStats {
  openMaintenanceCount: number
  totalResidentsCount: number
  documentCount: number
}

function HomeVillageManager() {
  const firstName = localStorage.getItem('firstname') || 'David'
  const lastName = localStorage.getItem('lastname') || 'Craddock'
  const fullName =
    localStorage.getItem('fullname') || `${firstName} ${lastName}`
  const village = localStorage.getItem('village') || 'Ngatea'
  const role = localStorage.getItem('role') || 'VillageManager'

  const API_BASE_URL = 'http://localhost:5072'
  const savedImage =
    localStorage.getItem('profileImageUrl') || 'https://via.placeholder.com/100'

  const profileImageUrl = savedImage.startsWith('http')
    ? `${savedImage}?t=${Date.now()}`
    : `${API_BASE_URL}${savedImage}?t=${Date.now()}`

  // 1. Setup local state management to store API calculation values
  const [stats, setStats] = useState<DashboardStats>({
    openMaintenanceCount: 0,
    totalResidentsCount: 0,
    documentCount: 0,
  })
  const [recentItems, setRecentItems] = useState<any[]>([])

  // 2. Fetch data automatically via side-effect hook on layout mount
  useEffect(() => {
    const encodedVillage = encodeURIComponent(village)

    fetch(
      `${API_BASE_URL}/api/village-manager/dashboard-stats/${encodedVillage}`,
    )
      .then((res) => {
        if (!res.ok) throw new Error('Failed dashboard stats')
        return res.json()
      })
      .then((data: DashboardStats) => {
        setStats(data)
      })
      .catch((err) => {
        console.error(err)
      })

    fetch(`${API_BASE_URL}/api/maintenance/village/${encodedVillage}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed maintenance feed')
        return res.json()
      })
      .then((data) => {
        setRecentItems(data.slice(0, 5))
      })
      .catch((err) => {
        console.error(err)
      })
  }, [village])

  // 3. Map dynamic state array directly onto your Bootstrap columns
  const villageStats = [
    {
      title: 'Open Maintenance',
      value: stats.openMaintenanceCount,
      note: 'Requests waiting for action',
    },
    {
      title: 'Residents',
      value: stats.totalResidentsCount,
      note: 'Profiles in this village',
    },
    {
      title: 'Documents',
      value: stats.documentCount,
      note: 'Minutes, notices, village files',
    },
  ]

  const quickActions = [
    {
      title: 'Village Data',
      text: 'View and manage information related only to your village.',
      button: 'Open Village Data',
    },
    {
      title: 'Maintenance Requests',
      text: 'Review private maintenance issues between residents and management.',
      button: 'View Maintenance',
    },
    {
      title: 'Residents',
      text: 'See resident profiles and information for your village only.',
      button: 'View Residents',
    },
    {
      title: 'Documents & Notices',
      text: 'Access village notices, minutes, and Code of Practice documents.',
      button: 'Open Documents',
    },
  ]

  
  const statusStyles: Record<string, React.CSSProperties> = {
    Pending: { backgroundColor: '#fef3c7', color: '#92400e' },
    Completed: { backgroundColor: '#dcfce7', color: '#166534' },
    'In Review': { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  }

  return (
    <>
      <Navbar userType="villageManager" />

      <main className="container py-5">
        {/* Hero / Welcome */}
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
                <button className="btn btn-primary">View Village Data</button>
                <button className="btn btn-outline-dark">
                  Open Maintenance
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Stats Section */}
        <section className="mb-4">
          <div className="row g-3">
            {villageStats.map((item) => (
              <div className="col-md-6 col-xl-4" key={item.title}>
                <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                  <p className="text-secondary mb-2">{item.title}</p>
                  <h2 className="fw-bold mb-1">{item.value}</h2>
                  <p className="small text-secondary mb-0">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div>
                <p className="text-uppercase text-primary fw-semibold mb-1">
                  Quick Actions
                </p>
                <h2 className="fw-bold mb-0">Manage your village area</h2>
              </div>
            </div>

            <div className="row g-3">
              {quickActions.map((item) => (
                <div className="col-md-6" key={item.title}>
                  <div className="p-4 border rounded-4 h-100">
                    <h3 className="h5 fw-bold">{item.title}</h3>
                    <p className="text-secondary">{item.text}</p>
                    <button className="btn btn-sm btn-outline-primary">
                      {item.button}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Activity + Notes */}
        <section>
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-uppercase text-primary fw-semibold mb-1">
                  Recent Activity
                </p>
                <h2 className="fw-bold mb-3">Latest village updates</h2>

                <div className="d-grid gap-3">
                  {recentItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-3 d-flex justify-content-between align-items-start flex-column flex-md-row gap-3"
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        (window.location.href = '/village-manager/maintenance')
                      }
                    >
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
                  ))}

                </div>
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
                    Maintenance requests are private between village management
                    and admin.
                  </li>
                  <li className="mb-2">
                    Residents should be able to view notices, minutes, and Code
                    of Practice documents related to their own village.
                  </li>
                  <li className="mb-2">
                    You may need a separate email account for village-related
                    communication.
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
