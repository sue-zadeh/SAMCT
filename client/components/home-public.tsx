import { Link } from "react-router-dom";
import Navbar from "./navbar";
import { useEffect } from 'react'
import AOS from 'aos'

function HomePublic() {
  useEffect(() => {
  AOS.init({
    duration: 900,
    once: true,
    easing: 'ease-out-cubic',
  })
}, [])
  return (
    <>
      <Navbar userType="public" />
      
    <main>
      {/* Hero Section */}
      <section className="container py-5">
        <div className="row align-items-center g-5">
     
          <div className="col-lg-6" data-aos="fade-down">
            <p className="text-uppercase text-primary fw-semibold mb-2">
              Affordable retirement living
            </p>

            <h1 className="display-4 fw-bold mb-3">
              South Auckland Masonic Charitable Trust
            </h1>

            <p className="lead mb-3">
              Community-focused retirement living with village locations in
              Ngatea, and Whitianga.
            </p>

            <p className="mb-4 text-secondary">
              SAMCT supports affordable housing for retired people, along with
              resident maintenance support, public availability information, and
              secure portal access for administration and village management.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <Link to="/marketing" className="btn btn-primary btn-lg">
                View Marketing
              </Link>

              <Link to="/contactUs" className="btn btn-outline-dark btn-lg">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="col-lg-6" data-aos="fade-left">
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
            <div className="p-4 rounded-4 border shadow-sm h-100 bg-white" data-aos="fade-right">
              <h3 className="h5 fw-bold">Affordable Living</h3>
              <p className="mb-0 text-secondary">
                Supportive housing focused on retired residents and community life.
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="p-4 rounded-4 border shadow-sm h-100 bg-white" data-aos="fade-right">
              <h3 className="h5 fw-bold">Village Locations</h3>
              <p className="mb-0 text-secondary">
                Operating villages across Ngatea, and Whitianga.
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="p-4 rounded-4 border shadow-sm h-100 bg-white" data-aos="fade-left">
              <h3 className="h5 fw-bold">Resident Support</h3>
              <p className="mb-0 text-secondary">
                Easy reporting of maintenance issues through the resident portal.
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="p-4 rounded-4 border shadow-sm h-100 bg-white" data-aos="fade-left">
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
    <h2 className="fw-bold" data-aos="fade-down">
      Our Village Locations
    </h2>
    <p className="text-secondary mb-0">
      Information and availability across our current locations.
    </p>
  </div>

  <div className="row g-4">
    <div className="col-md-6">
      <div className="p-4 rounded-4 border shadow-sm h-100 bg-white" data-aos="fade-up">
        <h3 className="h4 fw-bold">Ngatea</h3>
        <p className="text-secondary">
          Explore housing details and learn more about this village location.
        </p>
        <Link to="/marketing" className="text-decoration-none fw-semibold">
          View more
        </Link>
      </div>
    </div>

    <div className="col-md-6">
      <div className="p-4 rounded-4 border shadow-sm h-100 bg-white" data-aos="fade-left">
        <h3 className="h4 fw-bold">Whitianga</h3>
        <p className="text-secondary">
          View location details, housing information, and current availability.
        </p>
        <Link to="/marketing" className="text-decoration-none fw-semibold">
          View more
        </Link>
      </div>
    </div>
  </div>
</section>
      {/* CTA */}
      <section className="container py-5">
        <div className="p-5 rounded-4 border shadow-sm text-center bg-white">
          <h2 className="fw-bold mb-3">Need more information?</h2>
          <p className="text-secondary mb-4">
            Get in touch for general enquiries, marketing information, or
            current availability details.
          </p>

          <div className="d-flex justify-content-center flex-wrap gap-3">
            <Link to="/contactUs" className="btn btn-primary btn-lg">
              Contact SAMCT
            </Link>

            <Link to="/marketing" className="btn btn-outline-dark btn-lg">
              View Marketing
            </Link>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}

export default HomePublic;