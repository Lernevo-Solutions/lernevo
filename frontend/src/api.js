// ✅ இப்போ $BACKEND_URL கிடைச்சது — api.js-ல update பண்ணு
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lernevo-backend-771297649928.us-central1.run.app/api',  // $BACKEND_URL paste பண்ணு
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
