import { useState } from 'react'
import { replyToRating } from '../services/api'
import './RatingList.css'

function RatingList({ ratings }) {
  const [replyDrafts, setReplyDrafts] = useState({})
  const [replyingId, setReplyingId] = useState(null)
  const [replyError, setReplyError] = useState('')

  const isHotelLoggedIn = !!localStorage.getItem('hotel_token')

  if (!ratings || ratings.length === 0) {
    return (
      <div className="rating-list-empty">
        <p>No reviews yet. Be the first to review!</p>
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleReplyChange = (ratingId, value) => {
    setReplyDrafts((prev) => ({ ...prev, [ratingId]: value }))
  }

  const handleReplySubmit = async (ratingId) => {
    const replyText = (replyDrafts[ratingId] || '').trim()
    if (!replyText) {
      setReplyError('Reply cannot be empty.')
      return
    }

    try {
      setReplyingId(ratingId)
      setReplyError('')
      await replyToRating(ratingId, replyText)
      window.location.reload()
    } catch (err) {
      setReplyError(err.message || 'Failed to submit reply.')
    } finally {
      setReplyingId(null)
    }
  }

  return (
    <div className="rating-list-container">
      <h3 className="rating-list-title">
        Reviews ({ratings.length})
      </h3>
      <div className="ratings-list">
        {ratings.map((rating) => (
          <div key={rating.id} className="rating-item">
            <div className="rating-item-header">
              <div className="rating-user-info">
                <span className="rating-user-name">{rating.user_name}</span>
                <div className="rating-stars-display">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`rating-star ${rating.rating >= star ? 'filled' : ''}`}
                    >
                      ⭐
                    </span>
                  ))}
                  <span className="rating-number">{rating.rating}/5</span>
                </div>
              </div>
              <span className="rating-date">{formatDate(rating.created_at)}</span>
            </div>
            {rating.comment && (
              <p className="rating-comment">{rating.comment}</p>
            )}

            {rating.hotel_reply && (
              <div className="rating-reply">
                <div className="rating-reply-label">Hotel reply</div>
                <div className="rating-reply-text">{rating.hotel_reply}</div>
              </div>
            )}

            {isHotelLoggedIn && !rating.hotel_reply && (
              <div className="rating-reply-form">
                <label className="rating-reply-label" htmlFor={`reply-${rating.id}`}>
                  Reply to this review
                </label>
                <textarea
                  id={`reply-${rating.id}`}
                  className="rating-reply-input"
                  rows="3"
                  value={replyDrafts[rating.id] || ''}
                  onChange={(e) => handleReplyChange(rating.id, e.target.value)}
                  placeholder="Write a short reply..."
                />
                {replyError && <div className="form-error">{replyError}</div>}
                <button
                  type="button"
                  className="submit-rating-button"
                  onClick={() => handleReplySubmit(rating.id)}
                  disabled={replyingId === rating.id}
                >
                  {replyingId === rating.id ? 'Replying...' : 'Post Reply'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default RatingList

