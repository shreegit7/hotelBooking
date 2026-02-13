import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { submitBooking } from '../services/api'
import './BookingModal.css'

function BookingModal({ hotel, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    check_in: '',
    check_out: '',
    num_guests: 1,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [booking, setBooking] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    if (!formData.check_in) {
      setFormData((prev) => ({ ...prev, check_in: today }))
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const token = localStorage.getItem('user_token')
    setIsLoggedIn(!!token)

    if (token) {
      const username = localStorage.getItem('username') || ''
      const email = localStorage.getItem('user_email') || ''
      setFormData((prev) => ({
        ...prev,
        guest_name: prev.guest_name || username,
        guest_email: prev.guest_email || email,
      }))
    }
  }, [isOpen])

  const calculateTotal = () => {
    if (formData.check_in && formData.check_out && hotel) {
      const checkIn = new Date(formData.check_in)
      const checkOut = new Date(formData.check_out)
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
      if (nights > 0) {
        return {
          nights,
          total: (parseFloat(hotel.price) * nights).toFixed(2),
        }
      }
    }
    return { nights: 0, total: '0.00' }
  }

  const { nights, total } = calculateTotal()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'num_guests' ? parseInt(value) || 1 : value,
    }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isLoggedIn) {
      setError('Please log in to book a room.')
      return
    }

    if (!formData.guest_name || !formData.guest_email || !formData.check_in || !formData.check_out) {
      setError('Please fill in all required fields.')
      return
    }

    if (new Date(formData.check_out) <= new Date(formData.check_in)) {
      setError('Check-out date must be after check-in date.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const bookingData = await submitBooking(hotel.id, formData)
      setBooking(bookingData)
    } catch (err) {
      setError(err.message || 'Failed to submit booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        guest_name: '',
        guest_email: '',
        check_in: new Date().toISOString().split('T')[0],
        check_out: '',
        num_guests: 1,
      })
      setError(null)
      setBooking(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="booking-modal-overlay" onClick={handleClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        {!booking ? (
          <>
            <div className="booking-modal-header">
              <h2 className="booking-modal-title">Book {hotel?.name}</h2>
              <button className="booking-modal-close" onClick={handleClose} disabled={submitting}>
                x
              </button>
            </div>

            <div className="booking-modal-content">
              {!isLoggedIn && (
                <div className="booking-login-note">
                  Please <Link to="/login">log in</Link> to book this hotel.
                </div>
              )}
              <div className="booking-hotel-info">
                <p className="booking-hotel-location">{hotel?.location}</p>
                <p className="booking-hotel-price">
                  Rs. {parseFloat(hotel?.price || 0).toFixed(2)} per night
                </p>
              </div>

              <form onSubmit={handleSubmit} className="booking-form">
                <div className="booking-form-row">
                  <div className="form-group">
                    <label htmlFor="guest_name" className="form-label">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="guest_name"
                      name="guest_name"
                      value={formData.guest_name}
                      onChange={handleChange}
                      required
                      disabled={!isLoggedIn}
                      className="form-input"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="guest_email" className="form-label">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="guest_email"
                      name="guest_email"
                      value={formData.guest_email}
                      onChange={handleChange}
                      required
                      disabled={!isLoggedIn}
                      className="form-input"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="booking-form-row">
                  <div className="form-group">
                    <label htmlFor="check_in" className="form-label">
                      Check-in Date *
                    </label>
                    <input
                      type="date"
                      id="check_in"
                      name="check_in"
                      value={formData.check_in}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      disabled={!isLoggedIn}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="check_out" className="form-label">
                      Check-out Date *
                    </label>
                    <input
                      type="date"
                      id="check_out"
                      name="check_out"
                      value={formData.check_out}
                      onChange={handleChange}
                      required
                      min={formData.check_in || new Date().toISOString().split('T')[0]}
                      disabled={!isLoggedIn}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="num_guests" className="form-label">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    id="num_guests"
                    name="num_guests"
                    value={formData.num_guests}
                    onChange={handleChange}
                    required
                    min="1"
                    max="20"
                    disabled={!isLoggedIn}
                    className="form-input"
                  />
                </div>

                {nights > 0 && (
                  <div className="booking-summary">
                    <div className="booking-summary-row">
                      <span>Price per night:</span>
                      <span>Rs. {parseFloat(hotel?.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="booking-summary-row">
                      <span>Number of nights:</span>
                      <span>{nights}</span>
                    </div>
                    <div className="booking-summary-total">
                      <span>Total Price:</span>
                      <span>Rs. {total}</span>
                    </div>
                  </div>
                )}

                {error && <div className="form-error">{error}</div>}

                <button
                  type="submit"
                  disabled={submitting || nights <= 0 || !isLoggedIn}
                  className="submit-booking-button"
                >
                  {submitting ? 'Processing...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="booking-confirmation">
            <div className="booking-confirmation-icon">OK</div>
            <h2 className="booking-confirmation-title">Booking Confirmed!</h2>
            <div className="booking-confirmation-details">
              <div className="confirmation-row">
                <span className="confirmation-label">Booking Reference:</span>
                <span className="confirmation-value booking-ref">{booking.booking_reference}</span>
              </div>
              <div className="confirmation-row">
                <span className="confirmation-label">Hotel:</span>
                <span className="confirmation-value">{booking.hotel_name || hotel?.name}</span>
              </div>
              <div className="confirmation-row">
                <span className="confirmation-label">Guest:</span>
                <span className="confirmation-value">{booking.guest_name}</span>
              </div>
              <div className="confirmation-row">
                <span className="confirmation-label">Check-in:</span>
                <span className="confirmation-value">
                  {new Date(booking.check_in).toLocaleDateString()}
                </span>
              </div>
              <div className="confirmation-row">
                <span className="confirmation-label">Check-out:</span>
                <span className="confirmation-value">
                  {new Date(booking.check_out).toLocaleDateString()}
                </span>
              </div>
              <div className="confirmation-row">
                <span className="confirmation-label">Guests:</span>
                <span className="confirmation-value">{booking.num_guests}</span>
              </div>
              <div className="confirmation-row total-row">
                <span className="confirmation-label">Total Amount:</span>
                <span className="confirmation-value">
                  Rs. {parseFloat(booking.total_price).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="booking-status-info">
              <p className="booking-status-badge" data-status={booking.status}>
                Status:{' '}
                {booking.status === 'pending'
                  ? 'Pending Approval'
                  : booking.status === 'confirmed'
                  ? 'Confirmed'
                  : booking.status === 'declined'
                  ? 'Declined'
                  : booking.status}
              </p>
              {booking.status === 'pending' && (
                <p className="booking-confirmation-message">
                  Your booking request has been submitted and is pending hotel approval.
                  You will receive an email at {booking.guest_email} once the hotel responds.
                </p>
              )}
              {booking.status === 'confirmed' && (
                <p className="booking-confirmation-message">
                  A confirmation email has been sent to {booking.guest_email}
                </p>
              )}
            </div>
            <button className="close-booking-button" onClick={handleClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingModal