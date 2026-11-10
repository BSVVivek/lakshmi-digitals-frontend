import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function EventManager({ isAdmin }) {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [now] = useState(() => Date.now());

  async function fetchEvents() {
    try {
      const response = await API.get('/events');
      if (!Array.isArray(response.data)) {
        console.error('Expected /events to return an array, received:', response.data);
        setEvents([]);
        return;
      }
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/events', { title, date, location, description });
      setTitle('');
      setDate('');
      setLocation('');
      setDescription('');
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete the event "${event.title}"?`)) return;
    try {
      await API.delete(`/events/${event.id}`);
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      window.alert('Could not delete the event. Please try again.');
    }
  };

  const upcomingEvents = events.filter((event) => {
    const eventDate = parseEventDate(event.date);
    return !eventDate || eventDate.getTime() >= now;
  });

  return (
    <section className="manager-page popup-container">
      <h2>{isAdmin ? 'Manage Events' : 'Upcoming Events'}</h2>
      {isAdmin && (
        <form className="manager-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="text" placeholder="Date (dd-MM-yyyy HH:mm:ss)" value={date} onChange={(e) => setDate(e.target.value)} required />
          <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button type="submit">Add Event</button>
        </form>
      )}

      <h3>{isAdmin ? 'Events List' : 'Events'}</h3>
      <ul className="manager-list">
        {upcomingEvents.map((ev) => (
          <li key={ev.id}>
            <b>{ev.title}</b> at {ev.location} on {ev.date}
            <p>{ev.description}</p>
            {isAdmin && (
              <button type="button" className="delete-button" onClick={() => handleDelete(ev)}>
                Delete event
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function parseEventDate(value) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const match = /^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(value ?? '');
  if (!match) return null;

  const [, day, month, year, hour = '00', minute = '00', second = '00'] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  return Number.isNaN(date.getTime()) ? null : date;
}