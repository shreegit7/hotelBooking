import { Link } from 'react-router-dom'
import './HotelCard.css'

function HotelCard({ hotel }) {
  // Use average user rating if available and has reviews, otherwise use base hotel rating
  const hasUserRatings = hotel.ratings_count > 0 && hotel.average_user_rating != null
  const displayRating = hasUserRatings ? hotel.average_user_rating : hotel.rating

  return (
    <Link to={`/hotels/${hotel.id}`} className="hotel-card">
      <div className="hotel-card-image-container">
        <img 
          src={hotel.image || 'https://via.placeholder.com/400x250?text=Hotel+Image'} 
          alt={hotel.name}
          className="hotel-card-image"
        />
      </div>
      <div className="hotel-card-content">
        <h3 className="hotel-card-name">{hotel.name}</h3>
        <p className="hotel-card-location">📍 {hotel.location}</p>
        <div className="hotel-card-footer">
          <div className="hotel-card-rating">
            <span className="rating-star">⭐</span>
            <span className="rating-value">{displayRating}</span>
            {hotel.ratings_count > 0 && (
              <span className="rating-count">({hotel.ratings_count})</span>
            )}
          </div>
          <div className="hotel-card-price">
            <span className="price-amount">${parseFloat(hotel.price).toFixed(2)}</span>
            <span className="price-label">/night</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default HotelCard

