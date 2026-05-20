import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from './navbar'

function ProfileAdminEdit() {
  const navigate = useNavigate()
  const API_BASE_URL = 'http://localhost:5072'

  const [firstName, setFirstName] = useState(
    localStorage.getItem('firstname') || 'Graeme',
  )
  const [lastName, setLastName] = useState(
    localStorage.getItem('lastname') || 'Norton',
  )
  const [userName, setUserName] = useState(
    localStorage.getItem('username') || 'graeme1',
  )
  const [email, setEmail] = useState(
    localStorage.getItem('email') || 'graeme@example.com',
  )
  const [village, setVillage] = useState(
    localStorage.getItem('village') || 'Papakura',
  )
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSave = async () => {
    try {
      setError('')
      setMessage('')

      console.log('currentUsername', localStorage.getItem('username'))
      console.log('form username', userName)
      const response = await axios.put(
        'http://localhost:5072/api/users/profile',
        {
          currentUsername: localStorage.getItem('username') || userName,
          firstName,
          lastName,
          email,
          village,
        },
      )

      const updatedUser = response.data

      localStorage.setItem('firstname', updatedUser.firstName || '')
      localStorage.setItem('lastname', updatedUser.lastName || '')
      localStorage.setItem('fullname', updatedUser.fullName || '')
      localStorage.setItem('username', updatedUser.userName || '')
      localStorage.setItem('email', updatedUser.email || '')
      localStorage.setItem('role', updatedUser.role || '')
      localStorage.setItem('village', updatedUser.village || '')
      localStorage.setItem('profileImageUrl', updatedUser.profileImageUrl || '')

      setMessage('Profile updated successfully.')

      setTimeout(() => {
        navigate('/admin/profile')
      }, 700)
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to update profile.')
    }
  }

  return (
    <>
      <Navbar userType="admin" />

      <main className="container py-5">
        <div className="p-4 border rounded-4 shadow-sm bg-white">
          <h1 className="fw-bold mb-4">Edit Admin Profile</h1>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">First Name</label>
              <input
                className="form-control"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Last Name</label>
              <input
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Username</label>
              <input
                className="form-control"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Email</label>
              <input
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Village</label>
              <select
                className="form-select"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
              >
                <option value="Papakura">Papakura</option>
                <option value="Ngatea">Ngatea</option>
                <option value="Whitianga">Whitianga</option>
              </select>
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/admin/profile')}
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

export default ProfileAdminEdit
