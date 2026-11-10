import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function BookingManager({ isAdmin }) {
  const [bookings, setBookings] = useState([]);
  const [clientName, setClientName] = useState('');
  const [contact, setContact] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  async function fetchBookings() {
    try {
      const response = await API.get('/bookings');
      if (!Array.isArray(response.data)) {
        console.error('Expected /bookings to return an array, received:', response.data);
        setBookings([]);
        return;
      }
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/bookings', {
        clientName,
        contact,
        eventDate,
        status: isAdmin ? status : 'Pending',
      });
      setClientName('');
      setContact('');
      setEventDate('');
      setStatus('Pending');
      await fetchBookings();
    } catch (error) {
      console.error('Error saving booking:', error);
      window.alert('Could not save the booking. Please try again.');
    }
  };

  const handleStatusChange = async (booking, nextStatus) => {
    setUpdatingBookingId(booking.id);
    try {
      await API.put(`/bookings/${booking.id}/status`, { status: nextStatus });
      setBookings((currentBookings) => currentBookings.map((item) => (
        item.id === booking.id ? { ...item, status: nextStatus } : item
      )));
    } catch (error) {
      console.error('Error updating booking status:', error);
      window.alert('Could not update the booking status. Please try again.');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleDelete = async (booking) => {
    if (!window.confirm(`Delete the booking request from ${booking.clientName}?`)) return;
    try {
      await API.delete(`/bookings/${booking.id}`);
      await fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      window.alert('Could not delete the booking. Please try again.');
    }
  };

  return (
    <section className="manager-page popup-container">
      <h2>{isAdmin ? 'Manage Bookings' : 'Request a Booking'}</h2>
      <form className="manager-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
        <input type="text" placeholder="Contact" value={contact} onChange={(e) => setContact(e.target.value)} required />
        <input type="text" placeholder="Event Date (dd-MM-yyyy HH:mm:ss)" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
        {isAdmin && (
          <select aria-label="New booking status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Rejected">Rejected</option>
          </select>
        )}
        <button type="submit">Add Booking</button>
      </form>

      <h3>{isAdmin ? 'All Bookings' : 'Booking Requests'}</h3>
      <ul className="manager-list">
        {bookings.map((b) => (
          <li key={b.id}>
            <div className="booking-summary">
              <span>
                <b>{b.clientName}</b> ({b.contact}) - {b.eventDate}
              </span>
              {isAdmin ? (
                <label className="booking-status-control">
                  <span>Status</span>
                  <select
                    value={normalizeStatus(b.status)}
                    onChange={(event) => handleStatusChange(b, event.target.value)}
                    disabled={updatingBookingId === b.id}
                    aria-label={`Update status for ${b.clientName}'s booking`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  {updatingBookingId === b.id && <span className="status-saving">Saving…</span>}
                </label>
              ) : (
                <span className={`booking-status-badge ${statusClass(b.status)}`}>
                  {displayStatus(b.status)}
                </span>
              )}
            </div>
            {isAdmin && (
              <button type="button" className="delete-button" onClick={() => handleDelete(b)}>
                Delete booking
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function normalizeStatus(status) {
  const normalized = String(status ?? '').trim().toLowerCase();
  if (normalized === 'confirmed') return 'Confirmed';
  if (normalized === 'rejected') return 'Rejected';
  return 'Pending';
}

function displayStatus(status) {
  const value = String(status ?? '').trim();
  return value || 'Pending';
}

function statusClass(status) {
  return normalizeStatus(status).toLowerCase();
}