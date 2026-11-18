import { useCallback, useEffect, useRef, useState } from 'react';
import API from '../services/api';
import './BackendStatus.css';

const backendLabels = {
    checking: 'Checking...',
    waking: 'Backend Waking Up',
    live: 'Backend Live',
    offline: 'Backend Offline',
};

const databaseLabels = {
    checking: 'Database Checking',
    connected: 'Database Connected',
    disconnected: 'Database Disconnected',
    unknown: 'Database Status Unknown',
};

export default function BackendStatus({ onBackendLive }) {
    const [backendState, setBackendState] = useState('checking');
    const [databaseState, setDatabaseState] = useState('checking');

    const isMountedRef = useRef(false);
    const hasStartedRef = useRef(false);
    const hasBeenLiveRef = useRef(false);
    const backendRequestRef = useRef(null);
    const databaseRequestRef = useRef(null);

    const checkBackend = useCallback(async () => {
        if (backendRequestRef.current) return;

        if (!isMountedRef.current) return;
        if (!hasBeenLiveRef.current) {
            setBackendState('waking');
        }

        const request = (async () => {
            try {
                const response = await API.get('/api/ping', { timeout: 15000 });
                if (!isMountedRef.current) return;

                if (response.data?.status === 'UP') {
                    setBackendState('live');
                    if (!hasBeenLiveRef.current) {
                        hasBeenLiveRef.current = true;
                        onBackendLive?.(true);
                    }
                } else {
                    setBackendState('waking');
                }
            } catch {
                if (isMountedRef.current) {
                    setBackendState('offline');
                }
            }
        })();

        backendRequestRef.current = request;
        try {
            await request;
        } finally {
            if (backendRequestRef.current === request) {
                backendRequestRef.current = null;
            }
        }
    }, [onBackendLive]);

    const checkDatabase = useCallback(async () => {
        if (databaseRequestRef.current) return;

        if (!isMountedRef.current) return;

        const request = (async () => {
            try {
                const response = await API.get('/api/health', { timeout: 10000 });
                if (!isMountedRef.current) return;

                if (response.data?.database === 'UP') {
                    setDatabaseState('connected');
                } else if (response.data?.database === 'DOWN') {
                    setDatabaseState('disconnected');
                } else {
                    setDatabaseState('unknown');
                }
            } catch {
                if (isMountedRef.current) {
                    setDatabaseState('unknown');
                }
            }
        })();

        databaseRequestRef.current = request;
        try {
            await request;
        } finally {
            if (databaseRequestRef.current === request) {
                databaseRequestRef.current = null;
            }
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;

        if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            checkBackend();
            checkDatabase();
        }

        const intervalId = window.setInterval(() => {
            checkBackend();
        }, 30000);

        return () => {
            isMountedRef.current = false;
            window.clearInterval(intervalId);
        };
    }, [checkBackend, checkDatabase]);

    return (
        <div className="backend-status-panel">
            <div
                className={`backend-status-item backend-state-${backendState}`}
                role="status"
                aria-label={backendLabels[backendState]}
                title={backendLabels[backendState]}
            >
                <span className="backend-status-dot" aria-hidden="true" />
                {backendState !== 'live' && <span>{backendLabels[backendState]}</span>}
            </div>

            <div
                className={`database-status-item database-state-${databaseState}`}
                role="status"
                aria-label={databaseLabels[databaseState]}
                title={databaseLabels[databaseState]}
            >
                <svg
                    className="database-status-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <path d="M12 3C7.03 3 3 4.34 3 6s4.03 3 9 3 9-1.34 9-3-4.03-3-9-3Z" />
                    <path d="M3 6v12c0 1.66 4.03 3 9 3s9-1.34 9-3V6" />
                    <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
                    <path d="M3 17.5c0 1.66 4.03 3 9 3s9-1.34 9-3" />
                </svg>
                {databaseState !== 'connected' && <span>{databaseLabels[databaseState]}</span>}
            </div>
        </div>
    );
}
