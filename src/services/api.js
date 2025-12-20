const API_BASE_URL = 'http://localhost:8000/api'

/**
 * Fetch all hotels with optional sorting and search
 * @param {string} ordering - Sort order: 'price', '-price', '-rating', 'name'
 * @param {string} search - Search query for name or location
 * @returns {Promise} Promise that resolves to hotels array
 */
export const fetchHotels = async (ordering = '', search = '') => {
  try {
    const params = new URLSearchParams()
    
    if (ordering) {
      params.append('ordering', ordering)
    }
    
    if (search && search.trim()) {
      params.append('search', search.trim())
    }
    
    const queryString = params.toString()
    const url = queryString 
      ? `${API_BASE_URL}/hotels/?${queryString}`
      : `${API_BASE_URL}/hotels/`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    let hotels = data.results || data  // Handle paginated or non-paginated responses
    
    // If sorting by rating and we have average_user_rating, sort on frontend
    // since average_user_rating is a computed field
    if (ordering === '-rating' || ordering === 'rating') {
      hotels = [...hotels].sort((a, b) => {
        // Use average_user_rating if available, otherwise fall back to base rating
        const ratingA = a.average_user_rating != null ? a.average_user_rating : a.rating
        const ratingB = b.average_user_rating != null ? b.average_user_rating : b.rating
        
        if (ordering === '-rating') {
          return ratingB - ratingA  // High to Low
        } else {
          return ratingA - ratingB  // Low to High
        }
      })
    }
    
    return hotels
  } catch (error) {
    console.error('Error fetching hotels:', error)
    throw error
  }
}

/**
 * Fetch a single hotel by ID
 * @param {number|string} id - Hotel ID
 * @returns {Promise} Promise that resolves to hotel object
 */
export const fetchHotelById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/hotels/${id}/`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching hotel:', error)
    throw error
  }
}

/**
 * Fetch ratings for a specific hotel
 * @param {number|string} hotelId - Hotel ID
 * @returns {Promise} Promise that resolves to ratings array
 */
export const fetchRatings = async (hotelId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/ratings/`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    // Ensure we return an array
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching ratings:', error)
    // Return empty array on error instead of throwing, so the UI still works
    // The error is already logged to console
    return []
  }
}

/**
 * Submit a new rating for a hotel
 * @param {number|string} hotelId - Hotel ID
 * @param {Object} ratingData - Rating data {user_name, rating, comment}
 * @returns {Promise} Promise that resolves to created rating object
 */
export const submitRating = async (hotelId, ratingData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/ratings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ratingData),
    })
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        // Handle different error response formats
        if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (typeof errorData === 'object') {
          // Handle field-specific errors
          const errorFields = Object.keys(errorData).map(key => {
            const fieldErrors = Array.isArray(errorData[key]) 
              ? errorData[key].join(', ') 
              : errorData[key]
            return `${key}: ${fieldErrors}`
          })
          errorMessage = errorFields.join('; ')
        }
      } catch (parseError) {
        // If we can't parse the error, use the status text
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error submitting rating:', error)
    // Re-throw with a more user-friendly message if it's a network error
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Unable to connect to the server. Please make sure the backend is running.')
    }
    throw error
  }
}

/**
 * Submit a booking for a hotel
 * @param {number|string} hotelId - Hotel ID
 * @param {Object} bookingData - Booking data {guest_name, guest_email, check_in, check_out, num_guests}
 * @returns {Promise} Promise that resolves to created booking object
 */
export const submitBooking = async (hotelId, bookingData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/book/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error submitting booking:', error)
    throw error
  }
}

