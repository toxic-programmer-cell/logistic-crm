import axios from 'axios';

// Create a new Axios instance
const axiosInstance = axios.create({
  baseURL: '/api/v1', // API base URL
  withCredentials: true,
});

let isRefreshing = false;    // Variable to store the refresh token promise
let failedQueue = [];    // Array to store failed requests while token is being refreshed


// Helper to resolve/reject all queued requests
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
        console.warn('❌ Refresh token invalid. Logging out...');

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

            .then(() => {
              originalRequest._retry = true;
              return axiosInstance(originalRequest); // Retry with new token
            })
            .catch(err => {
              window.location.href = '/login';
              return Promise.reject(err); // Propagate error if queue processing fails
            });
        }

        originalRequest._retry = true; // Mark that this request has been retried
        isRefreshing = true;

        try {
            console.log('🔁 Attempting token refresh...');

            // The user.controller.js refreshAccessToken endpoint returns the new accessToken in the response body.
            const refreshResponse = await axios.post(
                '/api/v1/users/refresh-token',
                null,
                { withCredentials: true }  // ✅ Send cookies with this call
            );

            processQueue(null, true); // Process queued requests with the new token
            return axiosInstance(originalRequest); // Retry the original request
        } catch (refreshError) {
            console.error('Token refresh failed:');
            processQueue(refreshError, null); // Reject queued requests

            const isAuthCheck = originalRequest.url === '/users/me';
            const isExpectedFailureAfterLogout = !isAuthCheck && refreshError.response?.status === 401;

            if (isExpectedFailureAfterLogout) {
                 console.info('Expected token refresh failure after logout/no session. Redirecting to login.');
                 window.location.href = '/login';
            } else {
              console.error('Token refresh error:', refreshError.message);
            }
            
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
