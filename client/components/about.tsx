import Navbar from './navbar'

function About() {
  return (
    <>
      <Navbar userType="public" />

      <main className="container py-5">
        <section className="samct-card p-5 text-center mb-4 shadow-sm border rounded-4 bg-white">
          <p className="text-uppercase text-primary fw-semibold mb-2">
            About SAMCT
          </p>
          <h1 className="fw-bold">Coming soon</h1>
          <p className="text-secondary mb-0">
            More information about SAMCT Villages will be added here.
          </p>
        </section>
      </main>
    </>
  )
}

export default About