
import { useEffect, useState } from 'react';

import Home from './components/Home';
import PhotoManager from './components/PhotoManager';
import EventManager from './components/EventManager';
import BookingManager from './components/BookingManager';
import TestimonialManager from './components/TestimonialManager';

import {
    authenticateAdmin,
    clearAdminCredentials,
} from './services/api';

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

function App() {

    const [activeTab, setActiveTab] = useState('home');

    const [isAdmin, setIsAdmin] = useState(false);

    const [isLoginDialogOpen, setIsLoginDialogOpen] =
        useState(false);

    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const [isThemeRippling, setIsThemeRippling] =
        useState(false);

    const [darkMode, setDarkMode] = useState(
        () =>
            window.localStorage.getItem(
                'lakshmi-digitals-theme'
            ) === 'dark'
    );

    const ActivePage = pages[activeTab];

    // Update theme and admin appearance.
    useEffect(() => {

        document.documentElement.dataset.theme =
            darkMode ? 'dark' : 'light';

        document.documentElement.dataset.admin =
            String(isAdmin);

        window.localStorage.setItem(
            'lakshmi-digitals-theme',
            darkMode ? 'dark' : 'light'
        );

    }, [darkMode, isAdmin]);

    // Open login dialog or log out.
    const handleAdminMode = () => {

        if (isAdmin) {

            clearAdminCredentials();

            setIsAdmin(false);

            // Return to the public home page after logout.
            setActiveTab('home');

            return;
        }

        setAdminUsername('');
        setAdminPassword('');
        setLoginError('');

        setIsLoginDialogOpen(true);
    };

    // Close login dialog.
    const closeLoginDialog = () => {

        if (isLoggingIn) {
            return;
        }

        setIsLoginDialogOpen(false);

        setAdminUsername('');
        setAdminPassword('');
        setLoginError('');
    };

    // Authenticate administrator using Spring Security.
    const handleAdminLogin = async (event) => {

        event.preventDefault();

        if (!adminUsername.trim() || !adminPassword) {

            setLoginError(
                'Please enter your username and password.'
            );

            return;
        }

        setIsLoggingIn(true);
        setLoginError('');

        try {

            await authenticateAdmin(
                adminUsername.trim(),
                adminPassword
            );

            // Authentication successful.
            // Axios now attaches the Authorization header.
            setIsAdmin(true);

            setIsLoginDialogOpen(false);

            setAdminUsername('');
            setAdminPassword('');
            setLoginError('');

            console.log('Administrator authenticated successfully.');

        } catch (error) {

            console.error(
                'Admin authentication failed:',
                error.response?.status || error.message
            );

            if (error.response?.status === 401) {

                setLoginError(
                    'Incorrect username or password.'
                );

            } else if (error.response?.status === 403) {

                setLoginError(
                    'Access denied. Please check your administrator account.'
                );

            } else {

                setLoginError(
                    'Unable to connect to the backend. Please try again.'
                );
            }

        } finally {

            setIsLoggingIn(false);
        }
    };

    return (

        <div className={`app-shell${isAdmin ? ' admin-view' : ''}`}>

            {/* Header */}

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

                    <span className="brand-mark" aria-hidden="true">
                        L
                    </span>

                    <span className="brand-copy">
                        <strong>LAKSHMI DIGITALS</strong>
                        <small>PHOTOGRAPHY & VIDEOGRAPHY</small>
                    </span>

                </a>

                {/* Main navigation */}

                <nav
                    className="main-nav"
                    aria-label="Main navigation"
                >

                    {sections.map((section) => (

                        <button
                            key={section.id}
                            type="button"
                            className={`nav-link${
                                activeTab === section.id
                                    ? ' is-active'
                                    : ''
                            }`}
                            aria-current={
                                activeTab === section.id
                                    ? 'page'
                                    : undefined
                            }
                            onClick={() => setActiveTab(section.id)}
                        >
                            {section.label}
                        </button>

                    ))}

                </nav>

                {/* Theme toggle */}

                <button
                    type="button"
                    className={`theme-toggle${
                        isThemeRippling ? ' is-rippling' : ''
                    }`}
                    onClick={() => {

                        setIsThemeRippling(true);

                        setDarkMode((isDark) => !isDark);

                        window.setTimeout(
                            () => setIsThemeRippling(false),
                            720
                        );
                    }}
                    aria-label={`Switch to ${
                        darkMode ? 'light' : 'dark'
                    } mode`}
                    title={`Switch to ${
                        darkMode ? 'light' : 'dark'
                    } mode`}
                >

                    <span aria-hidden="true">
                        {darkMode ? '☼' : '☾'}
                    </span>

                    <span className="theme-label">
                        {darkMode ? 'Light' : 'Dark'}
                    </span>

                </button>

                {/* Admin controls */}

                <div className="access-controls">

                    <span
                        className={`view-badge${
                            isAdmin ? ' admin' : ''
                        }`}
                    >
                        {isAdmin ? 'Admin View' : 'Customer View'}
                    </span>

                    <button
                        type="button"
                        className="admin-toggle"
                        onClick={handleAdminMode}
                    >
                        {isAdmin ? 'Exit Admin' : 'Admin Login'}
                    </button>

                </div>

            </header>

            {/* Active page */}

            <main className="page-content" key={activeTab}>

                <ActivePage isAdmin={isAdmin} />

            </main>

            {/* Administrator login dialog */}

            {isLoginDialogOpen && (

                <div
                    className="pin-backdrop"
                    onMouseDown={(event) => {

                        if (
                            event.target === event.currentTarget
                        ) {
                            closeLoginDialog();
                        }
                    }}
                >

                    <section
                        className="pin-dialog popup-container"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-login-title"
                    >

                        <p className="profile-kicker">
                            RESTRICTED AREA
                        </p>

                        <h2 id="admin-login-title">
                            Admin access
                        </h2>

                        <p>
                            Sign in to manage Lakshmi Digital Studios.
                        </p>

                        <form onSubmit={handleAdminLogin}>

                            {/* Username */}

                            <label htmlFor="admin-username">
                                Admin Username
                            </label>

                            <input
                                autoFocus
                                className="admin-login-input"
                                id="admin-username"
                                type="text"
                                autoComplete="username"
                                value={adminUsername}
                                onChange={(event) => {
                                    setAdminUsername(
                                        event.target.value
                                    );

                                    setLoginError('');
                                }}
                                required
                            />

                            {/* Password */}

                            <label htmlFor="admin-password">
                                Admin Password
                            </label>

                            <input
                                className="admin-login-input"
                                id="admin-password"
                                type="password"
                                autoComplete="current-password"
                                value={adminPassword}
                                onChange={(event) => {
                                    setAdminPassword(
                                        event.target.value
                                    );

                                    setLoginError('');
                                }}
                                required
                            />

                            {/* Login error */}

                            {loginError && (

                                <p
                                    className="pin-error"
                                    role="alert"
                                >
                                    {loginError}
                                </p>

                            )}

                            {/* Actions */}

                            <div className="pin-actions">

                                <button
                                    type="button"
                                    className="pin-cancel"
                                    onClick={closeLoginDialog}
                                    disabled={isLoggingIn}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="pin-submit"
                                    disabled={isLoggingIn}
                                >
                                    {isLoggingIn
                                        ? 'Verifying...'
                                        : 'Login'}
                                </button>

                            </div>

                        </form>

                    </section>

                </div>

            )}

            {/* Footer */}

            <footer className="site-footer">

                <span>Lakshmi Digitals</span>

                <span>
                    Photography · Videography · Stories
                </span>

            </footer>

        </div>
    );
}

export default App;
