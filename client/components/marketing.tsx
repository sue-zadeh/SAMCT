import { useEffect } from 'react'
import Navbar from './navbar'
import { Link } from 'react-router-dom'
import AOS from 'aos'

function Marketing() {
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

      <main className="container py-5">
        <section className="samct-card p-5 text-center mb-4" data-aos="fade-down">
          <p className="text-uppercase text-primary fw-semibold mb-2">
            SAMCT Villages
          </p>
          <h1 className="fw-bold mb-3">
            Safe, supportive village living in South Auckland and beyond
          </h1>
          <p className="text-secondary fs-5 mb-4">
            Community-focused retirement living with village information,
            support, notices, and easy contact access.
          </p>

          <Link to="/contactUs" className="btn btn-primary px-5 samct-button">
            Contact SAMCT
          </Link>
        </section>

        <section className="row g-4">
          <div className="col-md-4" data-aos="fade-right">
            <div className="p-4 samct-card h-100">
              <h5 className="fw-bold">Community Living</h5>
              <p className="text-secondary mb-0">
                Friendly village communities with information and support for
                residents.
              </p>
            </div>
          </div>

          <div className="col-md-4" data-aos="zoom-in">
            <div className="p-4 samct-card h-100">
              <h5 className="fw-bold">Village Locations</h5>
              <p className="text-secondary mb-0">
                Papakura, Ngatea, and Whitianga village information in one
                simple portal.
              </p>
            </div>
          </div>

          <div className="col-md-4" data-aos="fade-left">
            <div className="p-4 samct-card h-100">
              <h5 className="fw-bold">Resident Support</h5>
              <p className="text-secondary mb-0">
                Residents can view notices, submit maintenance, and stay updated.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default Marketing