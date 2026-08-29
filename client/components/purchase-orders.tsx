import { useEffect, useState } from 'react'
import Navbar from './navbar'
import { useLocation } from 'react-router-dom'


function PurchaseOrders() {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5072'

  const userVillage = sessionStorage.getItem('village') || 'Ngatea'
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  
  const allVillages = ['Ngatea', 'Whitianga']
  const villageOptions = isAdmin ? allVillages : [userVillage]

  const [orders, setOrders] = useState<any[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)

  const [village, setVillage] = useState(userVillage)
  const [title, setTitle] = useState('')
  const [unitNumber, setUnitNumber] = useState('')
  const [category, setCategory] = useState('')
  const [supplier, setSupplier] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [status, setStatus] = useState('Pending')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadOrders()
  }, [isAdmin, userVillage])

  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      setMessage('')
    }, 50000)

    return () => clearTimeout(timer)
  }, [message])

  async function loadOrders() {
    const url = isAdmin
      ? `${API_BASE_URL}/api/purchase-orders/admin/all`
      : `${API_BASE_URL}/api/purchase-orders/village/${userVillage}`

    const response = await fetch(url)

    if (response.ok) {
      const data = await response.json()
      setOrders(data)
    }
  }

  function resetForm() {
    setEditingId(null)
    setVillage(userVillage)
    setTitle('')
    setUnitNumber('')
    setCategory('')
    setSupplier('')
    setEstimatedCost('')
    setPriority('Normal')
    setStatus('Pending')
    setNotes('')
  }

  function handleEdit(order: any) {
    setEditingId(order.id)
    setVillage(order.village || userVillage)
    setTitle(order.title || '')
    setUnitNumber(order.unitNumber || '')
    setCategory(order.category || '')
    setSupplier(order.supplier || '')
    setEstimatedCost(String(order.estimatedCost || ''))
    setPriority(order.priority || 'Normal')
    setStatus(order.status || 'Pending')
    setNotes(order.notes || '')

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id: number) {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this purchase order?'
    )

    if (!confirmDelete) return

    const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      setMessage('Purchase order deleted.')
      resetForm()
      loadOrders()
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const order = {
      village: isAdmin ? village : userVillage,
      unitNumber,
      title,
      category,
      supplier,
      estimatedCost: Number(estimatedCost),
      priority,
      status,
      notes,
      createdByUserName: sessionStorage.getItem('username') || '',
    }

    const url = editingId
      ? `${API_BASE_URL}/api/purchase-orders/${editingId}`
      : `${API_BASE_URL}/api/purchase-orders`

    const method = editingId ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    })

    if (response.ok) {
      setMessage(editingId ? 'Purchase order updated.' : 'Purchase order created.')
      resetForm()
      loadOrders()
    }
  }

  return (
    <>
      <Navbar userType={isAdmin ? 'admin' : 'villageManager'} />

      <main className="container py-5">
        <section className="samct-card p-4 mb-4 border rounded-4 shadow-sm bg-white">
          <h2 className="fw-bold">Purchase Orders</h2>

          <p className="text-secondary mb-0 fw-semibold">
            Create and track purchase orders for maintenance, repairs,
            suppliers, and village unit expenses.
          </p>
        </section>

        {message && <div className="alert alert-success">{message}</div>}

        <section className="samct-card p-4 mb-4 border rounded-4 shadow-sm bg-white">
          <h4 className="mb-4">
            {editingId ? 'Edit Purchase Order' : 'New Purchase Order'}
          </h4>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Village</label>

                <select
                  className="form-select"
                  value={village}
                  disabled={!isAdmin}
                  onChange={(e) => setVillage(e.target.value)}
                >
                  {villageOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-5">
                <label className="form-label">Title</label>

                <input
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Unit Number</label>

                <input
                  className="form-control"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Priority</label>

                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Status</label>

                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Category</label>

                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Painting">Painting</option>
                  <option value="Gardening">Gardening</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Appliance">Appliance</option>
                  <option value="General Supplies">General Supplies</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Supplier</label>

                <input
                  className="form-control"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Estimated Cost</label>

                <input
                  type="number"
                  className="form-control"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Notes</label>

                <textarea
                  rows={4}
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary" type="submit">
                  {editingId ? 'Update Purchase Order' : 'Save Purchase Order'}
                </button>

                {editingId && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={resetForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>

        <section className="samct-card p-4 mb-4 border rounded-4 shadow-sm bg-white">
          <h4 className="mb-4">Existing Purchase Orders</h4>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Village</th>
                  <th>Title</th>
                  <th>Unit</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Cost</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.village}</td>
                    <td>{order.title}</td>
                    <td>{order.unitNumber}</td>
                    <td>{order.category}</td>
                    <td>{order.supplier}</td>
                    <td>${order.estimatedCost}</td>
                    <td>{order.priority}</td>
                    <td>{order.status}</td>
                    <td>{order.notes || '-'}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(order)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(order.id)}
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
        </section>
      </main>
    </>
  )
}

export default PurchaseOrders