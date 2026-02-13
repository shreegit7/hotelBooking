import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { userLogout } from '../services/api'
import './Navbar.css'

function Navbar() {
  const [isHotelLoggedIn, setIsHotelLoggedIn] = useState(false)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [hotelName, setHotelName] = useState('')
  const [username, setUsername] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const syncAuthState = () => {
    // Check if hotel is logged in
    const hotelToken = localStorage.getItem('hotel_token')
    const name = localStorage.getItem('hotel_name')
    setIsHotelLoggedIn(!!hotelToken)
    setHotelName(name || '')
    
    // Check if user is logged in
    const userToken = localStorage.getItem('user_token')
    const user = localStorage.getItem('username')
    setIsUserLoggedIn(!!userToken)
    setUsername(user || '')
  }

  useEffect(() => {
    syncAuthState()
  }, [location.key])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }
    return () => document.body.classList.remove('menu-open')
  }, [isMenuOpen])

  useEffect(() => {
    const handleAuthChange = () => syncAuthState()
    window.addEventListener('storage', handleAuthChange)
    window.addEventListener('auth-changed', handleAuthChange)
    return () => {
      window.removeEventListener('storage', handleAuthChange)
      window.removeEventListener('auth-changed', handleAuthChange)
    }
  }, [])

  const handleUserLogout = async () => {
    await userLogout()
    setIsUserLoggedIn(false)
    setUsername('')
    navigate('/')
  }

  const handleExplore = () => {
    setIsMenuOpen(false)
    navigate('/hotels')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/hotel.png" alt="Hotel Logo" className="logo-icon" />
          <span className="logo-text">Pauna.com</span>
        </Link>
        <button
          type="button"
          className="navbar-toggle"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? 'Close' : 'Menu'}
        </button>
        <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <span className="mobile-menu-title">Menu</span>
            <button
              type="button"
              className="mobile-menu-close"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close navigation"
            >
              x
            </button>
          </div>
          <div className="navbar-links-main">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/hotels" className="nav-link">Hotels</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>
          <div className="navbar-links-actions">
            {isUserLoggedIn ? (
              <>
                <Link to="/user/dashboard" className="nav-link primary-link">
                  {username || 'Account'}
                </Link>
                <button onClick={handleUserLogout} className="nav-link logout-button">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="nav-link">Register</Link>
                <Link to="/login" className="nav-link primary-link">Login</Link>
              </>
            )}
            {isHotelLoggedIn ? (
              <Link to="/hotel/dashboard" className="nav-link hotel-link">
                Hotel Dashboard {hotelName && `(${hotelName})`}
              </Link>
            ) : (
              <Link to="/hotel/login" className="nav-link hotel-link">Hotel Login</Link>
            )}
          </div>
          <div className="mobile-menu-cta">
            <Link to="/hotels" className="menu-cta-button" onClick={handleExplore}>
              Explore
            </Link>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <button
          type="button"
          className="navbar-overlay"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}
    </nav>
  )
}

export default Navbar

