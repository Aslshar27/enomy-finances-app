// Centralized API URL configuration
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://unique-intuition-production.up.railway.app"; // Railway backend for production

export default API_BASE_URL;