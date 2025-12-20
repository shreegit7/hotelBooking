import './ErrorMessage.css'

function ErrorMessage({ message = 'Something went wrong. Please try again later.' }) {
  return (
    <div className="error-message-container">
      <div className="error-icon">⚠️</div>
      <h2 className="error-title">Oops!</h2>
      <p className="error-text">{message}</p>
    </div>
  )
}

export default ErrorMessage

