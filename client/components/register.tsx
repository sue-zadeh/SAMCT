import { useState } from 'react'
import axios from 'axios'
import {
  FaUser,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaImage,
  FaBuilding,
} from 'react-icons/fa'
import Navbar from './navbar'
import { API_BASE_URL } from '../lib/api'

function Register() {
  const [formData, setFormData] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'Resident',
    village: 'Ngatea',
    password: '',
    confirmPassword: '',
  })

  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [notification, setNotification] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    if (
      !formData.userName.trim() ||
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.role.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return 'Please fill in all required fields.'
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.'
    }

    if (
      formData.password.length < 12 ||
      !/[a-z]/.test(formData.password) ||
      !/[A-Z]/.test(formData.password) ||
      !/\d/.test(formData.password) ||
      !/[^A-Za-z0-9]/.test(formData.password)
    ) {
      return 'Use at least 12 characters with upper/lowercase, a number and a symbol.'
    }

    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const error = validateForm()
    if (error) {
      setNotification(error)
      setIsError(true)
      return
    }

    try {
      setLoading(true)
      setNotification('')
      setIsError(false)

      const submitData = new FormData()
      submitData.append('UserName', formData.userName)
      submitData.append('FirstName', formData.firstName)
      submitData.append('LastName', formData.lastName)
      submitData.append('Email', formData.email)
      submitData.append('Role', formData.role)
      submitData.append('Village', formData.village)
      submitData.append('Password', formData.password)

      if (profileImage) {
        submitData.append('ProfileImage', profileImage)
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/register`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      setNotification(response.data.message || 'User registered successfully.')
      setIsError(false)

      setFormData({
        userName: '',
        firstName: '',
        lastName: '',
        email: '',
        role: 'Resident',
        village: 'Ngatea',
        password: '',
        confirmPassword: '',
      })
      setProfileImage(null)
    } catch (error: any) {
      setNotification(
        error?.response?.data?.message || 'Failed to register user.',
      )
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar userType="admin" />
      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="p-4 border rounded-4 shadow-sm bg-white">
              <h1 className="fw-bold text-center mb-4">Register User</h1>

              {notification && (
                <div
                  className={`alert ${
                    isError ? 'alert-danger' : 'alert-success'
                  }`}
                >
                  {notification}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <FaUser className="me-2" />
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <FaUser className="me-2" />
                      First Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      autoComplete="given-name"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <FaUser className="me-2" />
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="form-label fw-semibold">
                    <FaEnvelope className="me-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <FaUser className="me-2" />
                      Role
                    </label>
                    <select
                      className="form-select"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="Resident">Resident</option>
                      <option value="VillageManager">Village Manager</option>
                      <option value="CompanySecretary">Company Secretary</option>
                      <option value="FinancialAdvisor">Financial Advisor</option>
                      <option value="FinancialAdministrator">Financial Administrator</option>
                      <option value="Chairman">Chairman</option>
                      <option value="Director">Director</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <FaBuilding className="me-2" />
                      Village
                    </label>
                    <select
                      className="form-select"
                      name="village"
                      value={formData.village}
                      onChange={handleChange}
                    >
                      <option value="Ngatea">Ngatea</option>
                      <option value="Whitianga">Whitianga</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="form-label fw-semibold">
                    <FaImage className="me-2" />
                    Profile Image
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                      setProfileImage(e.target.files?.[0] || null)
                    }
                  />
                </div>

                <div className="mt-3">
                  <label className="form-label fw-semibold">
                    <FaLock className="me-2" />
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="form-label fw-semibold">
                    <FaLock className="me-2" />
                    Confirm Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 mt-4"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register User'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Register
