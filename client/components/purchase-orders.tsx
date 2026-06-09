import { useEffect, useState } from 'react'
import Navbar from './navbar'
import { useLocation } from 'react-router-dom'

function PurchaseOrders() {
  const village = localStorage.getItem('village') || 'Papakura'
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  const [orders, setOrders] = useState<any[]>([])

  const [title, setTitle] = useState('')
  const [unitNumber, setUnitNumber] = useState('')
  const [category, setCategory] = useState('')
  const [supplier, setSupplier] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadOrders()
  }, [isAdmin, village])

  async function loadOrders() {
    try {
      const url = isAdmin
        ? 'http://localhost:5072/api/purchase-orders/admin/all'
        : `http://localhost:5072/api/purchase-orders/village/${village}`

      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const order = {
      village,
      unitNumber,
      title,
      category,
      supplier,
      estimatedCost: Number(estimatedCost),
      priority,
      notes,
      createdByUserName: localStorage.getItem('username') || '',
    }

    const response = await fetch('http://localhost:5072/api/purchase-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    })

    if (response.ok) {
      setMessage('Purchase order created.')

      setTitle('')
      setUnitNumber('')
      setCategory('')
      setSupplier('')
      setEstimatedCost('')
      setPriority('Normal')
      setNotes('')

      loadOrders()
    }
  }

  return (
    <>
      <Navbar userType={isAdmin ? 'admin' : 'villageManager'} />

      <main className="container py-5">
        <section className="samct-card p-4 mb-4">
          <h2 className="fw-bold">Purchase Orders</h2>

          <p className="text-secondary mb-0 fs-5">
            Create and track purchase orders for maintenance, repairs,
            suppliers, and village unit expenses.
          </p>
        </section>

        {message && <div className="alert alert-success">{message}</div>}

        <section className="samct-card p-4 mb-4">
          <h4 className="mb-4">New Purchase Order</h4>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
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

              <div className="col-md-4">
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

              <div className="col-md-4">
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

              <div className="col-12">
                <button className="btn btn-primary" type="submit">
                  Save Purchase Order
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="samct-card p-4">
          <h4 className="mb-4">Existing Purchase Orders</h4>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Unit</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Cost</th>
                  <th>Priority</th>
                  <th>Notes</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.title}</td>
                    <td>{order.unitNumber}</td>
                    <td>{order.category}</td>
                    <td>{order.supplier}</td>
                    <td>${order.estimatedCost}</td>
                    <td>{order.priority}</td>
                    <td>{order.notes || '-'}</td>
                    <td>{order.status}</td>
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
