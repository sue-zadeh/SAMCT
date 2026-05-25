import { useEffect, useState } from "react";
import Navbar from "./navbar";

type MaintenanceRequest = {
  id: number;
  title: string;
  description: string;
  unitOrAddress: string;
  priority: string;
  status: string;
  managerAnswer?: string;
  createdAt: string;
  updatedAt?: string;
};

function MaintenanceResident() {
  const API_BASE_URL = "http://localhost:5072";
  const userName = localStorage.getItem("username") || "";
  const village = localStorage.getItem("village") || "";

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unitOrAddress, setUnitOrAddress] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRequests = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/maintenance/resident/${userName}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load maintenance requests.");
      }

      setRequests(data);
    } catch (err: any) {
      setError(err.message || "Failed to load maintenance requests.");
    }
  };

  useEffect(() => {
    if (userName) {
      loadRequests();
    }
  }, [userName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Please add a title and description.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/maintenance/resident`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName,
          title,
          description,
          unitOrAddress,
          priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit request.");
      }

      setMessage("Maintenance request submitted successfully.");
      setTitle("");
      setDescription("");
      setUnitOrAddress("");
      setPriority("Normal");

      await loadRequests();
    } catch (err: any) {
      setError(err.message || "Failed to submit request.");
    }
  };

  const getStatusClass = (status: string) => {
    if (status === "Completed") return "bg-success";
    if (status === "In Progress") return "bg-info text-dark";
    return "bg-warning text-dark";
  };

  return (
    <>
      <Navbar userType="resident" />

      <main className="container py-5">
        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <p className="text-uppercase text-primary fw-semibold mb-1">
              Resident Maintenance
            </p>
            <h1 className="fw-bold mb-2">Maintenance Requests</h1>
            <p className="text-secondary mb-0">
              Submit a private maintenance request for your village: {village}.
            </p>
          </div>
        </section>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <h2 className="h4 fw-bold mb-4">New Maintenance Request</h2>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Issue Title</label>
                  <input
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Example: Leaking tap"
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Unit / Address
                  </label>
                  <input
                    className="form-control"
                    value={unitOrAddress}
                    onChange={(e) => setUnitOrAddress(e.target.value)}
                    placeholder="Example: Unit 6"
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">Priority</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write the issue clearly..."
                  />
                </div>
              </div>

              <button className="btn btn-primary mt-4" type="submit">
                Submit Request
              </button>
            </form>
          </div>
        </section>

        <section>
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <h2 className="h4 fw-bold mb-4">My Requests</h2>

            {requests.length === 0 ? (
              <p className="text-secondary mb-0">
                No maintenance requests submitted yet.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Issue</th>
                      <th>Location</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Manager Answer</th>
                    </tr>
                  </thead>

                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          {new Date(request.createdAt).toLocaleDateString(
                            "en-NZ"
                          )}
                        </td>
                        <td>
                          <strong>{request.title}</strong>
                          <div className="small text-secondary">
                            {request.description}
                          </div>
                        </td>
                        <td>{request.unitOrAddress || "-"}</td>
                        <td>{request.priority}</td>
                        <td>
                          <span
                            className={`badge ${getStatusClass(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td>
                          {request.managerAnswer ? (
                            <div className="p-2 bg-light border rounded-3 small">
                              {request.managerAnswer}
                            </div>
                          ) : (
                            <span className="text-secondary small">
                              Waiting for manager response
                            </span>
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
  );
}

export default MaintenanceResident;