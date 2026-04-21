import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-top mt-5 bg-white">
      <div className="container py-4">
        <div className="row g-4 align-items-start">
          <div className="col-md-4">
            <h5 className="fw-bold mb-3">SAMCT Villages</h5>
            <p className="text-secondary mb-0">
              South Auckland Masonic Charitable Trust providing community-focused
              retirement living and secure portal access for residents and administration.
            </p>
          </div>

          <div className="col-md-4">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-dark">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-decoration-none text-dark">
                  Login
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-decoration-none text-dark">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/" className="text-decoration-none text-dark">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-4">
            <h6 className="fw-bold mb-3">Locations</h6>
            <ul className="list-unstyled text-secondary mb-0">
              <li>Papakura</li>
              <li>Ngatea</li>
              <li>Whitianga</li>
            </ul>
          </div>
        </div>

        <hr className="my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="mb-2 mb-md-0 text-secondary">
            © 2026 SAMCT Villages. All rights reserved.
          </p>
          <p className="mb-0 text-secondary">
            Built for SAMCT portal and public website
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;