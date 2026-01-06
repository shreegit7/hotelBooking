import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchHotelById, fetchRatings } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import RatingForm from '../components/RatingForm'
import RatingList from '../components/RatingList'
import BookingModal from '../components/BookingModal'
import './HotelDetails.css'

function HotelDetails() {
  const { id } = useParams()
  const [hotel, setHotel] = useState(null)
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  useEffect(() => {
    loadHotel()
    loadRatings()
  }, [id])

  const loadHotel = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchHotelById(id)
      setHotel(data)
    } catch (err) {
      setError('Failed to load hotel details. Please make sure the backend server is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadRatings = async () => {
    try {
      const data = await fetchRatings(id)
      setRatings(data || [])
    } catch (err) {
      console.error('Error loading ratings:', err)
      setRatings([]) // Set empty array on error
    }
  }

  const handleRatingSubmitted = () => {
    // Reload hotel data to get updated average rating
    loadHotel()
    // Reload ratings list
    loadRatings()
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!hotel) {
    return <ErrorMessage message="Hotel not found." />
  }

  return (
    <div className="hotel-details-page">
      <div className="hotel-details-container">
        <Link to="/hotels" className="back-link">
          ← Back to Hotels
        </Link>

        <div className="hotel-details-image-container">
          <img
            src={hotel.image || 'https://via.placeholder.com/800x400?text=Hotel+Image'}
            alt={hotel.name}
            className="hotel-details-image"
          />
        </div>

        <div className="hotel-details-content">
          <div className="hotel-details-header">
            <div>
              <h1 className="hotel-details-name">{hotel.name}</h1>
              <p className="hotel-details-location">📍 {hotel.location}</p>
            </div>
            <div className="hotel-details-rating-section">
              <div className="hotel-details-rating">
                <span className="rating-star-large">⭐</span>
                <span className="rating-value-large">{hotel.rating}</span>
                <span className="rating-label">Hotel Rating</span>
              </div>
              {hotel.average_user_rating && (
                <div className="hotel-details-user-rating">
                  <span className="rating-star-large">⭐</span>
                  <span className="rating-value-large">{hotel.average_user_rating}</span>
                  <span className="rating-label">
                    User Rating ({hotel.ratings_count} {hotel.ratings_count === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="hotel-details-price-section">
            <div className="price-display">
              <span className="price-amount-large">Rs. {parseFloat(hotel.price).toFixed(2)}</span>
              <span className="price-label-large">per night</span>
            </div>
            <button 
              className="book-now-button"
              onClick={() => setIsBookingModalOpen(true)}
            >
              Book Now
            </button>
          </div>

          <div className="hotel-details-description">
            <h2 className="section-title">Description</h2>
            <p className="description-text">{hotel.description}</p>
          </div>

          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="hotel-details-amenities">
              <h2 className="section-title">Amenities</h2>
              <ul className="amenities-list">
                {hotel.amenities.map((amenity, index) => (
                  <li key={index} className="amenity-item">
                    ✓ {amenity}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <RatingForm hotelId={id} onRatingSubmitted={handleRatingSubmitted} />
        <RatingList ratings={ratings} />
      </div>

      <BookingModal
        hotel={hotel}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  )
}

export default HotelDetails

