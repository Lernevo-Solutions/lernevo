import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lernevo-frontend-771297649928.us-central1.run.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
