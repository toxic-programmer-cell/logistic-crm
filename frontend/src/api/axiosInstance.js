import axios from 'axios';

// Create a new Axios instance
const axiosInstance = axios.create({
  baseURL: '/api/v1', // API base URL
  withCredentials: true,
});

// Variable to store the refresh token promise
let isRefreshing = false;
// Array to store failed requests while token is being refreshed
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ✅ Add Authorization header to requests
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Exit early if refresh request itself fails
    if (error.response?.status === 401 && originalRequest.url === '/users/refresh-token') {
        console.error('Refresh token request failed. Logging out.');
        localStorage.removeItem('accessToken');

        window.location.href = '/login';
        return Promise.reject(error);
    }

    // If token is expired (401) and not already retried for a non-refresh-token request
    if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
            // If token is already being refreshed, queue the original request
            return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
            })
            .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosInstance(originalRequest); // Retry with new token
            })
            .catch(err => {
            return Promise.reject(err); // Propagate error if queue processing fails
            });
        }

        originalRequest._retry = true; // Mark that this request has been retried
        isRefreshing = true;

        try {
            console.log('Access token expired. Attempting to refresh token...');

            // The user.controller.js refreshAccessToken endpoint returns the new accessToken in the response body.
            const refreshResponse = await axios.post(
                '/api/v1/users/refresh-token',
                null,
                { withCredentials: true }  // ✅ Send cookies with this call
            );

            const newAccessToken = refreshResponse.data?.data?.accessToken;

            if (!newAccessToken) {
                throw new Error('No new access token returned.');
            }

            console.log('New access token obtained:', newAccessToken);
            localStorage.setItem('accessToken', newAccessToken);

            // Update the default Authorization header for subsequent requests
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            // Update the Authorization header for the original failed request
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken); // Process queued requests with the new token
            return axiosInstance(originalRequest); // Retry the original request
        } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            processQueue(refreshError, null); // Reject queued requests
            localStorage.removeItem('accessToken');
            // Consider a more robust logout (e.g., using AuthContext, redirecting)
            window.location.href = '/login'; // Simple redirect
            
            
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
