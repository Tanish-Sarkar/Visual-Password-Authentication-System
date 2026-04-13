import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Since the server will occasionally throw normal 4xx errors for business logic, 
// we won't wrap it in heavy interceptors right now, just explicit catch blocks in the UI.

export const checkRegistration = async (username) => {
  const res = await api.get('/auth/check-registration', { params: { username } });
  return res.data;
};

export const signup = async (payload) => {
  const res = await api.post('/auth/signup', payload);
  return res.data;
};

export const login = async (payload) => {
  const res = await api.post('/auth/login', payload);
  return res.data;
};

export const verifySession = async (token) => {
  const res = await api.get('/auth/verify-session', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const fetchProtectedData = async (token) => {
  const res = await api.get('/pages/welcome', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
