
import axios from 'axios';

const API = axios.create({
    baseURL: (
        import.meta.env.VITE_API_URL || 'http://localhost:8080'
    ).replace(/\/+$/, ''),
});

// Admin authorization is held in memory only.
let adminAuthorization = null;

// Encode UTF-8 credentials for HTTP Basic authentication.
function encodeBasicCredentials(username, password) {
    const bytes = new TextEncoder().encode(
        `${username}:${password}`
    );

    let binary = '';

    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary);
}

// Attach authorization to API requests after successful login.
API.interceptors.request.use(
    (config) => {
        if (adminAuthorization) {
            config.headers.Authorization = adminAuthorization;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Verify administrator credentials with Spring Security.
export async function authenticateAdmin(username, password) {
    adminAuthorization = null;

    const response = await API.get('/api/admin/check', {
        auth: {
            username,
            password,
        },
    });

    // Save credentials only after successful authentication.
    adminAuthorization = `Basic ${
        encodeBasicCredentials(username, password)
    }`;

    return response.data;
}

// Logout.
export function clearAdminCredentials() {
    adminAuthorization = null;
}

export default API;
