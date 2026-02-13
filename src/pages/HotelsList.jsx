import { useState, useEffect } from 'react'
import { fetchHotels } from '../services/api'
import HotelCard from '../components/HotelCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import './HotelsList.css'

function HotelsList() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    loadHotels()
  }, [sortBy, debouncedSearch])

  const loadHotels = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchHotels(sortBy, debouncedSearch)
      setHotels(data)
    } catch (err) {
      setError('Failed to load hotels. Please make sure the backend server is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchClear = () => {
    setSearchQuery('')
    setDebouncedSearch('')
  }

  return (
    <div className="hotels-list-page">
      <div className="hotels-list-container">
        <div className="hotels-list-header">
          <div className="hotels-hero">
            <div className="hotels-hero-text">
              <h1 className="hotels-list-title">Stay somewhere unforgettable</h1>
              <p className="hotels-list-subtitle">
                {debouncedSearch
                  ? `Results for "${debouncedSearch}"`
                  : 'Browse top stays picked for comfort, views, and service.'}
              </p>
            </div>
          </div>
          <div className="hotels-controls">
            <div className="search-controls">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search hotels by name or location..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    onClick={handleSearchClear}
                    className="search-clear-button"
                    aria-label="Clear search"
                  >
                    x
                  </button>
                )}
              </div>
            </div>
            <div className="sort-controls">
              <label htmlFor="sort-select" className="sort-label">
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={handleSortChange}
                className="sort-select"
              >
                <option value="">Default</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Rating (High to Low)</option>
                <option value="rating">Rating (Low to High)</option>
                <option value="name">Name (A-Z)</option>
                <option value="-name">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <ErrorMessage message={error} />
        ) : loading ? (
          <div className="hotels-loading">
            <LoadingSpinner />
          </div>
        ) : hotels.length === 0 ? (
          <div className="no-hotels">
            <p>
              {debouncedSearch
                ? `No hotels found matching "${debouncedSearch}". Try a different search term.`
                : 'No hotels found.'}
            </p>
          </div>
        ) : (
          <div className="hotels-grid">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HotelsList
