import { Link } from "react-router-dom";
import Navbar from "./navbar";

function HomeAdmins() {
  const fullName = localStorage.getItem("fullname") || "Graeme Norton";
  const firstName = localStorage.getItem("firstname") || "Graeme";
  const profileImageUrl =
    localStorage.getItem("profileImageUrl") || "https://via.placeholder.com/80";

  return (
    <>
      <Navbar userType="admin" />
    <main className="container py-5">
      <section className="mb-5">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4 p-4 border rounded-4 shadow-sm bg-white">
          <div className="d-flex align-items-center gap-3">
            <img
              src={profileImageUrl}
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
              <p className="text-secondary mb-0">{fullName}</p>
            </div>
          </div>

          <div>
            <h2 className="h4 fw-bold mb-2">Admin Dashboard</h2>
            <p className="text-secondary mb-0">
              Manage records, documents, maintenance, property data, and public website content.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-primary">Upload Document</button>
            <button className="btn btn-outline-dark">Create Record</button>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h2 className="h5 fw-bold">Company Secretary</h2>
              <p className="text-secondary mb-0">
                Manage overall portal content, records, documents, and key operational information.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h2 className="h5 fw-bold">Finance Administrator</h2>
              <p className="text-secondary mb-0">
                Manage annual accounts, purchase orders, financial records, and related documents.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h2 className="h5 fw-bold">Village Managers</h2>
              <p className="text-secondary mb-0">
                Manage village-related data, maintenance items, resident records, and local updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <div className="row g-4">
          <div className="col-md-6 col-lg-4">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Documents</h3>
              <p className="text-secondary">
                Upload, edit, delete, and organise forms, disclosures, and operational files.
              </p>
              <button className="btn btn-outline-primary btn-sm">Manage Documents</button>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Property Records</h3>
              <p className="text-secondary">
                Manage structured property-related forms, records, and repository data.
              </p>
              <button className="btn btn-outline-primary btn-sm">Manage Records</button>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Maintenance Logs</h3>
              <p className="text-secondary">
                Review maintenance requests submitted by residents and track updates.
              </p>
              <button className="btn btn-outline-primary btn-sm">View Maintenance</button>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Purchase Orders</h3>
              <p className="text-secondary">
                Create and manage purchase orders and related operational requests.
              </p>
              <button className="btn btn-outline-primary btn-sm">Manage Orders</button>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Annual Accounts</h3>
              <p className="text-secondary">
                Store and manage annual account documents and financial references.
              </p>
              <button className="btn btn-outline-primary btn-sm">View Accounts</button>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Public Website Content</h3>
              <p className="text-secondary">
                Update public-facing page content such as availability, marketing, and contact information.
              </p>
              <button className="btn btn-outline-primary btn-sm">Edit Website Content</button>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <div className="p-4 rounded-4 border shadow-sm bg-light">
          <h2 className="h4 fw-bold mb-3">Admin Notes</h2>
          <ul className="mb-0">
            <li>Admin access levels may still be refined based on final client confirmation.</li>
            <li>Village Managers may later be restricted to their own village only.</li>
            <li>Finance-related sections may later be visible only to finance roles.</li>
          </ul>
        </div>
      </section>

      <section>
        <div className="p-5 rounded-4 border shadow-sm text-center bg-white">
          <h2 className="fw-bold mb-3">Need to update website content?</h2>
          <p className="text-secondary mb-4">
            Manage public pages, uploaded files, and operational records from the admin portal.
          </p>

          <div className="d-flex justify-content-center flex-wrap gap-3">
            <button className="btn btn-primary btn-lg">Open Admin Tools</button>
            <Link to="/" className="btn btn-outline-dark btn-lg">
              Back to Website
            </Link>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}

export default HomeAdmins;