import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lernevo-backend-prod-1025793460743.asia-southeast1.run.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
