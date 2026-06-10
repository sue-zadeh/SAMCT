import { useEffect, useState } from 'react'
import Navbar from './navbar'

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
  notes: string
  documentUrl1: string
  documentUrl2: string
  isVisibleOnMarketing: boolean
  marketingTitle: string
  marketingDescription: string
  createdAt: string
}

function AdminVillageProperties() {
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5072";
  const [properties, setProperties] = useState<VillageProperty[]>([])
  const [mainSearch, setMainSearch] = useState('')
  const [villageSearch, setVillageSearch] = useState('')
  const [error, setError] = useState('')

  const loadProperties = async () => {
    try {
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/village-properties/admin/all`,
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load village data.')
      }

      setProperties(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || 'Failed to load village data.')
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  useEffect(() => {
    if (!error) return

    const timer = setTimeout(() => {
      setError('')
    }, 50000)

    return () => clearTimeout(timer)
  }, [error])

  const filteredProperties = properties.filter((item) => {
    const allText = `
      ${item.village}
      ${item.unitNumber}
      ${item.address}
      ${item.residentName}
      ${item.residentEmail}
      ${item.residentOccupation}
      ${item.villageManagerName}
      ${item.notes}
      ${item.marketingTitle}
      ${item.marketingDescription}
    `.toLowerCase()

    return (
      allText.includes(mainSearch.toLowerCase()) &&
      item.village.toLowerCase().includes(villageSearch.toLowerCase())
    )
  })

  return (
    <>
      <Navbar userType="admin" />

      <main className="container py-5">
        <section className="mb-4">
          <div className="samct-card p-4 border rounded-4 shadow-sm bg-white">
            <p className="text-uppercase text-primary fw-semibold mb-1">
              Admin Read Only
            </p>
            <h1 className="fw-bold mb-2">Village Property Data</h1>
            <p className="text-secondary mb-0">
              View all village property records, documents, residents, managers,
              and public marketing visibility.
            </p>
          </div>
        </section>

        {error && <div className="alert alert-danger">{error}</div>}

        <section className="mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="samct-card p-4 h-100 border rounded-4 shadow-sm bg-white">
                <p className="text-secondary mb-2">Total Properties</p>
                <h2 className="fw-bold mb-1">{properties.length}</h2>
                <p className="small text-secondary mb-0">
                  Across all villages
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="samct-card p-4 h-100">
                <p className="text-secondary mb-2">Marketing Listings</p>
                <h2 className="fw-bold text-primary mb-1">
                  {
                    properties.filter((item) => item.isVisibleOnMarketing)
                      .length
                  }
                </h2>
                <p className="small text-secondary mb-0">
                  Visible to public
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="samct-card p-4 h-100 border rounded-4 shadow-sm bg-white">
                <p className="text-secondary mb-2">Documents</p>
                <h2 className="fw-bold text-primary mb-1">
                  {properties.reduce(
                    (total, item) =>
                      total +
                      (item.documentUrl1 ? 1 : 0) +
                      (item.documentUrl2 ? 1 : 0),
                    0,
                  )}
                </h2>
                <p className="small text-secondary mb-0">
                  Uploaded village files
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="samct-card p-4 mb-4 border rounded-4 shadow-sm bg-white">
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-1">All Village Records</h2>
              <p className="text-secondary mb-3">
                Admin can view this data only. Editing stays with village
                managers.
              </p>

              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <input
                  className="form-control"
                  style={{ maxWidth: '360px' }}
                  placeholder="Search all records..."
                  value={mainSearch}
                  onChange={(e) => setMainSearch(e.target.value)}
                />

                <input
                  className="form-control"
                  style={{ maxWidth: '260px' }}
                  placeholder="Filter by village..."
                  value={villageSearch}
                  onChange={(e) => setVillageSearch(e.target.value)}
                />
              </div>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="alert alert-warning mb-0">
                No matching village records found.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Village</th>
                      <th>Unit</th>
                      <th>Resident</th>
                      <th>Email</th>
                      <th>Occupation</th>
                      <th>Manager</th>
                      <th>Marketing</th>
                      <th>Documents</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProperties.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.village}</strong>
                        </td>

                        <td>
                          <strong>{item.unitNumber}</strong>
                          <div className="small text-secondary">
                            {item.address}
                          </div>
                        </td>

                        <td>
                          {item.residentName || '-'}
                          <div className="small text-secondary">
                            {item.residentCount} resident(s)
                          </div>
                        </td>

                        <td>{item.residentEmail || '-'}</td>
                        <td>{item.residentOccupation || '-'}</td>
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

                        <td>
                          <div className="d-flex flex-column gap-1">
                            {item.documentUrl1 ? (
                              <a
                                href={`${API_BASE_URL}${item.documentUrl1}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline-primary btn-sm"
                              >
                                Open Document 1
                              </a>
                            ) : (
                              <span className="small text-secondary">
                                No document 1
                              </span>
                            )}

                            {item.documentUrl2 ? (
                              <a
                                href={`${API_BASE_URL}${item.documentUrl2}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline-primary btn-sm"
                              >
                                Open Document 2
                              </a>
                            ) : (
                              <span className="small text-secondary">
                                No document 2
                              </span>
                            )}
                          </div>
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

export default AdminVillageProperties