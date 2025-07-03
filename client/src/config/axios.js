import axios from 'axios';

// Use environment variables for API configuration
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
const API_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;

const instance = axios.create({
  baseURL: API_URL
});

// Add a request interceptor to add the token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle media URLs and profile images
instance.interceptors.response.use(
  (response) => {
    const transformUrls = (data) => {
      if (!data) return data;

      // Helper function to transform a single URL
      const transformUrl = (url) => {
        if (!url || url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
      };

      // Handle single objects (tweets, users, etc.)
      if (typeof data === 'object' && !Array.isArray(data)) {
        const transformed = { ...data };
        
        // Transform tweet media
        if (transformed.media && Array.isArray(transformed.media)) {
          transformed.media = transformed.media.map(transformUrl);
        }
        
        // Transform profile images
        if (transformed.profileImage) {
          transformed.profileImage = transformUrl(transformed.profileImage);
        }
        
        // Transform author profile images in tweets
        if (transformed.author && transformed.author.profileImage) {
          transformed.author.profileImage = transformUrl(transformed.author.profileImage);
        }

        return transformed;
      }

      // Handle arrays of objects
      if (Array.isArray(data)) {
        return data.map(item => {
          if (!item || typeof item !== 'object') return item;
          
          const transformed = { ...item };
          
          // Transform tweet media
          if (transformed.media && Array.isArray(transformed.media)) {
            transformed.media = transformed.media.map(transformUrl);
          }
          
          // Transform profile images
          if (transformed.profileImage) {
            transformed.profileImage = transformUrl(transformed.profileImage);
          }
          
          // Transform author profile images
          if (transformed.author && transformed.author.profileImage) {
            transformed.author.profileImage = transformUrl(transformed.author.profileImage);
          }
          
          return transformed;
        });
      }

      return data;
    };

    response.data = transformUrls(response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance; 