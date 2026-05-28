import { useEffect, useState } from "react";
import Navbar from "./navbar";

type MaintenanceRequest = {
  id: number;
  residentName: string;
  title: string;
  description: string;
  unitOrAddress: string;
  priority: string;
  status: string;
  village: string;
  managerAnswer?: string;
  createdAt: string;
};

function MaintenanceAdmin() {
  const API_BASE_URL = "http://localhost:5072";

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    try {
      setError("");

      const villages = ["Papakura", "Ngatea", "Whitianga"];

      const allData = await Promise.all(
        villages.map(async (village) => {
          const response = await fetch(
            `${API_BASE_URL}/api/maintenance/village/${encodeURIComponent(village)}`
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to load maintenance.");
          }

          return data;
        })
      );

      setRequests(allData.flat());
    } catch (err: any) {
      setError(err.message || "Failed to load maintenance.");
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const getStatusClass = (status: string) => {
    if (status === "Completed") return "bg-success";
    if (status === "In Progress") return "bg-info text-dark";
    return "bg-warning text-dark";
  };

  return (
    <>
      <Navbar userType="admin" />

      <main className="container py-5">
        <section className="mb-4">
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            <p className="text-uppercase text-primary fw-semibold mb-1">
              Admin Read Only
            </p>
            <h1 className="fw-bold mb-2">All Maintenance Requests</h1>
            <p className="text-secondary mb-0">
              Admin can view all village maintenance activity and manager responses.
            </p>
          </div>
        </section>

        {error && <div className="alert alert-danger">{error}</div>}

        <section>
          <div className="p-4 border rounded-4 shadow-sm bg-white">
            {requests.length === 0 ? (
              <p className="text-secondary mb-0">
                No maintenance requests found.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Village</th>
                      <th>Resident</th>
                      <th>Issue</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Manager Answer</th>
                    </tr>
                  </thead>

                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td>{new Date(request.createdAt).toLocaleDateString("en-NZ")}</td>
                        <td>{request.village}</td>
                        <td>
                          <strong>{request.residentName}</strong>
                          <div className="small text-secondary">
                            {request.unitOrAddress}
                          </div>
                        </td>
                        <td>
                          <strong>{request.title}</strong>
                          <div className="small text-secondary">
                            {request.description}
                          </div>
                        </td>
                        <td>{request.priority}</td>
                        <td>
                          <span className={`badge ${getStatusClass(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td>
                          {request.managerAnswer || (
                            <span className="text-secondary">
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

export default MaintenanceAdmin;
