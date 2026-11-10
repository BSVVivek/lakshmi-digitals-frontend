import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function TestimonialManager({ isAdmin }) {
  const [testimonials, setTestimonials] = useState([]);
  const [clientName, setClientName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState('');

  async function fetchTestimonials() {
    try {
      const response = await API.get('/testimonials');
      if (!Array.isArray(response.data)) {
        console.error('Expected /testimonials to return an array, received:', response.data);
        setTestimonials([]);
        return;
      }
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  }

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const ratings = testimonials
    .map((testimonial) => Number(testimonial.rating))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= 5);
  const averageRating = ratings.length
    ? (ratings.reduce((total, value) => total + value, 0) / ratings.length).toFixed(1)
    : '—';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/testimonials', { clientName, feedback, rating: Number(rating) });
      setClientName('');
      setFeedback('');
      setRating('');
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const handleDelete = async (testimonial) => {
    if (!window.confirm(`Delete the review from ${testimonial.clientName}?`)) return;
    try {
      await API.delete(`/testimonials/${testimonial.id}`);
      await fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      window.alert('Could not delete the review. Please try again.');
    }
  };

  return (
    <section className="manager-page popup-container">
      <h2>{isAdmin ? 'Manage Testimonials' : 'Client Testimonials'}</h2>
      <div className="testimonial-stats" aria-label="Testimonial summary">
        <article className="testimonial-stat">
          <span className="stat-icon" aria-hidden="true">✦</span>
          <div>
            <strong>{testimonials.length}</strong>
            <span>Total reviews</span>
          </div>
        </article>
        <article className="testimonial-stat">
          <span className="stat-icon" aria-hidden="true">★</span>
          <div>
            <strong>{averageRating}<small>{averageRating === '—' ? '' : ' / 5'}</small></strong>
            <span>Average rating{ratings.length ? ` · ${ratings.length} rated` : ''}</span>
          </div>
        </article>
      </div>
      <form className="manager-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
        <input type="text" placeholder="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} required />
        <input type="number" placeholder="Rating (1-5)" value={rating} onChange={(e) => setRating(e.target.value)} min="1" max="5" required />
        <button type="submit">Add Testimonial</button>
      </form>

      <h3>Reviews</h3>
      <ul className="manager-list">
        {testimonials.map((t) => (
          <li key={t.id}>
            <b>{t.clientName}</b> - ⭐ {t.rating}/5
            <p>"{t.feedback}"</p>
            {isAdmin && (
              <button type="button" className="delete-button" onClick={() => handleDelete(t)}>
                Delete review
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}