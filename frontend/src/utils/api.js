import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a separate instance for file uploads
const uploadApi = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add auth interceptor to upload instance
uploadApi.interceptors.request.use(
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

// Add a request interceptor to add auth token
api.interceptors.request.use(
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

// Auth functions
const loginUser = async (email, password) => {
  const { data } = await api.post('/api/users/login', { email, password });
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

const registerUser = async (username, email, password) => {
  const { data } = await api.post('/api/users/register', { username, email, password });
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

// Horse functions with file upload
const createHorseWithImage = async (horseData, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('image', file);
  
  // Append all horse data to formData
  Object.keys(horseData).forEach(key => {
    if (horseData[key] !== undefined && horseData[key] !== null) {
      formData.append(key, horseData[key]);
    }
  });

  const { data } = await uploadApi.post('/api/horses', formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      if (onUploadProgress) {
        onUploadProgress(percentCompleted);
      }
    }
  });
  return data;
};

const updateHorseWithImage = async (id, horseData, file, onUploadProgress) => {
  const formData = new FormData();
  if (file) {
    formData.append('image', file);
  }
  
  // Append all horse data to formData
  Object.keys(horseData).forEach(key => {
    if (horseData[key] !== undefined && horseData[key] !== null) {
      formData.append(key, horseData[key]);
    }
  });

  const { data } = await uploadApi.put(`/api/horses/${id}`, formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      if (onUploadProgress) {
        onUploadProgress(percentCompleted);
      }
    }
  });
  return data;
};

// Export both the api instance and all functions
export { loginUser, registerUser, createHorseWithImage, updateHorseWithImage };
export default api;
