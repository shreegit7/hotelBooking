import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏨</span>
          <span className="logo-text">Pauna.com</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/hotels" className="nav-link">Hotels</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

