import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hotelLogin } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import './HotelLogin.css'

function HotelLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await hotelLogin(formData.username, formData.password)
      navigate('/hotel/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hotel-login-page">
      <div className="hotel-login-container">
        <div className="hotel-login-card">
          <h1 className="hotel-login-title">Hotel Login</h1>
          <p className="hotel-login-subtitle">Sign in to manage your hotel bookings</p>
          
          {error && <ErrorMessage message={error} />}
          
          <form onSubmit={handleSubmit} className="hotel-login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hotel-login-button"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="hotel-login-note">
            Note: Hotel accounts are created by the administrator. 
            Please contact support if you need an account.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HotelLogin

