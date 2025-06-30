import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

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

// Add a response interceptor to handle media URLs
instance.interceptors.response.use(
  (response) => {
    const transformMediaUrls = (data) => {
      if (!data) return data;

      // If it's a single tweet
      if (data.media && Array.isArray(data.media)) {
        data.media = data.media.map(url => 
          url.startsWith('http') ? url : `${BASE_URL}${url}`
        );
      }

      // If it's an array of tweets
      if (Array.isArray(data)) {
        return data.map(item => {
          if (item && item.media && Array.isArray(item.media)) {
            return {
              ...item,
              media: item.media.map(url =>
                url.startsWith('http') ? url : `${BASE_URL}${url}`
              )
            };
          }
          return item;
        });
      }

      return data;
    };

    response.data = transformMediaUrls(response.data);
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