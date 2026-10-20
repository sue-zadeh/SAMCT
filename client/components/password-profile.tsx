
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa'
import { useSession } from '../security/session'
import api, { API_BASE_URL } from '../security/api'
import { PASSWORD_HELP, passwordError } from '../security/password'
import Navbar from './navbar'

type UserType = 'resident' | 'admin' | 'villageManager'

type ProfilePasswordProps = {
  userType: UserType
  backPath: string
  title: string
}

function ProfilePassword({
  userType,
  backPath,
  title,
}: ProfilePasswordProps) {
  const navigate = useNavigate()
  const { refresh } = useSession()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSave = async () => {
    if (saving) return

    setMessage('')
    setError('')

    // All three fields are required
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill all password fields.')
      return
    }

    // Check both new passwords match
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    // Check the 8-character password policy
    const validationError = passwordError(newPassword)

    if (validationError) {
      setError(validationError)
      return
    }

    const userName = localStorage.getItem('username') || ''

    if (!userName) {
      setError('Username not found.')
      return
    }

    setSaving(true)

    try {
      // Send the request to the ASP.NET Core API
      const response = await api.put(
        `${API_BASE_URL}/api/users/password`,
        {
          userName,
          currentPassword,
          newPassword,
        },
      )

      setMessage(
        response.data.message || 'Password updated successfully.',
      )

      // Clear the password fields
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Password changes invalidate existing sessions
      await refresh()
      navigate('/login', { replace: true })

    } catch (err: any) {
      setError(
        err?.response?.data?.errors?.NewPassword?.[0] ||
        err?.response?.data?.message ||
        'Failed to update password.',
      )
    } finally {
      setSaving(false)
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

          {/* 1. Current Password */}
          <div className="mb-3">
            <label
              htmlFor="current-password"
              className="form-label fw-semibold"
            >
              <FaLock className="me-2" />
              Current Password
            </label>

            <div className="input-group">
              <input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                className="form-control"
                value={currentPassword}
                autoComplete="current-password"
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setShowCurrentPassword(!showCurrentPassword)
                }
                aria-label={
                  showCurrentPassword ? 'Hide password' : 'Show password'
                }
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* 2. New Password */}
          <div className="mb-3">
            <label
              htmlFor="new-password"
              className="form-label fw-semibold"
            >
              <FaLock className="me-2" />
              New Password
            </label>

            <div className="input-group">
              <input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                className="form-control"
                value={newPassword}
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                aria-describedby="new-password-help"
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setShowNewPassword(!showNewPassword)
                }
                aria-label={
                  showNewPassword ? 'Hide password' : 'Show password'
                }
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Password guidance BELOW the input-group */}
            <p
              id="new-password-help"
              className="form-text mt-1 mb-0"
            >
              {PASSWORD_HELP}
            </p>
          </div>

          {/* 3. Confirm New Password */}
          <div className="mb-3">
            <label
              htmlFor="confirm-new-password"
              className="form-label fw-semibold"
            >
              <FaLock className="me-2" />
              Confirm New Password
            </label>

            <div className="input-group">
              <input
                id="confirm-new-password"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control"
                value={confirmPassword}
                autoComplete="new-password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Save and Cancel */}
          <div className="mt-4 d-flex gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Password'}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate(backPath)}
              disabled={saving}
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
