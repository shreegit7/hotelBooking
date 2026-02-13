import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchUserBookings, cancelBooking, userLogout } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import './UserDashboard.css'

function UserDashboard() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, confirmed, cancelled
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    const token = localStorage.getItem('user_token')
    if (!token) {
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const bookingsData = await fetchUserBookings()
      setBookings(bookingsData)
    } catch (err) {
      if (err.message.includes('expired') || err.message.includes('Not authenticated')) {
        navigate('/login')
      } else {
        setError(err.message || 'Failed to load bookings.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (booking) => {
    const canCancel =
      booking.can_cancel !== undefined
        ? booking.can_cancel
        : booking.status === 'pending' || booking.status === 'confirmed'

    if (!canCancel) {
      alert('Cancellation window expired. Please contact the hotel to cancel.')
      return
    }

    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      const updatedBooking = await cancelBooking(booking.id)
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? updatedBooking : b)))
      alert('Booking cancelled successfully.')
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.')
    }
  }

  const handleLogout = async () => {
    await userLogout()
    navigate('/')
  }

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true
    return booking.status === filter
  })

  const getStatusCount = (status) => {
    return bookings.filter((b) => b.status === status).length
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed'
      case 'pending':
        return 'status-pending'
      case 'cancelled':
        return 'status-cancelled'
      case 'declined':
        return 'status-declined'
      default:
        return ''
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  const username = localStorage.getItem('username') || 'User'

  return (
    <div className="user-dashboard-page">
      <div className="user-dashboard-container">
        <div className="user-dashboard-header">
          <div>
            <h1 className="user-dashboard-title">My Bookings</h1>
            <p className="user-dashboard-subtitle">Welcome, {username}!</p>
          </div>
          <button onClick={handleLogout} className="user-logout-button">
            Logout
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-value">{getStatusCount('pending')}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card confirmed">
            <div className="stat-value">{getStatusCount('confirmed')}</div>
            <div className="stat-label">Confirmed</div>
          </div>
          <div className="stat-card cancelled">
            <div className="stat-value">{getStatusCount('cancelled')}</div>
            <div className="stat-label">Cancelled</div>
          </div>
        </div>

        <div className="dashboard-filters">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({bookings.length})
          </button>
          <button
            className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({getStatusCount('pending')})
          </button>
          <button
            className={`filter-button ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed ({getStatusCount('confirmed')})
          </button>
          <button
            className={`filter-button ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled ({getStatusCount('cancelled')})
          </button>
        </div>

        <div className="bookings-list">
          {filteredBookings.length === 0 ? (
            <div className="no-bookings">
              <p>No bookings found{filter !== 'all' ? ` with status "${filter}"` : ''}.</p>
              <p className="no-bookings-hint">
                Start by booking a hotel from the <a href="/hotels">Hotels</a> page!
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div>
                    <h3 className="booking-reference">#{booking.booking_reference}</h3>
                    <p className="booking-hotel">{booking.hotel_name}</p>
                  </div>
                  <span className={`booking-status-badge ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="booking-details">
                  <div className="booking-detail-item">
                    <span className="detail-label">Guest:</span>
                    <span className="detail-value">{booking.guest_name}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{booking.guest_email}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Check-in:</span>
                    <span className="detail-value">
                      {new Date(booking.check_in).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Check-out:</span>
                    <span className="detail-value">
                      {new Date(booking.check_out).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Guests:</span>
                    <span className="detail-value">{booking.num_guests}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Total:</span>
                    <span className="detail-value total-price">
                      Rs. {parseFloat(booking.total_price).toFixed(2)}
                    </span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Booked on:</span>
                    <span className="detail-value">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <div className="booking-actions">
                    <button
                      onClick={() => handleCancel(booking)}
                      className="action-button cancel-button"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard