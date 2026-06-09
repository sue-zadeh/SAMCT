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
  isVisibleOnMarketing: boolean
  marketingTitle: string
  marketingDescription: string
  marketingImageUrl1: string
  marketingImageUrl2: string
  marketingImageUrl3: string
  marketingImageUrl4: string
  marketingImageUrl5: string
}

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
  const navigate = useNavigate()

  const [properties, setProperties] = useState<VillageProperty[]>([])
  const [users, setUsers] = useState<UserOption[]>([])

  const [mainSearch, setMainSearch] = useState('')
  const [unitSearch, setUnitSearch] = useState('')

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

  const [marketingImage1, setMarketingImage1] = useState<File | null>(null)
  const [marketingImage2, setMarketingImage2] = useState<File | null>(null)
  const [marketingImage3, setMarketingImage3] = useState<File | null>(null)
  const [marketingImage4, setMarketingImage4] = useState<File | null>(null)
  const [marketingImage5, setMarketingImage5] = useState<File | null>(null)

  const [isVisibleOnMarketing, setIsVisibleOnMarketing] = useState(false)
  const [marketingTitle, setMarketingTitle] = useState('')
  const [marketingDescription, setMarketingDescription] = useState('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const residents = users.filter(
    (user) =>
      user.role.toLowerCase().includes('resident') && user.isActive !== false,
  )

  const managers = users.filter(
    (user) =>
      user.role.toLowerCase().includes('village') && user.isActive !== false,
  )

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

      setProperties(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || 'Failed to load village properties.')
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/by-village/${encodeURIComponent(village)}`,
      )

      if (!response.ok) return

      const data = await response.json()
      setUsers(Array.isArray(data) ? data : data.users || data.data || [])
    } catch {
      setUsers([])
    }
  }

  useEffect(() => {
    loadProperties()
    loadUsers()
  }, [village])

  useEffect(() => {
    if (!message && !error) return

    const timer = setTimeout(() => {
      setMessage('')
      setError('')
    }, 50000)

    return () => clearTimeout(timer)
  }, [message, error])

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
    setMarketingImage1(null)
    setMarketingImage2(null)
    setMarketingImage3(null)
    setMarketingImage4(null)
    setMarketingImage5(null)
    setIsVisibleOnMarketing(false)
    setMarketingTitle('')
    setMarketingDescription('')
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!unitNumber.trim() || !address.trim()) {
      setError('Please add unit number and address.')
      return
    }

    if (!residentName.trim()) {
      setError('Please select a resident.')
      return
    }

    if (!villageManagerName.trim()) {
      setError('Please select a village manager.')
      return
    }

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
    formData.append('isVisibleOnMarketing', String(isVisibleOnMarketing))
    formData.append('marketingTitle', marketingTitle)
    formData.append('marketingDescription', marketingDescription)

    if (document1) formData.append('document1', document1)
    if (document2) formData.append('document2', document2)

    if (marketingImage1) formData.append('marketingImage1', marketingImage1)
    if (marketingImage2) formData.append('marketingImage2', marketingImage2)
    if (marketingImage3) formData.append('marketingImage3', marketingImage3)
    if (marketingImage4) formData.append('marketingImage4', marketingImage4)
    if (marketingImage5) formData.append('marketingImage5', marketingImage5)

    try {
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
    setIsVisibleOnMarketing(property.isVisibleOnMarketing || false)
    setMarketingTitle(property.marketingTitle || '')
    setMarketingDescription(property.marketingDescription || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this property?'))
      return

    const response = await fetch(
      `${API_BASE_URL}/api/village-properties/${id}`,
      {
        method: 'DELETE',
      },
    )

    if (response.ok) {
      setMessage('Village property deleted successfully.')
      await loadProperties()
    }
  }

  const handleMarketingToggle = async (id: number, visible: boolean) => {
    const response = await fetch(
      `${API_BASE_URL}/api/village-properties/${id}/marketing-visibility`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisibleOnMarketing: visible }),
      },
    )

    if (response.ok) {
      await loadProperties()
    }
  }

  const filteredProperties = properties.filter((item) => {
    const allText = `
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
      item.unitNumber.toLowerCase().includes(unitSearch.toLowerCase())
    )
  })

  return (
    <>
      <Navbar userType="villageManager" />

      <main className="container py-5">
        <section className="mb-4">
          <div className="samct-card p-4 text-center">
            <p className="text-uppercase text-primary fw-semibold mb-1">
              My Village
            </p>
            <h2 className="fw-bold mb-2">{village}</h2>
            <p className="text-secondary mb-0">
              Manage village properties, residents, files, and marketing
              visibility.
            </p>
            <div className="alert alert-info mb-4">
              <h5 className="px-3 fw-semibold text-start">
                How to use this page
              </h5>

              <ul className="mb-0 mt-2 text-start">
                <li>Add a unit and resident information.</li>
                <li>Upload property documents if available.</li>
                <li>Add marketing title, description, and up to 5 images.</li>
                <li>
                  Turn Marketing Visibility ON to show the property on the
                  public Marketing page.
                </li>
                <li>Use Edit to update property information later.</li>
                <li>
                  A copy of the property detail will send to the admin dashboard
                  automatically
                </li>
              </ul>
            </div>
          </div>
        </section>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <section className="mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="samct-card p-4 h-100">
                <p className="text-secondary mb-2">Village Properties</p>
                <h2 className="fw-bold">{properties.length}</h2>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="samct-card p-4 h-100"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/village-manager/residents')}
              >
                <p className="text-secondary mb-2">Active Residents</p>
                <h2 className="fw-bold">{residents.length}</h2>
                <p className="small text-secondary mb-0">
                  Click to manage residents
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="samct-card p-4 h-100">
                <p className="text-secondary mb-2">Documents</p>
                <h2 className="fw-bold text-primary">
                  {properties.reduce(
                    (total, item) =>
                      total +
                      (item.documentUrl1 ? 1 : 0) +
                      (item.documentUrl2 ? 1 : 0),
                    0,
                  )}
                </h2>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="samct-card p-4">
            <h2 className="fw-bold mb-4">
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
                  />
                </div>

                <div className="col-md-5">
                  <label className="form-label fw-semibold">Address</label>
                  <input
                    className="form-control"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
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
                    value={residentCount}
                    onChange={(e) => setResidentCount(Number(e.target.value))}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label fw-semibold">
                    Resident Name
                  </label>
                  <select
                    className="form-select"
                    value={residentName}
                    onChange={(e) => {
                      const selectedName = e.target.value
                      setResidentName(selectedName)

                      const selectedResident = residents.find((resident) => {
                        const name =
                          resident.fullName ||
                          `${resident.firstName} ${resident.lastName}`
                        return name === selectedName
                      })

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
                    className="form-select"
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

                <div className="col-12">
                  <hr />
                  <h4 className="fw-bold mb-3">Marketing Page Settings</h4>

                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isVisibleOnMarketing}
                      onChange={(e) =>
                        setIsVisibleOnMarketing(e.target.checked)
                      }
                    />
                    <label className="form-check-label">
                      Show this property on the public Marketing page
                    </label>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Marketing Title
                  </label>
                  <input
                    className="form-control"
                    value={marketingTitle}
                    onChange={(e) => setMarketingTitle(e.target.value)}
                    placeholder="Unit 5 - Papakura Village"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Marketing Description
                  </label>
                  <textarea
                    rows={4}
                    className="form-control"
                    value={marketingDescription}
                    onChange={(e) => setMarketingDescription(e.target.value)}
                    placeholder="Modern unit with sunny lounge and garden views..."
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
                </div>

                <div className="col-12">
                  <h5 className="fw-bold mt-3">Marketing Gallery Images</h5>
                  <p className="text-secondary small">
                    Upload up to 5 images. Image 1 is the main public image.
                  </p>
                </div>

                {[1, 2, 3, 4, 5].map((num) => (
                  <div className="col-md-4" key={num}>
                    <label className="form-label fw-semibold">
                      {num === 1
                        ? 'Main Marketing Image'
                        : `Gallery Image ${num}`}
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="form-control"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        if (num === 1) setMarketingImage1(file)
                        if (num === 2) setMarketingImage2(file)
                        if (num === 3) setMarketingImage3(file)
                        if (num === 4) setMarketingImage4(file)
                        if (num === 5) setMarketingImage5(file)
                      }}
                    />
                  </div>
                ))}

                <div className="col-12 d-flex gap-2">
                  <button
                    className="btn btn-primary samct-button"
                    type="submit"
                  >
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
          <div className="samct-card p-4">
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-1">My Village Table</h2>
              <p className="text-secondary mb-3">
                Search by all records or filter by unit number.
              </p>

              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <input
                  className="form-control"
                  style={{ maxWidth: '360px' }}
                  placeholder="Search all village records..."
                  value={mainSearch}
                  onChange={(e) => setMainSearch(e.target.value)}
                />

                <input
                  className="form-control"
                  style={{ maxWidth: '260px' }}
                  placeholder="Search by unit number..."
                  value={unitSearch}
                  onChange={(e) => setUnitSearch(e.target.value)}
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
                      <th>Unit</th>
                      <th>Resident</th>
                      <th>Email</th>
                      <th>Occupation</th>
                      <th>Manager</th>
                      <th>Marketing</th>
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
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={item.isVisibleOnMarketing}
                              onChange={() =>
                                handleMarketingToggle(
                                  item.id,
                                  !item.isVisibleOnMarketing,
                                )
                              }
                            />
                          </div>

                          <small
                            className={
                              item.isVisibleOnMarketing
                                ? 'text-success'
                                : 'text-secondary'
                            }
                          >
                            {item.isVisibleOnMarketing ? 'Visible' : 'Hidden'}
                          </small>
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
