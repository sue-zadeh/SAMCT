import Navbar from './navbar'

function About() {
  return (
    <>
      <Navbar userType="public" />

      <main className="container py-5">
        <section className="samct-card p-5 text-center mb-4 shadow-sm border rounded-4 bg-white">
          <p className="text-uppercase text-primary fw-semibold mb-2">
            
          </p>
          <h1 className="fw-semibold py-3">About SAMCT Villages</h1>
          <p className="text-dark mb-1 text-start lh-lg">
           

SAMCT Villages is the online portal supporting the South Auckland Masonic Charitable Trust and South Auckland Masonic Properties Limited. The Trust is committed to providing quality retirement village communities and supporting residents through effective management, communication, and ongoing care.

This portal has been developed to improve communication between residents, Village Managers, administrators, and directors by providing a central place for important information and day-to-day operations. Residents can access village notices, documents, and maintenance services, while authorised staff can manage records, communications, and operational activities more efficiently.

SAMCT Villages also supports the management of maintenance requests, purchase orders, village documentation, and other administrative processes. By bringing these services together in one secure system, the portal helps ensure information is accurate, accessible, and easy to manage.

The portal currently supports the Ngatea and Whitianga village communities and is designed to strengthen communication, improve service delivery, and provide a reliable source of information for residents and staff alike.
          </p>
        </section>
      </main>
    </>
  )
}

export default About