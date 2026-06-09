import { useEffect, useState } from "react";
import Navbar from "./navbar";
import { useLocation } from "react-router-dom";

function PurchaseOrders() {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5072";

  const village = localStorage.getItem("village") || "Papakura";
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  const [orders, setOrders] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadOrders();
  }, [isAdmin, village]);

  async function loadOrders() {
    try {
      const url = isAdmin
        ? `${API_BASE_URL}/api/purchase-orders/admin/all`
        : `${API_BASE_URL}/api/purchase-orders/village/${village}`;

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const order = {
      village,
      unitNumber,
      title,
      category,
      supplier,
      estimatedCost: Number(estimatedCost),
      priority,
      notes,
      createdByUserName: localStorage.getItem("username") || "",
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/purchase-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        setMessage("Purchase order submitted successfully.");
        setTitle("");
        setUnitNumber("");
        setCategory("");
        setSupplier("");
        setEstimatedCost("");
        setPriority("Normal");
        setNotes("");
        loadOrders();
      } else {
        setMessage("Failed to submit purchase order.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Network error.");
    }
  }

  return (
    <>
      <Navbar userType={isAdmin ? "admin" : "villageManager"} />

      <main className="container py-5">
        <h1 className="fw-bold mb-4">Purchase Orders</h1>

        {message && <div className="alert alert-info">{message}</div>}

        <form onSubmit={handleSubmit} className="p-4 border rounded-4 shadow-sm bg-white mb-4">
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Unit Number</label>
            <input className="form-control" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <input className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Supplier</label>
            <input className="form-control" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Estimated Cost</label>
            <input className="form-control" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Priority</label>
            <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option>Normal</option>
              <option>Urgent</option>
              <option>Low</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Notes</label>
            <textarea className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <button className="btn btn-primary">Submit</button>
        </form>

        <div className="p-4 border rounded-4 shadow-sm bg-white">
          <h2 className="fw-bold mb-3">Saved Orders</h2>

          {orders.length === 0 ? (
            <p className="text-secondary">No purchase orders saved yet.</p>
          ) : (
            <ul>
              {orders.map((order) => (
                <li key={order.id}>
                  {order.title} - {order.village}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}

export default PurchaseOrders;