import axios from 'axios';

const api = axios.create({
  // Connect to backend API server
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.1.5:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
