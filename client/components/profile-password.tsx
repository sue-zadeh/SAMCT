import { useSession } from '../security/session'
import { API_BASE_URL } from '../security/api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../security/api'
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa'
import { PASSWORD_HELP, passwordError } from '../security/password'
import Navbar from './navbar'

type UserType = 'resident' | 'admin' | 'villageManager'

type ProfilePasswordProps = {
  userType: UserType
  backPath: string
  title: string
}

function ProfilePassword({ userType, backPath, title }: ProfilePasswordProps) {
  const navigate = useNavigate()
  const { refresh } = useSession()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSave = async () => {
    try {
      setMessage('')
      setError('')

      if (!currentPassword || !newPassword || !confirmPassword) {
        setError('Please fill all password fields.')
        return
      }

      if (newPassword !== confirmPassword) {
        setError('New password and confirm password do not match.')
        return
      }

      const userName = localStorage.getItem('username') || ''
      if (!userName) {
        setError('Username not found.')
        return
      }
      // Check the new password before submitting
      const validationError = passwordError(newPassword)

      if (validationError) {
        setError(validationError)
        return
      }

      const response = await axios.put(`${API_BASE_URL}/api/users/password`, {
        userName,
        currentPassword,
        newPassword,
      })

      await refresh()
      navigate('/login')
      setMessage(response.data.message || 'Password updated successfully.')

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to update password.')
    }
  }

  return (
    <>
      <Navbar userType={userType} />

      <main className="container py-5">
        <div className="p-4 border rounded-4 shadow-sm bg-white">
          <h1 className="fw-bold mb-4">{title}</h1>

          {message && (
            <div role="status" className="alert alert-success">
              {message}
            </div>
          )}
          {error && (
            <div role="alert" className="alert alert-danger">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <FaLock className="me-2" />
              Current Password
            </label>
            <div className="input-group">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                className="form-control"
                aria-label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <FaLock className="me-2" />
              New Password
            </label>
            <div className="input-group">
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="form-control"
                aria-label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="form-text">{PASSWORD_HELP}</p>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <FaLock className="me-2" />
              Confirm New Password
            </label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control"
                aria-label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-primary" onClick={handleSave}>
              Save Password
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate(backPath)}
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

export default ProfilePassword
