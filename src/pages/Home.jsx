import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home-page">
      <section className="welcome-banner">
        <div className="banner-content">
          <h1 className="banner-title">Welcome to pauna.com</h1>
          <p className="banner-subtitle">
            Discover amazing hotels around the world and book your perfect stay
          </p>
          <Link to="/hotels" className="banner-button">
            Explore Hotels
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home

