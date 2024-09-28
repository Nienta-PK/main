// axiosInstance.js
import axios from 'axios';
import { getSession } from 'next-auth/react';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
});

// Add a request interceptor to include the token in the headers
axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session && session.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 Unauthorized responses
axiosInstance.interceptors.response.use(
  (response) => response, // If the response is successful, just return it
  (error) => {
    if (error.response && error.response.status === 401) {
      // If the response status is 401 (Unauthorized), redirect to login
      // Optionally, you can sign out the user
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
