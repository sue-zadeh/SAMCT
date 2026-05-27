import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./navbar";

type AdminMaintenanceSummary = {
  village: string;
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
};

function HomeAdmins() {
  const API_BASE_URL = "http://localhost:5072";

  const fullName =
    localStorage.getItem("fullname") || "Admin";

  const firstName =
    localStorage.getItem("firstname") || "Admin";

  const role =
    localStorage.getItem("role") || "Administrator";

  const savedImage =
    localStorage.getItem("profileImageUrl") ||
    "https://via.placeholder.com/100";

  const profileImageSrc = savedImage.startsWith("http")
    ? `${savedImage}?t=${Date.now()}`
    : `${API_BASE_URL}${savedImage}?t=${Date.now()}`;

  const [maintenanceSummary, setMaintenanceSummary] =
    useState<AdminMaintenanceSummary[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/maintenance/summary/admin`)
      .then((res) => res.json())
      .then((data) => setMaintenanceSummary(data))
      .catch((err) => {
        console.error("Failed loading admin summary", err);
      });
  }, []);

  return (
    <>
      <Navbar userType="admin" />

      <main className="container py-5">

        {/* HEADER */}
        <section className="mb-5">
          <div className="p-4 border rounded-4 shadow-sm bg-white d-flex justify-content-between align-items-center flex-wrap gap-4">

            <div className="d-flex align-items-center gap-3">
              <img
                src={profileImageSrc}
                alt={fullName}
                width="80"
                height="80"
                className="rounded-circle border"
                style={{ objectFit: "cover" }}
              />

              <div>
                <p className="text-uppercase text-primary fw-semibold mb-1">
                  Admin Portal
                </p>

                <h1 className="fw-bold mb-1">
                  Welcome, {firstName}
                </h1>

                <p className="text-secondary mb-0">
                  {fullName} | {role}
                </p>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Link
                to="/admin/profile"
                className="btn btn-primary"
              >
                My Profile
              </Link>

              <Link
                to="/admin/people"
                className="btn btn-outline-dark"
              >
                Manage Users
              </Link>
            </div>
          </div>
        </section>

        {/* REAL MAINTENANCE SUMMARY */}
        <section className="mb-5">
          <div className="p-4 border rounded-4 shadow-sm bg-white">

            <div className="mb-4">
              <p className="text-uppercase text-primary fw-semibold mb-1">
                Maintenance Overview
              </p>

              <h2 className="fw-bold">
                Village Maintenance Status
              </h2>
            </div>

            <div className="row g-3">

              {maintenanceSummary.map((item) => (
                <div
                  className="col-md-6 col-xl-4"
                  key={item.village}
                >
                  <div className="p-4 border rounded-4 h-100">

                    <h3 className="h5 fw-bold">
                      {item.village}
                    </h3>

                    <div className="d-flex flex-wrap gap-2 mt-3">

                      <span className="badge bg-warning text-dark">
                        Pending: {item.pending}
                      </span>

                      <span className="badge bg-info text-dark">
                        In Progress: {item.inProgress}
                      </span>

                      <span className="badge bg-success">
                        Completed: {item.completed}
                      </span>

                    </div>

                    <p className="small text-secondary mt-3 mb-0">
                      Total requests: {item.total}
                    </p>

                  </div>
                </div>
              ))}

            </div>
          </div>
        </section>

      </main>
    </>
  );
}

export default HomeAdmins;