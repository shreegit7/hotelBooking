import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { userLogin } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import './Login.css'

function Login() {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
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
    
    if (!formData.usernameOrEmail || !formData.password) {
      setError('Please enter both username/email and password.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await userLogin(formData.usernameOrEmail, formData.password)
      navigate('/user/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">User Login</h1>
          <p className="login-subtitle">Sign in to view and manage your bookings</p>
          
          {error && <ErrorMessage message={error} />}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="usernameOrEmail" className="form-label">
                Username or Email
              </label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter username or email"
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
              className="login-button"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="login-register-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
