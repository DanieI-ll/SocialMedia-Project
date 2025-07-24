import axios from 'axios';

export const login = async (email: string, password: string) => {
  const res = await axios.post('http://localhost:3000/api/auth/login', { login: email, password });
  localStorage.setItem('token', res.data.token);
  return res.data;
};

export const register = async (email: string, username: string, name: string, password: string) => {
  const res = await axios.post('http://localhost:3000/api/auth/register', {
    email,
    username,
    name,
    password,
  });
  return res.data;
};
