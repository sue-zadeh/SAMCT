import { useState } from 'react'
import axios from 'axios'
import Navbar from './navbar'

function ForgotPassword() {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5072'
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSendLink = async () => {
    try {
      setMessage('')
      setError('')

      if (!email) {
        setError('Please enter your email.')
        return
      }

      const response = await axios.post(`${API_BASE_URL}/api/forgot-password`, {
        email,
      })

      setMessage(response.data.message || 'Reset link sent.')
      setEmail('')
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to send reset link.')
    }
  }

  return (
    <>
      <Navbar userType="public" />

      <main className="container py-5">
        <div
          className="mx-auto p-4 border rounded-4 shadow-sm bg-white"
          style={{ maxWidth: '450px' }}
        >
          <h1 className="text-center fw-bold mb-4">Forgot Password</h1>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <button className="btn btn-primary w-100" onClick={handleSendLink}>
            Send Reset Link
          </button>
        </div>
      </main>
    </>
  )
}

export default ForgotPassword
