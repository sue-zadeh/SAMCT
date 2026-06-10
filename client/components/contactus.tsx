import { useEffect, useState } from 'react'
import Navbar from './navbar'
import { Link } from 'react-router-dom'
import AOS from 'aos'

function ContactUs() {
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5072";
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [phone, setPhone] = useState('')
  const [messageText, setMessageText] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: 'ease-out-cubic',
    })
  }, [])

  useEffect(() => {
    if (!success && !error) return

    const timer = setTimeout(() => {
      setSuccess('')
      setError('')
    }, 50000)

    return () => clearTimeout(timer)
  }, [success, error])

  const isEmailValid = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const isPhoneValid = (value: string) => {
    return /^[0-9+\s()-]{7,20}$/.test(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess('')
    setError('')

    if (
      !fullName.trim() ||
      !email.trim() ||
      !subject.trim() ||
      !phone.trim() ||
      !messageText.trim()
    ) {
      setError('Please complete all fields.')
      return
    }

    if (!isEmailValid(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!isPhoneValid(phone)) {
      setError('Please enter a valid phone number.')
      return
    }

    try {
      setIsSending(true)

      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          subject,
          phone,
          message: messageText,
        }),
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message.')
      }

      setSuccess('Your message has been sent successfully.')
      setFullName('')
      setEmail('')
      setSubject('')
      setPhone('')
      setMessageText('')
    } catch (err: any) {
      setError(err.message || 'Failed to send message.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <Navbar userType="public" />

      <main className="container py-5">
        <section className="mb-4 samct-hero" data-aos="fade-down">
          <div className="p-5 border rounded-4 shadow-sm text-center">
            <p className="text-uppercase text-info fw-semibold mb-2">
              Contact SAMCT
            </p>
            <h1 className="fw-bold mb-3">GET IN TOUCH</h1>
            <p className="text-secondary fs-5 mb-0">
              Ask about village living, availability, documents, or general
              support. We will get back to you as soon as possible.
            </p>
          </div>
        </section>

        <section className="row g-4 mb-4">
          <div className="col-md-4" data-aos="fade-right">
            <Link to="/about" className="text-decoration-none text-dark">
              <div className="p-4 samct-card h-100 border rounded-4 shadow-sm bg-white">
                <h5 className="fw-bold">Village Information</h5>
                <p className="text-secondary mb-0">
                  Learn more about Papakura, Ngatea, and Whitianga village
                  options.
                </p>
              </div>
            </Link>
          </div>

          <div className="col-md-4" data-aos="zoom-in">
            <Link to="/marketing" className="text-decoration-none text-dark">
              <div className="p-4 samct-card h-100">
                <h5 className="fw-bold">Marketing</h5>
                <p className="text-secondary mb-0">
                  Send an enquiry about current or future retirement living
                  availability.
                </p>
              </div>
            </Link>
          </div>

          <div className="col-md-4" data-aos="fade-left">
            <div className="p-4 samct-card h-100 border rounded-4 shadow-sm bg-white">
              <h5 className="fw-bold">Resident Support</h5>
              <p className="text-secondary mb-0">
                Contact SAMCT for general questions, documents, or support.
              </p>
            </div>
          </div>
        </section>

        {(success || error) && (
          <div
            className={`alert text-center ${
              success ? 'alert-success' : 'alert-danger'
            }`}
            data-aos="fade-down"
          >
            {success || error}
          </div>
        )}

        <section className="row justify-content-center">
          <div className="col-lg-8">
            <div
              className="p-4 p-md-5 border rounded-4 shadow-sm bg-white contact-card"
              data-aos="fade-up"
            >
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6" data-aos="fade-right">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      className="form-control"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="col-md-6" data-aos="fade-left">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="col-md-6" data-aos="fade-right">
                    <label className="form-label fw-semibold">Subject</label>
                    <input
                      className="form-control"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="What is this about?"
                    />
                  </div>

                  <div className="col-md-6" data-aos="fade-left">
                    <label className="form-label fw-semibold">Phone</label>
                    <input
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="col-12" data-aos="fade-up">
                    <label className="form-label fw-semibold">Message</label>
                    <textarea
                      className="form-control"
                      rows={6}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Write your message clearly..."
                    />
                  </div>
                </div>

                <div className="text-center mt-4" data-aos="zoom-in">
                  <button
                    className="btn btn-primary px-5 samct-button"
                    type="submit"
                    disabled={isSending}
                  >
                    {isSending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default ContactUs