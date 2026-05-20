import React, { useState, useEffect } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import axios, { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import Navbar from './navbar'

interface LoginProps {
  onLoginSuccess: () => void
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [userName, setUserName] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const navigate = useNavigate()

  useEffect(() => {
    const savedUserName = localStorage.getItem('username')
    if (savedUserName) {
      setUserName(savedUserName)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async () => {
    if (!userName || !password) {
      setError('Please enter your username and password.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:5072/api/login', {
        userName,
        password,
      })

      if (response.data.message === 'Login successful') {
        localStorage.setItem('username', response.data.userName || '')
        localStorage.setItem('firstname', response.data.firstName || '')
        localStorage.setItem('lastname', response.data.lastName || '')
        localStorage.setItem('fullname', response.data.fullName || '')
        localStorage.setItem('email', response.data.email || '')
        localStorage.setItem('role', response.data.role || '')
        localStorage.setItem('village', response.data.village || '')
        localStorage.setItem(
          'profileImageUrl',
          response.data.profileImageUrl || '',
        )
        if (rememberMe) {
          localStorage.setItem('username', userName)
        } else {
          localStorage.removeItem('username')
        }

        onLoginSuccess()

        const role = response.data.role

        if (
          role === 'CompanySecretary' ||
          role === 'FinancialAdvisor' ||
          role === 'Chairman'
        ) {
          navigate('/admin')
        } else {
          navigate('/resident')
        }
      } else {
        setError(response.data.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>

      if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message)
      } else if (axiosError.message) {
        setError(axiosError.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar userType="public" />
      <div
        className="login-container d-flex justify-content-center align-items-center vh-100"
        style={{ backgroundColor: '#F8F9FA' }}
      >
        <div
          className="login-box p-4 shadow rounded bg-white"
          style={{ width: '400px' }}
        >
          <h2 className="text-center mb-4 text-primary">
            Welcome to SAMCT Portal
          </h2>
          <h3 className="text-center my-4">
            <i>Login</i>
          </h3>

          <div className="form-group mb-3">
            <label htmlFor="userName">Username</label>
            <input
              type="text"
              id="userName"
              className="form-control"
              placeholder="Enter your username"
              value={userName}
              autoComplete="username"
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div className="form-group mb-3 position-relative">
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
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

          {error && <div className="text-danger mb-2">{error}</div>}

          <div className="form-check mb-3">
            <input
              type="checkbox"
              id="rememberMe"
              className="form-check-input"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="rememberMe" className="form-check-label">
              Remember Me
            </label>
          </div>

          <button
            className="btn btn-primary w-100"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Login'}
          </button>
        </div>
      </div>
    </>
  )
}

export default Login
