import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lernevo-backend-staging-771297649928.us-central1.run.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
