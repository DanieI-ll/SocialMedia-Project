import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext/AuthContext';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        login: email,
        password,
      });
      login(res.data.token); // сохраняем токен в контекст
      navigate('/posts'); // переходим на ленту
    } catch {
      setMessage('Ошибка входа');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Вход</h2>
      <input type="email" placeholder="Email" value={email} required onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Пароль" value={password} required onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Войти</button>
      {message && <p>{message}</p>}
    </form>
  );
}
