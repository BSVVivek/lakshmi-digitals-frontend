import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function PhotoManager({ isAdmin }) {
  const [photos, setPhotos] = useState([]);
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const displayedIndex = Math.min(activeIndex, Math.max(photos.length - 1, 0));
  const activePhoto = photos[displayedIndex];

  async function fetchPhotos() {
    try {
      const response = await API.get('/photos');
      if (!Array.isArray(response.data)) {
        console.error('Expected /photos to return an array, received:', response.data);
        setPhotos([]);
        return;
      }
      setPhotos(response.data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  }

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (photos.length < 2 || isCarouselPaused) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (Math.max(index, 0) + 1) % photos.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [photos.length, isCarouselPaused]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/photos', { url, category });
      setUrl('');
      setCategory('');
      fetchPhotos();
    } catch (error) {
      console.error('Error saving photo:', error);
    }
  };

  const handleDelete = async (photo) => {
    if (!window.confirm(`Delete the photo in "${photo.category}"?`)) return;
    try {
      await API.delete(`/photos/${photo.id}`);
      await fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      window.alert('Could not delete the photo. Please try again.');
    }
  };

  return (
    <section className="manager-page popup-container">
      <h2>{isAdmin ? 'Manage Photos' : 'Photo Portfolio'}</h2>

      {isAdmin && (
        <form className="manager-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Image URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Category (e.g., Wedding)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <button type="submit">Add Photo</button>
        </form>
      )}

      <h3>Photo Gallery</h3>
      {photos.length > 0 ? (
        <div
          className="photo-carousel"
          role="region"
          aria-label="Photo gallery slideshow"
          aria-roledescription="carousel"
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
          onFocusCapture={() => setIsCarouselPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsCarouselPaused(false);
          }}
        >
          <div className="photo-slide" key={activePhoto.id ?? displayedIndex} aria-live="polite">
            <div className="photo-image-frame">
              <img
                src={activePhoto.url}
                alt={`Photo ${displayedIndex + 1} of ${photos.length}${activePhoto.category ? `, ${activePhoto.category}` : ''}`}
              />
            </div>
            <div className="photo-slide-caption">
              <div>
                <span className="photo-slide-count">{String(displayedIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>
                <p><b>{activePhoto.category || 'Portfolio'}</b></p>
              </div>
              {isAdmin && (
                <button type="button" className="delete-button" onClick={() => handleDelete(activePhoto)}>
                  Delete photo
                </button>
              )}
            </div>
          </div>
          {photos.length > 1 && (
            <div className="carousel-controls">
              <button
                type="button"
                className="carousel-arrow"
                aria-label="Previous photo"
                onClick={() => setActiveIndex((displayedIndex - 1 + photos.length) % photos.length)}
              >
                ←
              </button>
              <div className="carousel-dots" aria-label="Choose a photo">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    className={`carousel-dot${index === displayedIndex ? ' is-active' : ''}`}
                    aria-label={`Show photo ${index + 1}`}
                    aria-current={index === displayedIndex ? 'true' : undefined}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="carousel-arrow"
                aria-label="Next photo"
                onClick={() => setActiveIndex((displayedIndex + 1) % photos.length)}
              >
                →
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="empty-gallery">Photos will appear here once they are added.</p>
      )}
    </section>
  );
}