// Central API base URL — set VITE_API_BASE_URL in your .env or Docker environment
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';

export default API_BASE;
