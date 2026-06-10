// api.js
import axios from "axios";
import { API_BASE_URL } from "./config";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 180000, // ✅ Changed from 30000 to 180000 (3 minutes)
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Token ${token}`;
      console.log(`✅ Token added to request: ${config.url}`);
    } else {
      console.log(`⚠️ No token found for request: ${config.url}`);
    }
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('Unauthorized! Clearing tokens...');
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_code');
      localStorage.removeItem('user_email');
      
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth?mode=login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;