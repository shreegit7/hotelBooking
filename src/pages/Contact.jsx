import './Contact.css'

function Contact() {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-subtitle">We'd love to hear from you. Get in touch with us!</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon">📧</div>
              <h3 className="info-title">Email</h3>
              <p className="info-text">support@pauna.com</p>
              <p className="info-text">info@pauna.com</p>
            </div>

            <div className="info-card">
              <div className="info-icon">📞</div>
              <h3 className="info-title">Phone</h3>
              <p className="info-text">+1 (555) 123-4567</p>
              <p className="info-text">+1 (555) 987-6543</p>
            </div>

            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3 className="info-title">Address</h3>
              <p className="info-text">123 Hotel Street</p>
              <p className="info-text">City, State 12345</p>
              <p className="info-text">Country</p>
            </div>

            <div className="info-card">
              <div className="info-icon">🕒</div>
              <h3 className="info-title">Business Hours</h3>
              <p className="info-text">Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p className="info-text">Saturday: 10:00 AM - 4:00 PM</p>
              <p className="info-text">Sunday: Closed</p>
            </div>
          </div>

          <div className="contact-form-container">
            <h2 className="form-title">Send us a Message</h2>
            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="form-input"
                  placeholder="What is this regarding?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea
                  id="message"
                  name="message"
                  className="form-textarea"
                  rows="6"
                  placeholder="Tell us how we can help you..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-button">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
