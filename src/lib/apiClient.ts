import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://makebrainers.com/api';


const apiClient = axios.create({
  baseURL: API_URL,
});

// Use an interceptor to add the auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
