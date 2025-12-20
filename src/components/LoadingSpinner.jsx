import './LoadingSpinner.css'

function LoadingSpinner() {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading hotels...</p>
    </div>
  )
}

export default LoadingSpinner

