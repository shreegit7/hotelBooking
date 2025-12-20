import { useState } from 'react'
import { submitRating } from '../services/api'
import './RatingForm.css'

function RatingForm({ hotelId, onRatingSubmitted }) {
  const [formData, setFormData] = useState({
    user_name: '',
    rating: 5,
    comment: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Prepare rating data - only include comment if it's not empty
      const ratingData = {
        user_name: formData.user_name.trim(),
        rating: formData.rating,
      }
      
      // Only include comment if it has content
      if (formData.comment && formData.comment.trim()) {
        ratingData.comment = formData.comment.trim()
      }
      
      console.log('Submitting rating:', { hotelId, ratingData })
      const result = await submitRating(hotelId, ratingData)
      console.log('Rating submitted successfully:', result)
      
      setSuccess(true)
      setFormData({
        user_name: '',
        rating: 5,
        comment: '',
      })
      
      // Notify parent component to refresh ratings
      if (onRatingSubmitted) {
        // Add a small delay to ensure backend has processed the rating
        setTimeout(() => {
          onRatingSubmitted()
        }, 500)
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Rating submission error:', err)
      const errorMessage = err.message || 'Failed to submit rating. Please try again.'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rating-form-container">
      <h3 className="rating-form-title">Write a Review</h3>
      <form onSubmit={handleSubmit} className="rating-form">
        <div className="form-group">
          <label htmlFor="user_name" className="form-label">
            Your Name *
          </label>
          <input
            type="text"
            id="user_name"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="rating" className="form-label">
            Rating *
          </label>
          <div className="rating-stars-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <label key={star} className="star-label">
                <input
                  type="radio"
                  name="rating"
                  value={star}
                  checked={formData.rating === star}
                  onChange={handleChange}
                  required
                  className="star-radio"
                />
                <span className={`star-icon ${formData.rating >= star ? 'filled' : ''}`}>
                  ⭐
                </span>
              </label>
            ))}
            <span className="rating-value-display">{formData.rating}/5</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comment" className="form-label">
            Comment (Optional)
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows="4"
            className="form-textarea"
            placeholder="Share your experience..."
          />
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {success && (
          <div className="form-success">
            ✓ Thank you for your review!
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="submit-rating-button"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}

export default RatingForm

