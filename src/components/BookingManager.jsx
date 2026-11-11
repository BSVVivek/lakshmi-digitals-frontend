import React, { useState, useEffect } from 'react';
import API from '../services/api';
import thankYouGif from '../assets/thankyou.gif';
import DateInput from './DateInput';
import { isValidDate } from '../utils/date';
import AdminBookingCalendar from './AdminBookingCalendar';

export default function BookingManager({ isAdmin }) {
  const [bookings, setBookings] = useState([]);
  const [clientName, setClientName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [confirmedDatesError, setConfirmedDatesError] = useState('');
  const [bookingFilter, setBookingFilter] = useState('All');

  async function fetchConfirmedDates() {
    try {
      const response = await API.get('/bookings/confirmed-dates');
      const data = normalizeConfirmedBookings(response.data);
      setConfirmedBookings(data);
      setConfirmedDatesError('');
    } catch (error) {
      console.error('Error fetching confirmed booking dates:', error);
      setConfirmedDatesError('Could not load confirmed booking dates.');
    }
  }

  useEffect(() => {
    if (!isSuccessOpen) return undefined;
    const timeoutId = window.setTimeout(() => setIsSuccessOpen(false), 10000);
    return () => window.clearTimeout(timeoutId);
  }, [isSuccessOpen]);

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
    if (isAdmin) fetchConfirmedDates();
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidDate(eventDate)) {
      window.alert('Please enter a valid event date in dd-MM-yyyy format.');
      return;
    }
    try {
      await API.post('/bookings', {
        clientName,
        contact,
        email,
        eventType,
        eventDate,
        status: isAdmin ? status : 'Pending',
      });
      setClientName('');
      setContact('');
      setEmail('');
      setEventType('');
      setEventDate('');
      setStatus('Pending');
      setIsSuccessOpen(true);
      await fetchBookings();
    } catch (error) {
      console.error('Error saving booking:', error);
      const responseMessage = error.response?.data;
      const message = typeof responseMessage === 'string'
        ? responseMessage
        : responseMessage?.message;
      window.alert(message || 'Could not save the booking. Please try again.');
    }
  };

  const handleStatusChange = async (booking, nextStatus) => {
    setUpdatingBookingId(booking.id);
    try {
      await API.put(`/bookings/${booking.id}/status`, { status: nextStatus });
      setBookings((currentBookings) => currentBookings.map((item) => (
        item.id === booking.id ? { ...item, status: nextStatus } : item
      )));
      await fetchConfirmedDates();
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
        <input
          type="text"
          placeholder="Client Name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value.replace(/[0-9]/g, ''))}
          pattern="[^0-9]+"
          title="Please enter a name without numbers."
          required
        />
        <input
          type="tel"
          placeholder="10-digit Contact"
          value={contact}
          onChange={(e) => setContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
          inputMode="numeric"
          pattern="[0-9]{10}"
          title="Please enter exactly 10 digits."
          maxLength={10}
          required
        />
        <input
          type="email"
          placeholder="Email (you'll receive updates at this address)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <select
          aria-label="Event type"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          required
        >
          <option value="" disabled>Select event type</option>
          <option value="Birthday">Birthday</option>
          <option value="Marriage">Marriage</option>
          <option value="Engagement">Engagement</option>
          <option value="Reception">Reception</option>
          <option value="Ooni Function">Ooni Function</option>
          <option value="Mature Function">Mature Function</option>
          <option value="Housewarming Ceremony">Housewarming Ceremony</option>
          <option value="Party">Party</option>
          <option value="Event">Event</option>
          <option value="Other">Other</option>
        </select>
        <DateInput
          id="booking-event-date"
          label="Event date"
          value={eventDate}
          onChange={setEventDate}
          required
        />
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
      {isAdmin && (
        <div className="booking-list-toolbar">
          <label>
            <span>Filter by status</span>
            <select value={bookingFilter} onChange={(event) => setBookingFilter(event.target.value)}>
              <option>All</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Rejected</option>
            </select>
          </label>
          <AdminBookingCalendar
            bookings={confirmedBookings}
            fallbackBookings={bookings.filter((booking) => normalizeStatus(booking.status) === 'Confirmed')}
            error={confirmedDatesError}
            onRefresh={fetchConfirmedDates}
          />
        </div>
      )}
      <ul className="manager-list">
        {bookings
          .filter((booking) => !isAdmin || bookingFilter === 'All' || normalizeStatus(booking.status) === bookingFilter)
          .map((b) => (
          <li key={b.id}>
            <div className="booking-summary">
              <span>
                <b>{b.clientName}</b> ({b.contact}) - {b.eventDate}
                {isAdmin && (
                  <>
                    <br />
                    {b.email} · {b.eventType}
                  </>
                )}
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
      {isSuccessOpen && (
        <div className="booking-success-backdrop">
          <section
            className="booking-success-dialog popup-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-success-title"
          >
            <h2 id="booking-success-title">Thank you for booking!</h2>
            <p>Your booking request has been received. The photographer R. NagaBabu will reach out to you soon.</p>
            <img src={thankYouGif} alt="Thank you" />
            <button type="button" onClick={() => setIsSuccessOpen(false)}>OK</button>
          </section>
        </div>
      )}
    </section>
  );
}

function normalizeConfirmedBookings(payload) {
  const candidates = [
    payload,
    payload?.confirmedDates,
    payload?.bookings,
    payload?.booking,
    payload?.data,
  ];
  const result = candidates.find((candidate) => (
    Array.isArray(candidate)
      || (candidate && typeof candidate === 'object' && (candidate.eventDate || candidate.date))
  ));
  if (!result) {
    throw new Error('Expected confirmed dates endpoint to return a booking or booking list.');
  }
  return Array.isArray(result) ? result : [result];
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