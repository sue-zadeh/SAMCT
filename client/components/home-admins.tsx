import { Link } from "react-router-dom";
import Navbar from "./navbar";

function HomeAdmins() {
  const API_BASE_URL = "http://localhost:5072";

  const fullName = localStorage.getItem("fullname") || "Graeme Norton";
  const firstName = localStorage.getItem("firstname") || "Graeme";
  const role = localStorage.getItem("role") || "CompanySecretary";
  const village = localStorage.getItem("village") || "Papakura";
const savedImage =
  localStorage.getItem("profileImageUrl") ||
  "https://via.placeholder.com/100";

const profileImageSrc = savedImage.startsWith("http")
  ? `${savedImage}?t=${Date.now()}`
  : `${API_BASE_URL}${savedImage}?t=${Date.now()}`;

  
  return (
    <>
      <Navbar userType="admin" />

      <main className="container py-5">
        <section className="mb-5">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4 p-4 border rounded-4 shadow-sm bg-white">
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
                <h1 className="fw-bold mb-1">Welcome, {firstName}</h1>
                <p className="text-secondary mb-0">
                  {fullName} | {role} | Village: {village}
                </p>
              </div>
            </div>

            <div>
              <h2 className="h4 fw-bold mb-2">Admin Dashboard</h2>
              <p className="text-secondary mb-0">
                Manage residents, records, maintenance, village data, and public website content.
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <Link to="/admin/profile" className="btn btn-primary">
                My Profile
              </Link>
              <Link to="/admin/people" className="btn btn-outline-dark">
                Manage Users
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-5">
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
                <h3 className="h5 fw-bold">Residents</h3>
                <p className="text-secondary">
                  View all resident profiles, update access, and activate or deactivate accounts.
                </p>
                <Link to="/admin/people" className="btn btn-outline-primary btn-sm">
                  Open Residents
                </Link>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
                <h3 className="h5 fw-bold">Village Data</h3>
                <p className="text-secondary">
                  Manage property data, structured records, and village-specific information.
                </p>
                <button className="btn btn-outline-primary btn-sm">Open Village Data</button>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
                <h3 className="h5 fw-bold">Maintenance</h3>
                <p className="text-secondary">
                  Review maintenance requests and track updates across villages.
                </p>
                <button className="btn btn-outline-primary btn-sm">Open Maintenance</button>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
                <h3 className="h5 fw-bold">Documents & Notices</h3>
                <p className="text-secondary">
                  Upload and manage resident notices, code of practice docs, and operational files.
                </p>
                <button className="btn btn-outline-primary btn-sm">Open Documents</button>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
                <h3 className="h5 fw-bold">Orders</h3>
                <p className="text-secondary">
                  Create and manage purchase orders and related admin requests.
                </p>
                <button className="btn btn-outline-primary btn-sm">Open Orders</button>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
                <h3 className="h5 fw-bold">Accounts</h3>
                <p className="text-secondary">
                  View financial references, annual account documents, and records.
                </p>
                <button className="btn btn-outline-primary btn-sm">Open Accounts</button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="p-5 rounded-4 border shadow-sm text-center bg-white">
            <h2 className="fw-bold mb-3">Admin shortcuts</h2>
            <p className="text-secondary mb-4">
              Quickly go to your profile or user management.
            </p>

            <div className="d-flex justify-content-center flex-wrap gap-3">
              <Link to="/admin/profile" className="btn btn-primary btn-lg">
                My Profile
              </Link>
              <Link to="/admin/people" className="btn btn-outline-dark btn-lg">
                Manage Users
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default HomeAdmins;