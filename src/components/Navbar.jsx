import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './Navbar.css'

function Navbar() {
  const [isHotelLoggedIn, setIsHotelLoggedIn] = useState(false)
  const [hotelName, setHotelName] = useState('')

  useEffect(() => {
    // Check if hotel is logged in
    const token = localStorage.getItem('hotel_token')
    const name = localStorage.getItem('hotel_name')
    setIsHotelLoggedIn(!!token)
    setHotelName(name || '')
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/hotel.png" alt="Hotel Logo" className="logo-icon" />
          <span className="logo-text">Pauna.com</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/hotels" className="nav-link">Hotels</Link>
          {isHotelLoggedIn ? (
            <a 
              href={`${window.location.origin}/hotel/dashboard`}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link hotel-link"
            >
              Dashboard {hotelName && `(${hotelName})`}
            </a>
          ) : (
            <Link to="/hotel/login" className="nav-link hotel-link">Hotel Login</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

