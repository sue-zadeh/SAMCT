import { Link } from "react-router-dom";

function HomePublic() {
  return (
    <main>
      {/* Hero Section */}
      <section className="container py-5">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className="display-5 fw-bold mb-3">
              South Auckland Masonic Charitable Trust
            </h1>

            <p className="lead mb-3">
              A public website and secure portal for residents, village managers,
              and administration.
            </p>

            <p className="mb-4">
              This platform is designed to support property-related records,
              resident maintenance requests, key documents, and public information
              such as marketing and availability.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <Link to="/availability" className="btn btn-primary">
                View Availability
              </Link>

              <Link to="/contact" className="btn btn-outline-secondary">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="col-lg-6 mt-4 mt-lg-0">
            <div className="p-4 border rounded bg-light">
              <h2 className="h4 mb-3">What this website includes</h2>

              <ul className="mb-0">
                <li>Public information about SAMCT and its villages</li>
                <li>Marketing and availability content for the wider public</li>
                <li>Resident access to log maintenance issues</li>
                <li>Secure portal access for admin roles</li>
                <li>Structured records and document management</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* User Areas Section */}
      {/* <section className="container py-5">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="h-100 p-4 border rounded">
              <h2 className="h4 mb-3">Public Access</h2>
              <p>
                Visitors can view general information, marketing details,
                availability, and contact or enquiry options.
              </p>
              <Link to="/about" className="text-decoration-none">
                Learn more
              </Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="h-100 p-4 border rounded">
              <h2 className="h4 mb-3">Residents</h2>
              <p>
                Residents will be able to access the portal to log maintenance
                issues and view any resident-related notices or documents if
                required.
              </p>
              <Link to="/resident/login" className="text-decoration-none">
                Resident Login
              </Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="h-100 p-4 border rounded">
              <h2 className="h4 mb-3">Admin Portal</h2>
              <p>
                Admin users such as Company Secretary, Finance Administrator,
                and Village Managers will have secure access to manage records,
                documents, and content.
              </p>
              <Link to="/admin/login" className="text-decoration-none">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </section> */}

      {/* Main Features Section */}
      {/* <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Main Features</h2>
          <p className="text-muted mb-0">
            Based on the current project requirements
          </p>
        </div>

        <div className="row g-4"> */}
          {/* <div className="col-md-6 col-lg-3">
            <div className="p-4 border rounded h-100">
              <h3 className="h5">Document Storage</h3>
              <p className="mb-0">
                Store and manage key forms, disclosures, and operational
                documents.
              </p>
            </div>
          </div> */}

          {/* <div className="col-md-6 col-lg-3 ">
            <div className="p-4 border rounded h-100 justify-content-center">
              <h3 className="h5">Maintenance Requests</h3>
              <p className="mb-0">
                Residents can submit maintenance issues through the portal.
              </p>
            </div>
          </div> */}

          {/* <div className="col-md-6 col-lg-3">
            <div className="p-4 border rounded h-100">
              <h3 className="h5">Property Records</h3>
              <p className="mb-0">
                Structured forms and records to support property-related data.
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="p-4 border rounded h-100">
              <h3 className="h5">Role-Based Access</h3>
              <p className="mb-0">
                Different portal areas for residents and admin users.
              </p>
            </div>
          </div> */}
        {/* </div>
      </section> */}

      {/* CTA Section */}
      <section className="container py-5">
        <div className="p-5 rounded bg-light text-center border">
          <h2 className="fw-bold mb-3">Need more information?</h2>
          <p className="mb-4">
            Get in touch for general enquiries, marketing information, or
            availability details.
          </p>
          <Link to="/contact" className="btn btn-primary">
            Contact SAMCT
          </Link>
        </div>
      </section>
    </main>
  );
}

export default HomePublic;