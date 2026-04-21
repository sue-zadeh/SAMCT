import { Link } from "react-router-dom";
import Navbar from "./navbar";

function HomePublic() {
  return (
    <>
      <Navbar userType="public" />
      
    <main>
      {/* Hero Section */}
      <section className="container py-5">
        <div className="row align-items-center g-5">
     
          <div className="col-lg-6">
            <p className="text-uppercase text-primary fw-semibold mb-2">
              Affordable retirement living
            </p>

            <h1 className="display-4 fw-bold mb-3">
              South Auckland Masonic Charitable Trust
            </h1>

            <p className="lead mb-3">
              Community-focused retirement living with village locations in
              Papakura, Ngatea, and Whitianga.
            </p>

            <p className="mb-4 text-secondary">
              SAMCT supports affordable housing for retired people, along with
              resident maintenance support, public availability information, and
              secure portal access for administration and village management.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <Link to="/availability" className="btn btn-primary btn-lg">
                View Availability
              </Link>

              <Link to="/contact" className="btn btn-outline-dark btn-lg">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="p-4 border rounded-4 shadow-sm bg-white">
              <h2 className="h3 fw-bold mb-3">What this website includes</h2>

              <ul className="mb-0 ps-3">
                <li className="mb-2">
                  Public information about SAMCT and its villages
                </li>
                <li className="mb-2">
                  Marketing and availability details for the wider public
                </li>
                <li className="mb-2">
                  Resident access to log maintenance issues
                </li>
                <li className="mb-2">
                  Secure portal access for admin roles
                </li>
                <li>
                  Structured records and document management
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Highlights */}
      <section className="container pb-5">
        <div className="row g-4">
          <div className="col-md-6 col-lg-3">
            <div className="p-4 rounded-4 border shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Affordable Living</h3>
              <p className="mb-0 text-secondary">
                Supportive housing focused on retired residents and community life.
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="p-4 rounded-4 border shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Village Locations</h3>
              <p className="mb-0 text-secondary">
                Operating villages across Papakura, Ngatea, and Whitianga.
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="p-4 rounded-4 border shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Resident Support</h3>
              <p className="mb-0 text-secondary">
                Easy reporting of maintenance issues through the resident portal.
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="p-4 rounded-4 border shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Secure Admin Access</h3>
              <p className="mb-0 text-secondary">
                Portal access for Secretary, Finance, and Village Managers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Villages Section */}
      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Our Village Locations</h2>
          <p className="text-secondary mb-0">
            Information and availability across our current locations
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="p-4 rounded-4 border shadow-sm h-100 bg-white">
              <h3 className="h4 fw-bold">Papakura</h3>
              <p className="text-secondary">
                Retirement village information, general details, and local availability.
              </p>
              <Link to="/availability" className="text-decoration-none fw-semibold">
                View more
              </Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 rounded-4 border shadow-sm h-100 bg-white">
              <h3 className="h4 fw-bold">Ngatea</h3>
              <p className="text-secondary">
                Explore housing details and learn more about this village location.
              </p>
              <Link to="/availability" className="text-decoration-none fw-semibold">
                View more
              </Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 rounded-4 border shadow-sm h-100 bg-white">
              <h3 className="h4 fw-bold">Whitianga</h3>
              <p className="text-secondary">
                View location details, housing information, and current availability.
              </p>
              <Link to="/availability" className="text-decoration-none fw-semibold">
                View more
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* User Areas */}
      {/* <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Portal Access</h2>
          <p className="text-secondary mb-0">
            Different areas for public visitors, residents, and administration
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="h-100 p-4 border rounded-4 shadow-sm bg-white">
              <h3 className="h4 fw-bold mb-3">Public Access</h3>
              <p className="text-secondary">
                View general information, marketing details, village availability,
                and enquiry options.
              </p>
              <Link to="/about" className="btn btn-outline-dark mt-2">
                Learn More
              </Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="h-100 p-4 border rounded-4 shadow-sm bg-white">
              <h3 className="h4 fw-bold mb-3">Residents</h3>
              <p className="text-secondary">
                Access the portal to log maintenance issues and view resident-related
                notices or documents when available.
              </p>
              <Link to="/resident" className="btn btn-outline-dark mt-2">
                Resident Portal
              </Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="h-100 p-4 border rounded-4 shadow-sm bg-white">
              <h3 className="h4 fw-bold mb-3">Admin Portal</h3>
              <p className="text-secondary">
                Secure access for Company Secretary, Finance Administrator, and
                Village Managers to manage content, files, and records.
              </p>
              <Link to="/admin" className="btn btn-outline-dark mt-2">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      {/* <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Main Features</h2>
          <p className="text-secondary mb-0">
            Based on the current project requirements
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-6 col-lg-3">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Document Storage</h3>
              <p className="mb-0 text-secondary">
                Store key forms, disclosures, and operational documents in one place.
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Maintenance Requests</h3>
              <p className="mb-0 text-secondary">
                Residents can submit issues and administration can manage follow-up.
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Property Records</h3>
              <p className="mb-0 text-secondary">
                Structured forms and records to support property-related data.
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="p-4 border rounded-4 shadow-sm h-100 bg-white">
              <h3 className="h5 fw-bold">Role-Based Access</h3>
              <p className="mb-0 text-secondary">
                Separate areas and permissions for residents and admin users.
              </p>
            </div>
          </div>
        </div>
      </section> */} 

      {/* CTA */}
      <section className="container py-5">
        <div className="p-5 rounded-4 border shadow-sm text-center bg-white">
          <h2 className="fw-bold mb-3">Need more information?</h2>
          <p className="text-secondary mb-4">
            Get in touch for general enquiries, marketing information, or
            current availability details.
          </p>

          <div className="d-flex justify-content-center flex-wrap gap-3">
            <Link to="/contact" className="btn btn-primary btn-lg">
              Contact SAMCT
            </Link>

            <Link to="/availability" className="btn btn-outline-dark btn-lg">
              View Availability
            </Link>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}

export default HomePublic;