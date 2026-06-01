import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './navbar'

type UserProfile = {
  id?: number
  Id?: number
  userName?: string
  UserName?: string
  firstName?: string
  FirstName?: string
  lastName?: string
  LastName?: string
  fullName?: string
  FullName?: string
  email?: string
  Email?: string
  role?: string
  Role?: string
  village?: string
  Village?: string
  isActive?: boolean
  IsActive?: boolean
}

type MaintenanceRequest = {
  id: number
  title: string
  status: string
  village: string
}

type DocumentNotice = {
  id: number
  title: string
  village: string
}

function MyVillage() {
  const API_BASE_URL = 'http://localhost:5072'
  const village = localStorage.getItem('village') || 'Papakura'
  const managerName = localStorage.getItem('fullname') || 'Village Manager'

  const [users, setUsers] = useState<UserProfile[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([])
  const [documents, setDocuments] = useState<DocumentNotice[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const encodedVillage = encodeURIComponent(village)

    async function loadData() {
      const usersResponse = await fetch(
        `${API_BASE_URL}/api/users/village/${encodedVillage}`,
      )
      const maintenanceResponse = await fetch(
        `${API_BASE_URL}/api/maintenance/village/${encodedVillage}`,
      )
      const documentsResponse = await fetch(
        `${API_BASE_URL}/api/documents/village/${encodedVillage}`,
      )

      if (usersResponse.ok) {
        const rawUsers = await usersResponse.json()
        setUsers(Array.isArray(rawUsers) ? rawUsers : rawUsers.users || [])
      }

      if (maintenanceResponse.ok) {
        setMaintenance(await maintenanceResponse.json())
      }

      if (documentsResponse.ok) {
        setDocuments(await documentsResponse.json())
      }
    }

    loadData()
  }, [village])

  const residents = users.filter((user: any) => {
    const role = String(user.role ?? user.Role ?? '').toLowerCase()
    const active = user.isActive ?? user.IsActive
    return role.includes('resident') && active !== false
  })

  const filteredUsers = users.filter((user: any) => {
    const text = `${user.userName ?? user.UserName ?? ''} ${
      user.firstName ?? user.FirstName ?? ''
    } ${user.lastName ?? user.LastName ?? ''} ${
      user.email ?? user.Email ?? ''
    } ${user.role ?? user.Role ?? ''}`.toLowerCase()

    return text.includes(search.toLowerCase())
  })

  const pending = maintenance.filter((m) => m.status === 'Pending').length
  const inProgress = maintenance.filter((m) => m.status === 'In Progress').length
  const completed = maintenance.filter((m) => m.status === 'Completed').length

  return (
    <>
      <Navbar userType="villageManager" />

      <main className="container py-5">
        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <p className="text-uppercase text-primary fw-semibold mb-1">
              My Village
            </p>
            <h1 className="fw-bold mb-2">{village}</h1>
            <p className="text-secondary mb-0">
              Village overview for {managerName}. This page shows real village
              users, maintenance, and document data from PostgreSQL.
            </p>
          </div>
        </section>

        <section className="mb-4">
          <div className="row g-3">
            <div className="col-md-4 col-xl-2">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-secondary mb-2">Residents</p>
                <h2 className="fw-bold mb-1">{residents.length}</h2>
              </div>
            </div>

            <div className="col-md-4 col-xl-2">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-secondary mb-2">Maintenance</p>
                <h2 className="fw-bold mb-1">{maintenance.length}</h2>
              </div>
            </div>

            <div className="col-md-4 col-xl-2">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-secondary mb-2">Pending</p>
                <h2 className="fw-bold text-warning mb-1">{pending}</h2>
              </div>
            </div>

            <div className="col-md-4 col-xl-2">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-secondary mb-2">In Progress</p>
                <h2 className="fw-bold text-info mb-1">{inProgress}</h2>
              </div>
            </div>

            <div className="col-md-4 col-xl-2">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-secondary mb-2">Completed</p>
                <h2 className="fw-bold text-success mb-1">{completed}</h2>
              </div>
            </div>

            <div className="col-md-4 col-xl-2">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-100">
                <p className="text-secondary mb-2">Documents</p>
                <h2 className="fw-bold text-primary mb-1">
                  {documents.length}
                </h2>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div>
                <h2 className="fw-bold mb-1">Village Users Table</h2>
                <p className="text-secondary mb-0">
                  Search residents and village managers connected to {village}.
                </p>
              </div>

              <input
                className="form-control"
                style={{ maxWidth: '320px' }}
                placeholder="Search user, email, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Village</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user: any) => {
                    const id = user.id ?? user.Id
                    const active = user.isActive ?? user.IsActive

                    return (
                      <tr key={id}>
                        <td>{user.userName ?? user.UserName}</td>
                        <td>
                          {user.fullName ??
                            user.FullName ??
                            `${user.firstName ?? user.FirstName ?? ''} ${
                              user.lastName ?? user.LastName ?? ''
                            }`}
                        </td>
                        <td>{user.email ?? user.Email}</td>
                        <td>{user.role ?? user.Role}</td>
                        <td>{user.village ?? user.Village}</td>
                        <td>
                          <span
                            className={`badge ${
                              active !== false ? 'bg-success' : 'bg-secondary'
                            }`}
                          >
                            {active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="d-flex gap-2 mt-3">
              <Link
                to="/village-manager/residents"
                className="btn btn-outline-primary"
              >
                Manage Residents
              </Link>

              <Link
                to="/village-manager/maintenance"
                className="btn btn-outline-dark"
              >
                Open Maintenance
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default MyVillage