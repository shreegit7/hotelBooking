import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchHotels } from '../services/api'
import HotelCard from '../components/HotelCard'
import LoadingSpinner from '../components/LoadingSpinner'
import './Home.css'

function Home() {
  const [featuredHotels, setFeaturedHotels] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [featuredError, setFeaturedError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadFeaturedHotels = async () => {
      try {
        setFeaturedLoading(true)
        setFeaturedError('')
        const data = await fetchHotels('-rating', '')
        const topThree = Array.isArray(data) ? data.slice(0, 3) : []

        if (isMounted) {
          setFeaturedHotels(topThree)
        }
      } catch (error) {
        console.error('Failed to load featured hotels:', error)
        if (isMounted) {
          setFeaturedError('Unable to load featured hotels right now.')
        }
      } finally {
        if (isMounted) {
          setFeaturedLoading(false)
        }
      }
    }

    loadFeaturedHotels()

    return () => {
      isMounted = false
    }
  }, [])

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

      <section className="featured-section">
        <div className="featured-container">
          <div className="featured-header">
            <div>
              <h2 className="featured-title">Featured hotels</h2>
              <p className="featured-subtitle">
                Handpicked stays with top reviews and great locations.
              </p>
            </div>
            <Link to="/hotels" className="featured-link">
              View all hotels
            </Link>
          </div>
          {featuredError ? (
            <p className="featured-error">{featuredError}</p>
          ) : featuredLoading ? (
            <div className="featured-loading">
              <LoadingSpinner />
            </div>
          ) : featuredHotels.length === 0 ? (
            <p className="featured-empty">No featured hotels available yet.</p>
          ) : (
            <div className="featured-grid">
              {featuredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home

