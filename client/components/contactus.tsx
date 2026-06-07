import { useEffect, useState } from 'react'
import Navbar from './navbar'
import { MdSettingsPhone } from 'react-icons/md'

function ContactUs() {
  const API_BASE_URL = 'http://localhost:5072'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [phone, setPhone] = useState('')
  const [messageText, setMessageText] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)

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
        <section className="mb-4 contact-hero">
          <div className="p-5 border rounded-4 shadow-sm bg-white text-center">
            <p className="text-uppercase text-primary fw-semibold mb-2">
              Contact SAMCT
            </p>
            <h1 className="fw-bold mb-3">GET IN TOUCH</h1>
            <h5 className="text-secondary mb-0">
              Ask about village information, availability, or general support.
            </h5>
          </div>
        </section>

        {(success || error) && (
          <div
            className={`alert text-center ${
              success ? 'alert-success' : 'alert-danger'
            }`}
          >
            {success || error}
          </div>
        )}

        <section className="row justify-content-center">
          <div className="col-lg-8">
            <div className="p-4 p-md-5 border rounded-4 shadow-sm bg-white contact-card">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      className="form-control"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Subject</label>
                    <input
                      className="form-control"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="What is this about?"
                    />
                  </div>

                   <div className="col-md-6">
                    <label className="form-label fw-semibold">Phone</label>
                    <input
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="col-12">
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

                <div className="text-center mt-4">
                  <button
                    className="btn btn-primary px-5"
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
