import { useEffect, useMemo, useRef, useState } from 'react';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminBookingCalendar({ bookings, fallbackBookings, error, onRefresh }) {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState('');
  const [isRippling, setIsRippling] = useState(false);
  const rippleTimer = useRef(null);

  const bookingsByDate = useMemo(() => {
    const grouped = new Map();
    bookings.forEach((booking) => {
      const date = toDateKey(typeof booking === 'string' ? booking : booking.eventDate ?? booking.date);
      if (!date) return;
      const entries = grouped.get(date) ?? [];
      if (typeof booking === 'string') {
        const matchingBookings = fallbackBookings.filter(
          (item) => toDateKey(item.eventDate) === date,
        );
        entries.push(...(matchingBookings.length
          ? matchingBookings
          : [{ eventDate: booking, clientName: 'Confirmed booking', eventType: '', contact: '' }]));
      } else {
        const matchingBooking = fallbackBookings.find(
          (item) => toDateKey(item.eventDate) === date
            && (!booking.clientName || item.clientName === booking.clientName),
        );
        entries.push(matchingBooking ? { ...matchingBooking, ...booking } : booking);
      }
      grouped.set(date, entries);
    });
    return grouped;
  }, [bookings, fallbackBookings]);

  const monthDays = getMonthDays(month);
  const selectedBookings = bookingsByDate.get(selectedDate) ?? [];

  useEffect(() => () => window.clearTimeout(rippleTimer.current), []);

  const changeMonth = (amount) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
    setSelectedDate('');
  };

  return (
    <div className="admin-calendar-widget">
      <button
        className={`admin-calendar-trigger${isRippling ? ' is-rippling' : ''}`}
        type="button"
        aria-label={isOpen ? 'Close confirmed bookings calendar' : 'Check confirmed booking dates'}
        aria-expanded={isOpen}
        onClick={() => {
          if (!isOpen) onRefresh();
          setIsOpen((open) => !open);
          setIsRippling(true);
          window.clearTimeout(rippleTimer.current);
          rippleTimer.current = window.setTimeout(() => setIsRippling(false), 680);
        }}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
          <path d="M7.5 3.5v3M16.5 3.5v3M4 9.5h16M8 13h2m4 0h2m-8 3.5h2" />
        </svg>
        <span>Check confirmed booking dates</span>
      </button>
      {isOpen && (
        <section className="admin-calendar-popover" aria-label="Confirmed bookings calendar">
          <div className="admin-calendar-heading">
            <h3>Confirmed bookings</h3>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close calendar">×</button>
          </div>
          <div className="admin-calendar-month">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button>
            <strong>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">›</button>
          </div>
          {error && <p className="admin-calendar-error" role="alert">{error}</p>}
          <div className="admin-calendar-grid" role="grid" aria-label="Calendar dates">
            {weekdays.map((day) => <span className="admin-calendar-weekday" key={day}>{day}</span>)}
            {monthDays.map((date, index) => {
              if (!date) return <span className="admin-calendar-empty" key={`empty-${index}`} />;
              const dateKey = toDateKey(date);
              const hasBookings = bookingsByDate.has(dateKey);
              const isSelected = selectedDate === dateKey;
              const dayBookings = bookingsByDate.get(dateKey) ?? [];
              const details = dayBookings.map((booking) => (
                `${booking.clientName || 'Confirmed booking'}${booking.eventType ? ` · ${booking.eventType}` : ''}${booking.contact ? ` · ${booking.contact}` : ''}`
              )).join('\n');
              return (
                <button
                  type="button"
                  role="gridcell"
                  key={dateKey}
                  className={`admin-calendar-day${hasBookings ? ' has-booking' : ''}${isSelected ? ' is-selected' : ''}`}
                  aria-label={`${date.getDate()}${hasBookings ? `, ${dayBookings.length} confirmed booking${dayBookings.length === 1 ? '' : 's'}` : ''}`}
                  title={details || undefined}
                  onMouseEnter={() => hasBookings && setSelectedDate(dateKey)}
                  onFocus={() => hasBookings && setSelectedDate(dateKey)}
                  onClick={() => hasBookings && setSelectedDate(dateKey)}
                >
                  {date.getDate()}
                  {hasBookings && <span className="admin-calendar-dot" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          {selectedBookings.length > 0 && (
            <div className="admin-calendar-details" aria-live="polite">
              <strong>{formatDateKey(selectedDate)}</strong>
              {selectedBookings.map((booking, index) => (
                <p key={`${booking.id ?? booking.clientName ?? 'booking'}-${index}`}>
                  <b>{booking.clientName || 'Confirmed booking'}</b>
                  {booking.eventType && <> · {booking.eventType}</>}
                  {booking.contact && <><br />{booking.contact}</>}
                </p>
              ))}
            </div>
          )}
          {!error && bookings.length === 0 && (
            <p className="admin-calendar-empty-message">No confirmed bookings to display.</p>
          )}
          <button className="admin-calendar-refresh" type="button" onClick={onRefresh}>Refresh dates</button>
        </section>
      )}
    </div>
  );
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthDays(month) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => (
      new Date(month.getFullYear(), month.getMonth(), index + 1)
    )),
  ];
}

function toDateKey(value) {
  if (!value) return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const text = String(value);
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  const formattedMatch = /^(\d{2})-(\d{2})-(\d{4})/.exec(text);
  if (formattedMatch) return `${formattedMatch[3]}-${formattedMatch[2]}-${formattedMatch[1]}`;
  return '';
}

function formatDateKey(value) {
  const [year, month, day] = value.split('-');
  return `${day}-${month}-${year}`;
}
