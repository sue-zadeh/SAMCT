import { useEffect, useState } from 'react'
import Navbar from './navbar'
import { useNavigate } from 'react-router-dom'

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
  createdAt: string
}
//for residents, dropdown list
type UserOption = {
  id: number
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: string
  village: string
  isActive: boolean
}

function MyVillage() {
  const API_BASE_URL = 'http://localhost:5072'
  const village = localStorage.getItem('village') || 'Papakura'
  const managerName = localStorage.getItem('fullname') || 'Village Manager'

  const [properties, setProperties] = useState<VillageProperty[]>([])
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [unitNumber, setUnitNumber] = useState('')
  const [address, setAddress] = useState('')
  const [residentCount, setResidentCount] = useState(1)
  const [residentName, setResidentName] = useState('')
  const [residentEmail, setResidentEmail] = useState('')
  const [residentOccupation, setResidentOccupation] = useState('')
  const [villageManagerName, setVillageManagerName] = useState('')
  const [notes, setNotes] = useState('')
  const [document1, setDocument1] = useState<File | null>(null)
  const [document2, setDocument2] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [mainSearch, setMainSearch] = useState('')
  const [nameSearch, setNameSearch] = useState('')

  const [users, setUsers] = useState<UserOption[]>([])
  const [residentNameSearch, setResidentNameSearch] = useState('')
  const navigate = useNavigate()
  const loadProperties = async () => {
    try {
      setError('')
      const response = await fetch(
        `${API_BASE_URL}/api/village-properties/${encodeURIComponent(village)}`,
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load village properties.')
      }

      setProperties(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load village properties.')
    }
  }

  useEffect(() => {
    loadProperties()
  }, [village])

  const clearForm = () => {
    setUnitNumber('')
    setAddress('')
    setResidentCount(1)
    setResidentName('')
    setResidentEmail('')
    setResidentOccupation('')
    setVillageManagerName('')
    setNotes('')
    setDocument1(null)
    setDocument2(null)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setMessage('')
      setError('')

      const formData = new FormData()
      formData.append('village', village)
      formData.append('unitNumber', unitNumber)
      formData.append('address', address)
      formData.append('residentCount', String(residentCount))
      formData.append('residentName', residentName)
      formData.append('residentEmail', residentEmail)
      formData.append('residentOccupation', residentOccupation)
      formData.append('villageManagerName', villageManagerName)
      formData.append('notes', notes)

      if (document1) formData.append('document1', document1)
      if (document2) formData.append('document2', document2)

      const url =
        editingId === null
          ? `${API_BASE_URL}/api/village-properties`
          : `${API_BASE_URL}/api/village-properties/${editingId}`

      const response = await fetch(url, {
        method: editingId === null ? 'POST' : 'PUT',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save property.')
      }

      setMessage(
        editingId === null
          ? 'Village property saved successfully.'
          : 'Village property updated successfully.',
      )

      clearForm()
      await loadProperties()
    } catch (err: any) {
      setError(err.message || 'Failed to save property.')
    }
  }

  const handleEdit = (property: VillageProperty) => {
    setEditingId(property.id)
    setUnitNumber(property.unitNumber)
    setAddress(property.address)
    setResidentCount(property.residentCount)
    setResidentName(property.residentName)
    setResidentEmail(property.residentEmail)
    setResidentOccupation(property.residentOccupation)
    setVillageManagerName(property.villageManagerName)
    setNotes(property.notes)
    setDocument1(null)
    setDocument2(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  // users dropdown list
  const residents = users.filter(
    (user) =>
      user.role.toLowerCase().includes('resident') && user.isActive !== false,
  )

  const managers = users.filter(
    (user) =>
      user.role.toLowerCase().includes('village') && user.isActive !== false,
  )

  const loadUsers = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/users/by-village/${encodeURIComponent(village)}`,
    )

    if (!response.ok) return

    const data = await response.json()
    setUsers(Array.isArray(data) ? data : data.users || data.data || [])
  }
  useEffect(() => {
    loadProperties()
    loadUsers()
  }, [village])

  //Action delete

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this village property?',
    )

    if (!confirmed) return

    try {
      setMessage('')
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/village-properties/${id}`,
        { method: 'DELETE' },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete property.')
      }

      setMessage('Village property deleted successfully.')
      await loadProperties()
    } catch (err: any) {
      setError(err.message || 'Failed to delete property.')
    }
  }

  const filteredProperties = properties.filter((item) => {
    const mainText = `
    ${item.unitNumber}
    ${item.address}
    ${item.residentName}
    ${item.residentEmail}
    ${item.residentOccupation}
    ${item.villageManagerName}
    ${item.notes}
  `.toLowerCase()

    const residentOnly = item.residentName.toLowerCase()

    return (
      mainText.includes(mainSearch.toLowerCase()) &&
      residentOnly.includes(nameSearch.toLowerCase())
    )
  })
  // Notifications disappear after 50 seconds
  useEffect(() => {
    if (!message && !error) return

    const timer = setTimeout(() => {
      setMessage('')
      setError('')
    }, 50000)

    return () => clearTimeout(timer)
  }, [message, error])

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
              Manage village property records, residents, occupations, manager
              allocation, and related documents.
            </p>
          </div>
        </section>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <section className="mb-2">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-70">
                <p className="text-secondary mb-2">Village Properties</p>
                <h2 className="fw-bold mb-1">{properties.length}</h2>
                <p className="small text-secondary mb-0">
                  Saved property records
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="p-4 border rounded-4 shadow-sm bg-white h-70"
                style={{
                  cursor: 'pointer',
                  transition: '0.2s',
                }}
                onClick={() => navigate('/village-manager/residents')}
              >
                <p className="text-secondary mb-2">Total Residents</p>

                <h2 className="fw-bold mb-1">{residents.length}</h2>

                <p className="small text-secondary mb-0">
                  Click to manage residents
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 border rounded-4 shadow-sm bg-white h-70">
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
                  Uploaded property files
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <h2 className="fw-bold mb-3">
              {editingId ? 'Edit Village Property' : 'Add Village Property'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-2">
                  <label className="form-label fw-semibold">Unit Number</label>
                  <input
                    className="form-control"
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-5">
                  <label className="form-label fw-semibold">Address</label>
                  <input
                    className="form-control"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Number of Residents
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="Select resident's name"
                    value={residentCount}
                    onChange={(e) => setResidentCount(Number(e.target.value))}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label fw-semibold">
                    Resident Name
                  </label>
                  <select
                    className="form-control col-md-3 "
                    value={residentName}
                    onChange={(e) => {
                      const selectedName = e.target.value
                      setResidentName(selectedName)
                      const selectedResident = residents.find(
                        (resident) =>
                          (resident.fullName ||
                            `${resident.firstName} ${resident.lastName}`) ===
                          selectedName,
                      )

                      setResidentEmail(selectedResident?.email || '')
                    }}
                  >
                    <option value="">Select resident</option>
                    {residents.map((resident) => {
                      const name =
                        resident.fullName ||
                        `${resident.firstName} ${resident.lastName}`

                      return (
                        <option key={resident.id} value={name}>
                          {name}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Resident Email
                  </label>
                  <input
                    className="form-control"
                    value={residentEmail}
                    readOnly
                    placeholder="Email fills automatically"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Resident Occupation
                  </label>
                  <input
                    className="form-control"
                    value={residentOccupation}
                    onChange={(e) => setResidentOccupation(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Village Manager
                  </label>
                  <select
                    className="form-control"
                    value={villageManagerName}
                    onChange={(e) => setVillageManagerName(e.target.value)}
                  >
                    <option value="">Select village manager</option>
                    {managers.map((manager) => {
                      const name =
                        manager.fullName ||
                        `${manager.firstName} ${manager.lastName}`

                      return (
                        <option key={manager.id} value={name}>
                          {name}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Document 1 optional
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setDocument1(e.target.files?.[0] || null)}
                  />
                  <small className="text-center px-5">
                    pdf, doc, jpg, jpeg, png{' '}
                  </small>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Document 2 optional
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setDocument2(e.target.files?.[0] || null)}
                  />
                  <small className="text-center px-5">
                    pdf, doc, jpg, jpeg, png{' '}
                  </small>
                </div>

                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="submit">
                    {editingId ? 'Update Property' : 'Save Property'}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-outline-dark"
                      onClick={clearForm}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </section>

        <section>
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center mb-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1">My Village Table</h2>
                <p className="text-secondary mb-3">
                  Search by unit, resident, email, occupation, manager, or
                  notes.
                </p>

                <div className="d-flex justify-content-center gap-3 flex-wrap my-3">
                  <>
                    <input
                      className="form-control"
                      style={{ maxWidth: '360px' }}
                      placeholder="Search all village records..."
                      value={mainSearch}
                      onChange={(e) => setMainSearch(e.target.value)}
                    />
                  </>
                  <>
                    <input
                      className="form-control"
                      style={{ maxWidth: '300px' }}
                      placeholder="Search by resident name..."
                      value={nameSearch}
                      onChange={(e) => setNameSearch(e.target.value)}
                    />
                  </>
                </div>
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
                      <th>Unit</th>
                      <th>Resident</th>
                      <th>Email</th>
                      <th>Occupation</th>
                      <th>Manager</th>
                      <th>Documents</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProperties.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.unitNumber}</strong>
                          <div className="small text-secondary">
                            {item.address}
                          </div>
                        </td>

                        <td>
                          {item.residentName || 'No resident added'}
                          <div className="small text-secondary">
                            {item.residentCount} resident(s)
                          </div>
                        </td>

                        <td>{item.residentEmail || '-'}</td>
                        <td>{item.residentOccupation || '-'}</td>
                        <td>{item.villageManagerName || '-'}</td>

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

                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </button>
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

export default MyVillage
