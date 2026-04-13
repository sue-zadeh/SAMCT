import { Link } from "react-router-dom";

function HomeResidents() {
  return (
    <main className="container py-5">
      {/* Header */}
      <section className="mb-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <p className="text-uppercase text-primary fw-semibold mb-1">
              Resident Portal
            </p>
            <h1 className="fw-bold mb-3">Welcome to the Resident Portal</h1>
            <p className="lead mb-3">
              Log maintenance issues and access resident-related information in one place.
            </p>
            <p className="text-secondary mb-0">
              This portal is designed to help residents report issues, track submitted requests,
              and view notices or documents if these are included in the final system.
            </p>
          </div>

          <div className="col-lg-5">
            <div className="p-4 border rounded-4 shadow-sm bg-white">
              <h2 className="h5 fw-bold mb-3">Resident Access</h2>
              <ul className="mb-0 ps-3">
                <li className="mb-2">Log maintenance issues</li>
                <li className="mb-2">View submitted requests</li>
                <li className="mb-2">Check request status updates</li>
                <li>Access notices or documents if enabled</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Main Actions */}
      <section className="mb-5">
        <div className="row g-4">
          <div className="col-md-6 col-lg-4">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Log a Maintenance Issue</h3>
              <p className="text-secondary">
                Submit a maintenance request for any issue that needs attention.
              </p>
              <button className="btn btn-primary btn-sm">New Maintenance Request</button>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">My Requests</h3>
              <p className="text-secondary">
                View your previously submitted maintenance requests and track their status.
              </p>
              <button className="btn btn-outline-primary btn-sm">View My Requests</button>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Resident Notices</h3>
              <p className="text-secondary">
                View updates, notices, or shared documents if these are included for residents.
              </p>
              <button className="btn btn-outline-primary btn-sm">View Notices</button>
            </div>
          </div>
        </div>
      </section>

      {/* Maintenance Status Example */}
      <section className="mb-5">
        <div className="p-4 rounded-4 border shadow-sm bg-light">
          <h2 className="h4 fw-bold mb-4">Recent Maintenance Activity</h2>

          <div className="row g-3">
            <div className="col-md-4">
              <div className="p-3 border rounded bg-white h-100">
                <h3 className="h6 fw-bold mb-2">Leaking tap</h3>
                <p className="mb-2 text-secondary">Submitted: 02 April 2026</p>
                <span className="badge bg-warning text-dark">Pending</span>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 border rounded bg-white h-100">
                <h3 className="h6 fw-bold mb-2">Broken light</h3>
                <p className="mb-2 text-secondary">Submitted: 30 March 2026</p>
                <span className="badge bg-info text-dark">In Progress</span>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 border rounded bg-white h-100">
                <h3 className="h6 fw-bold mb-2">Door lock issue</h3>
                <p className="mb-2 text-secondary">Submitted: 25 March 2026</p>
                <span className="badge bg-success">Completed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="mb-5">
        <div className="p-4 rounded-4 border shadow-sm bg-white">
          <h2 className="h5 fw-bold mb-3">Resident Notes</h2>
          <ul className="mb-0">
            <li>The exact resident features may still change once final requirements are confirmed.</li>
            <li>Residents may later have access to documents, notices, or extra forms.</li>
            <li>Maintenance may work either as a private request flow or a more shared system, depending on client preference.</li>
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section>
        <div className="p-5 rounded-4 border shadow-sm text-center bg-white">
          <h2 className="fw-bold mb-3">Need help with a maintenance issue?</h2>
          <p className="text-secondary mb-4">
            Use the resident portal to send requests and keep track of updates.
          </p>

          <div className="d-flex justify-content-center flex-wrap gap-3">
            <button className="btn btn-primary btn-lg">Log an Issue</button>
            <Link to="/" className="btn btn-outline-dark btn-lg">
              Back to Website
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomeResidents;