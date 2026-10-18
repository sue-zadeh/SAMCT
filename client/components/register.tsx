
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import api, { API_BASE_URL } from '../security/api'
import { adminRoles, useSession } from '../security/session'
import { PASSWORD_HELP, passwordError } from '../security/password'
import Navbar from './navbar'

type RegisterForm = {
  userName: string
  firstName: string
  lastName: string
  email: string
  role: string
  village: string
  password: string
  confirmPassword: string
}

const emptyForm: RegisterForm = {
  userName: '',
  firstName: '',
  lastName: '',
  email: '',
  role: 'Resident',
  village: 'Ngatea',
  password: '',
  confirmPassword: '',
}

export default function Register() {
  const { user, loading: sessionLoading } = useSession()

  // Check the logged-in user's role
  const administrator = !!user && adminRoles.includes(user.role)
  const manager = user?.role === 'VillageManager'

  // Store form values
  const [form, setForm] = useState<RegisterForm>({ ...emptyForm })

  // Store the selected profile image
  const [image, setImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form messages
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Village Managers can register residents
  // only in their own village
  useEffect(() => {
    if (manager && user) {
      setForm((current) => ({
        ...current,
        village: user.village,
        role: 'Resident',
      }))
    }
  }, [user?.village, manager])

  // Update the input value when the user types
  const change = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  // Submit the registration form
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setMessage('')
    setFailed(false)

    // Check password confirmation
    if (form.password !== form.confirmPassword) {
      setFailed(true)
      setMessage('Passwords do not match.')
      return
    }

    // Check minimum length and character types
    const validationError = passwordError(form.password)

    if (validationError) {
      setFailed(true)
      setMessage(validationError)
      return
    }

    // Check image size: maximum 2 MB
    if (image && image.size > 2 * 1024 * 1024) {
      setFailed(true)
      setMessage('Profile image must be 2 MB or smaller.')
      return
    }

    setSubmitting(true)

    try {
      // FormData supports text and file uploads
      const data = new FormData()

      // Add all fields except confirmPassword
      for (const [key, value] of Object.entries(form)) {
        if (key !== 'confirmPassword') {
          data.append(key, value)
        }
      }

      // Add the profile image if one was selected
      if (image) {
        data.append('profileImage', image)
      }

      // Send the form to the ASP.NET Core REST API
      const response = await api.post(
        `${API_BASE_URL}/api/register`,
        data,
      )

      // Show the success message
      setMessage(response.data.message || 'User registered successfully.')

      // Clear the form
      setForm({
        ...emptyForm,
        village: manager && user ? user.village : 'Ngatea',
      })

      setImage(null)

      // Clear the selected file from the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error: any) {
      // Show an error if registration fails
      setFailed(true)

      const responseData = error.response?.data

      // Show a validation error if the API supplied one
      const fieldErrors = responseData?.errors
      const firstFieldError = fieldErrors
        ? Object.values(fieldErrors).flat()[0]
        : undefined

      setMessage(
        typeof firstFieldError === 'string'
          ? firstFieldError
          : responseData?.message ||
              error.message ||
              'Registration failed. Please try again.',
      )
    } finally {
      // Allow another submission
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar
        userType={
          administrator
            ? 'admin'
            : manager
              ? 'villageManager'
              : 'public'
        }
      />

      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 p-4 border rounded-4 shadow-sm bg-white">

            <h1 className="mb-4">Register User</h1>

            {!administrator && !manager && (
              <p>
                Your village manager or administrator must approve
                your account before you can log in.
              </p>
            )}

            {/* Success or error message */}
            {message && (
              <div
                role="alert"
                className={`alert ${
                  failed ? 'alert-danger' : 'alert-success'
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={submit}>

              {/* Username, First Name, Last Name, Email */}
              {(
                ['userName', 'firstName', 'lastName', 'email'] as const
              ).map((name) => (
                <div className="mb-3" key={name}>
                  <label className="form-label" htmlFor={name}>
                    {{
                      userName: 'Username',
                      firstName: 'First Name',
                      lastName: 'Last Name',
                      email: 'Email',
                    }[name]}
                  </label>

                  <input
                    id={name}
                    name={name}
                    className="form-control"
                    type={name === 'email' ? 'email' : 'text'}
                    value={form[name]}
                    onChange={change}
                    required
                    minLength={name === 'userName' ? 5 : undefined}
                    maxLength={
                      name === 'email'
                        ? 254
                        : name === 'userName'
                          ? 50
                          : 80
                    }
                    pattern={
                      name === 'userName'
                        ? '[A-Za-z0-9_.-]+'
                        : undefined
                    }
                    autoComplete={
                      name === 'userName'
                        ? 'username'
                        : name === 'email'
                          ? 'email'
                          : name === 'firstName'
                            ? 'given-name'
                            : 'family-name'
                    }
                  />
                </div>
              ))}

              <p className="small text-secondary">
                Usernames are not case-sensitive. Use 5 to 50
                letters, numbers, dots, underscores or hyphens.
              </p>

              {/* Only Admin can select the user's role */}
              {administrator && (
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>

                  <select
                    id="role"
                    name="role"
                    className="form-select"
                    value={form.role}
                    onChange={change}
                  >
                    {[
                      'Resident',
                      'VillageManager',
                      ...adminRoles,
                    ].map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Village selection */}
              <div className="mb-3">
                <label htmlFor="village" className="form-label">
                  Village
                </label>

                <select
                  id="village"
                  name="village"
                  className="form-select"
                  value={form.village}
                  onChange={change}
                  disabled={manager}
                >
                  <option value="Ngatea">Ngatea</option>
                  <option value="Whitianga">Whitianga</option>
                </select>
              </div>

              {/* Optional profile image */}
              <div className="mb-3">
                <label
                  htmlFor="profileImage"
                  className="form-label"
                >
                  Profile Image (PNG or JPEG, up to 2 MB)
                </label>

                <input
                  ref={fileInputRef}
                  id="profileImage"
                  className="form-control"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(event) =>
                    setImage(event.target.files?.[0] || null)
                  }
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={change}
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  aria-describedby="password-help"
                />

                {/* Explain password requirements */}
                <div
                  id="password-help"
                  className="form-text"
                >
                  {PASSWORD_HELP}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label
                  htmlFor="confirmPassword"
                  className="form-label"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="form-control"
                  value={form.confirmPassword}
                  onChange={change}
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={submitting || sessionLoading}
              >
                {submitting ? 'Registering…' : 'Register User'}
              </button>

            </form>
          </div>
        </div>
      </main>
    </>
  )
}
