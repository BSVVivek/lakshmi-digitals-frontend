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
  const [statusEmailNotice, setStatusEmailNotice] = useState(null);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [confirmedDatesError, setConfirmedDatesError] = useState('');
  const [bookingFilter, setBookingFilter] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingCount, setBookingCount] = useState(null);
  const [bookingCountError, setBookingCountError] = useState('');

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
    const timeoutId = window.setTimeout(() => setIsSuccessOpen(false), 15000);
    return () => window.clearTimeout(timeoutId);
  }, [isSuccessOpen]);

  useEffect(() => {
    if (!statusEmailNotice) return undefined;
    const timeoutId = window.setTimeout(() => setStatusEmailNotice(null), 10000);
    return () => window.clearTimeout(timeoutId);
  }, [statusEmailNotice]);

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

  async function fetchBookingCount() {
    try {
      const response = await API.get('/bookings/count');
      const count = typeof response.data === 'number' ? response.data : response.data?.count;
      if (!Number.isInteger(count) || count < 0) {
        throw new Error('Expected /bookings/count to return a non-negative integer.');
      }
      setBookingCount(count);
      setBookingCountError('');
    } catch (error) {
      console.error('Error fetching booking count:', error);
      setBookingCountError('Could not load the total booking count.');
    }
  }

  useEffect(() => {
    if (!isAdmin) {
        setBookings([]);
        setConfirmedBookings([]);
        setConfirmedDatesError('');
        fetchBookingCount();
        return undefined;
    }

    fetchBookings();
    fetchConfirmedDates();
    return undefined;
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

      if (isAdmin) {
        await fetchBookings();
      } else {
        await fetchBookingCount();
      }
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
      if (normalizeStatus(booking.status) === 'Pending' && ['Confirmed', 'Rejected'].includes(nextStatus)) {
        setStatusEmailNotice({ booking, status: nextStatus });
      }
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
          <option value="Half Saree Function">Half Saree Function</option>
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

      {isAdmin && <h3>All Bookings</h3>}
      {!isAdmin && (
        <div className="testimonial-stat booking-total-stat" aria-live="polite">
          <span className="stat-icon" aria-hidden="true">#</span>
          <div>
            <strong>{bookingCount === null ? '—' : bookingCount}</strong>
            <span>Total bookings so far</span>
            {bookingCountError && <span role="alert">{bookingCountError}</span>}
          </div>
          <button type="button" onClick={fetchBookingCount}>Refresh</button>
        </div>
      )}
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
          <input
            className="booking-search"
            type="search"
            placeholder="Search bookings"
            aria-label="Search bookings by name, contact, email, event, or date"
            value={bookingSearch}
            onChange={(event) => setBookingSearch(event.target.value)}
          />
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
          .filter((booking) => {
            const query = bookingSearch.trim().toLocaleLowerCase();
            if (!isAdmin || !query) return true;
            return [
              booking.clientName,
              booking.contact,
              booking.email,
              booking.eventType,
              booking.eventDate,
              booking.status,
            ].some((value) => String(value ?? '').toLocaleLowerCase().includes(query));
          })
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
      {statusEmailNotice && (
        <div className="booking-success-backdrop">
          <section
            className="booking-success-dialog booking-status-notice-dialog popup-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-status-notice-title"
          >
            <h2 id="booking-status-notice-title">Booking {statusEmailNotice.status}</h2>
            <p>Email sent to the customer about their booking status.</p>
            <dl className="booking-status-notice-details">
              <div>
                <dt>Customer</dt>
                <dd>{statusEmailNotice.booking.clientName || '—'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{statusEmailNotice.booking.email || '—'}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{statusEmailNotice.booking.contact || '—'}</dd>
              </div>
              <div>
                <dt>Event</dt>
                <dd>{statusEmailNotice.booking.eventType || '—'}</dd>
              </div>
              <div>
                <dt>Event date</dt>
                <dd>{statusEmailNotice.booking.eventDate || '—'}</dd>
              </div>
            </dl>
            <button type="button" onClick={() => setStatusEmailNotice(null)}>OK</button>
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