import { useEffect, useState } from 'react';
import Home from './components/Home';
import PhotoManager from './components/PhotoManager';
import EventManager from './components/EventManager';
import BookingManager from './components/BookingManager';
import TestimonialManager from './components/TestimonialManager';
import './App.css';

const sections = [
  { id: 'home', label: 'Home' },
  { id: 'photos', label: 'Portfolio' },
  { id: 'events', label: 'Events' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'testimonials', label: 'Customer Reviews' },
];

const pages = {
  home: Home,
  photos: PhotoManager,
  events: EventManager,
  bookings: BookingManager,
  testimonials: TestimonialManager,
};

const ADMIN_PIN = 'Nagamani@9963';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isThemeRippling, setIsThemeRippling] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => window.localStorage.getItem('lakshmi-digitals-theme') === 'dark',
  );
  const ActivePage = pages[activeTab];

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    document.documentElement.dataset.admin = String(isAdmin);
    window.localStorage.setItem('lakshmi-digitals-theme', darkMode ? 'dark' : 'light');
  }, [darkMode, isAdmin]);

  const handleAdminMode = () => {
    if (isAdmin) {
      setIsAdmin(false);
      return;
    }

    setPin('');
    setPinError('');
    setIsPinDialogOpen(true);
  };

  const handlePinSubmit = (event) => {
    event.preventDefault();
    if (pin !== ADMIN_PIN) {
      setPin('');
      setPinError('Incorrect PIN. Please try again.');
      return;
    }
    setIsAdmin(true);
    setIsPinDialogOpen(false);
    setPinError('');
  };

  return (
    <div className={`app-shell${isAdmin ? ' admin-view' : ''}`}>
      <header className="site-header">
        <a
          className="brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            setActiveTab('home');
          }}
          aria-label="Lakshmi Digitals home"
        >
          <span className="brand-mark" aria-hidden="true">L</span>
          <span className="brand-copy">
            <strong>LAKSHMI DIGITALS</strong>
            <small>PHOTOGRAPHY & VIDEOGRAPHY</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`nav-link${activeTab === section.id ? ' is-active' : ''}`}
              aria-current={activeTab === section.id ? 'page' : undefined}
              onClick={() => setActiveTab(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className={`theme-toggle${isThemeRippling ? ' is-rippling' : ''}`}
          onClick={() => {
            setIsThemeRippling(true);
            setDarkMode((isDark) => !isDark);
            window.setTimeout(() => setIsThemeRippling(false), 720);
          }}
          aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        >
          <span aria-hidden="true">{darkMode ? '☼' : '☾'}</span>
          <span className="theme-label">{darkMode ? 'Light' : 'Dark'}</span>
        </button>
        <div className="access-controls">
          <span className={`view-badge${isAdmin ? ' admin' : ''}`}>
            {isAdmin ? 'Admin View' : 'Customer View'}
          </span>
          <button type="button" className="admin-toggle" onClick={handleAdminMode}>
            {isAdmin ? 'Exit Admin' : 'Admin Login'}
          </button>
        </div>
      </header>

      <main className="page-content" key={activeTab}>
        <ActivePage isAdmin={isAdmin} />
      </main>
      {isPinDialogOpen && (
        <div className="pin-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsPinDialogOpen(false);
        }}>
          <section
            className="pin-dialog popup-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pin-dialog-title"
          >
            <p className="profile-kicker">RESTRICTED AREA</p>
            <h2 id="pin-dialog-title">Admin access</h2>
            <p>Enter your PIN to manage studio content.</p>
            <form onSubmit={handlePinSubmit}>
              <label htmlFor="admin-pin">Admin PIN</label>
              <input
                autoFocus
                id="admin-pin"
                type="password"
                autoComplete="current-password"
                value={pin}
                onChange={(event) => {
                  setPin(event.target.value);
                  setPinError('');
                }}
                aria-describedby={pinError ? 'pin-error' : undefined}
                required
              />
              {pinError && <p className="pin-error" id="pin-error" role="alert">{pinError}</p>}
              <div className="pin-actions">
                <button type="button" className="pin-cancel" onClick={() => setIsPinDialogOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="pin-submit">Unlock Admin</button>
              </div>
            </form>
          </section>
        </div>
      )}
      <footer className="site-footer">
        <span>Lakshmi Digitals</span>
        <span>Photography · Videography · Stories</span>
      </footer>
    </div>
  );
}

export default App;
