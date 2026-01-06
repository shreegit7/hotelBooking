import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchHotelBookings, approveBooking, declineBooking, hotelLogout, getHotelProfile } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import './HotelDashboard.css'

function HotelDashboard() {
  const [bookings, setBookings] = useState([])
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, confirmed, declined, cancelled
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    const token = localStorage.getItem('hotel_token')
    if (!token) {
      navigate('/hotel/login')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Load hotel profile and bookings in parallel
      const [hotelData, bookingsData] = await Promise.all([
        getHotelProfile(),
        fetchHotelBookings()
      ])
      
      setHotel(hotelData)
      setBookings(bookingsData)
    } catch (err) {
      if (err.message.includes('expired') || err.message.includes('Not authenticated')) {
        navigate('/hotel/login')
      } else {
        setError(err.message || 'Failed to load dashboard data.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (bookingId) => {
    try {
      const updatedBooking = await approveBooking(bookingId)
      setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b))
    } catch (err) {
      alert(err.message || 'Failed to approve booking.')
    }
  }

  const handleDecline = async (bookingId) => {
    if (!window.confirm('Are you sure you want to decline this booking?')) {
      return
    }

    try {
      const updatedBooking = await declineBooking(bookingId)
      setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b))
    } catch (err) {
      alert(err.message || 'Failed to decline booking.')
    }
  }

  const handleLogout = async () => {
    await hotelLogout()
    navigate('/hotel/login')
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    return booking.status === filter
  })

  const getStatusCount = (status) => {
    return bookings.filter(b => b.status === status).length
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="hotel-dashboard-page">
      <div className="hotel-dashboard-container">
        <div className="hotel-dashboard-header">
          <div>
            <h1 className="hotel-dashboard-title">Hotel Dashboard</h1>
            {hotel && (
              <p className="hotel-dashboard-subtitle">{hotel.name} - {hotel.location}</p>
            )}
          </div>
          <button onClick={handleLogout} className="hotel-logout-button">
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
          <div className="stat-card declined">
            <div className="stat-value">{getStatusCount('declined')}</div>
            <div className="stat-label">Declined</div>
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
            className={`filter-button ${filter === 'declined' ? 'active' : ''}`}
            onClick={() => setFilter('declined')}
          >
            Declined ({getStatusCount('declined')})
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
            </div>
          ) : (
            filteredBookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div>
                    <h3 className="booking-reference">#{booking.booking_reference}</h3>
                    <p className="booking-guest">{booking.guest_name} ({booking.guest_email})</p>
                  </div>
                  <span className={`booking-status-badge status-${booking.status}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="booking-details">
                  <div className="booking-detail-item">
                    <span className="detail-label">Check-in:</span>
                    <span className="detail-value">{new Date(booking.check_in).toLocaleDateString()}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Check-out:</span>
                    <span className="detail-value">{new Date(booking.check_out).toLocaleDateString()}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Guests:</span>
                    <span className="detail-value">{booking.num_guests}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Total:</span>
                    <span className="detail-value total-price">Rs. {parseFloat(booking.total_price).toFixed(2)}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Booked on:</span>
                    <span className="detail-value">{new Date(booking.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="booking-actions">
                    <button
                      onClick={() => handleApprove(booking.id)}
                      className="action-button approve-button"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleDecline(booking.id)}
                      className="action-button decline-button"
                    >
                      ✗ Decline
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

export default HotelDashboard

