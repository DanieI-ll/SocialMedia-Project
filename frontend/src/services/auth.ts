import axios from 'axios';

export const login = async (email: string, password: string) => {
  const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
  localStorage.setItem('token', res.data.token);
  return res.data;
};
