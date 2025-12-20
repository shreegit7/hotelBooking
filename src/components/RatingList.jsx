import './RatingList.css'

function RatingList({ ratings }) {
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
          </div>
        ))}
      </div>
    </div>
  )
}

export default RatingList

