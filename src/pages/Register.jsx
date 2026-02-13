import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { userRegister } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import './Register.css'

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
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
    
    // Validation
    if (!formData.password || !formData.confirmPassword) {
      setError('Please enter and confirm your password.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (!formData.username && !formData.email) {
      setError('Please enter either a username or email address.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await userRegister(
        formData.username || undefined,
        formData.email || undefined,
        formData.password,
        formData.first_name,
        formData.last_name
      )
      navigate('/user/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Register to manage your bookings</p>
          
          {error && <ErrorMessage message={error} />}
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name" className="form-label">
                  First Name (Optional)
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="First name"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name" className="form-label">
                  Last Name (Optional)
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Last name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username <span className="optional">(Optional if email provided)</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="Choose a username"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="optional">(Optional if username provided)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="your.email@example.com"
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
                placeholder="At least 6 characters"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Confirm your password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="register-button"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="register-login-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
