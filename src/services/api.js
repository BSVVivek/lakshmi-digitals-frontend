
import axios from 'axios';

// Local development uses localhost.
// Deployed builds must have VITE_API_URL configured.
const API_BASE_URL = (
    import.meta.env.VITE_API_URL?.trim() ||
    (import.meta.env.DEV ? 'http://localhost:8080' : '')
).replace(/\/+$/, '');

if (!API_BASE_URL) {
    throw new Error(
        'VITE_API_URL is missing. Configure it in Vercel and redeploy.'
    );
}

const API = axios.create({
    baseURL: API_BASE_URL,
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

// Attach admin authorization to API requests.
API.interceptors.request.use(
    (config) => {
        if (adminAuthorization) {
            config.headers.Authorization = adminAuthorization;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Authenticate administrator with Spring Security.
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

// Clear credentials during logout.
export function clearAdminCredentials() {
    adminAuthorization = null;
}

export default API;
