import { useState } from 'react'
import './ImageGallery.css'

function ImageGallery({ images, hotelName }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // If no images provided, return null or placeholder
  if (!images || images.length === 0) {
    return null
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const currentImage = images[currentIndex]

  return (
    <div className="image-gallery">
      <div className="image-gallery-main">
        <button 
          className="gallery-nav-button gallery-nav-prev" 
          onClick={goToPrevious}
          aria-label="Previous image"
        >
          ‹
        </button>
        
        <div className="gallery-image-container">
          <img 
            src={currentImage.image_url || currentImage} 
            alt={currentImage.alt_text || `${hotelName} - Image ${currentIndex + 1}`}
            className="gallery-main-image"
          />
          {images.length > 1 && (
            <div className="gallery-image-counter">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
        
        <button 
          className="gallery-nav-button gallery-nav-next" 
          onClick={goToNext}
          aria-label="Next image"
        >
          ›
        </button>
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {images.map((image, index) => (
            <button
              key={index}
              className={`gallery-thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to image ${index + 1}`}
            >
              <img 
                src={image.image_url || image} 
                alt={image.alt_text || `${hotelName} thumbnail ${index + 1}`}
                className="thumbnail-image"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
