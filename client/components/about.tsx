import { Link } from 'react-router-dom'
import Navbar from './navbar'
import Seo from './seo'

const portalFeatures = [
  {
    title: 'Clear communication',
    text: 'A central place for authorised residents and staff to find notices and village documents.',
  },
  {
    title: 'Resident support',
    text: 'Residents can submit maintenance requests and follow the response from their village team.',
  },
  {
    title: 'Responsible administration',
    text: 'Role-based tools support property records, purchase orders, documents and operational work.',
  },
]

function About() {
  return (
    <>
      <Seo
        title="About SAMCT Villages"
        description="Learn how the SAMCT Villages portal supports retirement village communication, resident services and authorised administration."
        path="/about"
      />
      <Navbar userType="public" />

      <main>
        <section className="about-hero py-5">
          <div className="container py-lg-5">
            <div className="row align-items-center g-5">
              <div className="col-lg-7">
                <p className="eyebrow">About SAMCT Villages</p>
                <h1 className="display-5 fw-bold mb-4">
                  Community information and services in one trusted place
                </h1>
                <p className="lead text-secondary mb-0">
                  The SAMCT Villages portal supports the South Auckland Masonic
                  Charitable Trust and South Auckland Masonic Properties Limited,
                  helping residents and authorised staff work with clear, current
                  information.
                </p>
              </div>
              <div className="col-lg-5">
                <div className="trust-panel">
                  <p className="small text-uppercase fw-bold text-primary mb-3">
                    Portal principles
                  </p>
                  <ul className="list-unstyled mb-0 d-grid gap-3">
                    <li>Useful information for real village needs</li>
                    <li>Access based on each person’s role and village</li>
                    <li>Clear ownership of records and actions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-5">
          <div className="row g-4">
            {portalFeatures.map((feature) => (
              <div className="col-md-4" key={feature.title}>
                <article className="samct-card h-100 p-4">
                  <h2 className="h4 fw-bold">{feature.title}</h2>
                  <p className="text-secondary mb-0">{feature.text}</p>
                </article>
              </div>
            ))}
          </div>
        </section>

        <section className="container pb-5">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="bg-white border rounded-4 p-4 p-lg-5 shadow-sm">
                <h2 className="fw-bold mb-3">Designed around village work</h2>
                <p className="text-secondary">
                  The portal currently supports the Ngatea and Whitianga village
                  communities. Residents can access notices, documents and
                  maintenance services. Authorised staff can manage the operational
                  records needed for their role.
                </p>
                <p className="text-secondary mb-4">
                  Public pages provide general village information. Private resident
                  and operational data stays behind authenticated, role-based access.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <Link to="/marketing" className="btn btn-primary">
                    Explore village information
                  </Link>
                  <Link to="/contactUs" className="btn btn-outline-primary">
                    Contact SAMCT
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default About
