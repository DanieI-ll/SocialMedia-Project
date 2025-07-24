import { useState } from 'react';
import axios from 'axios';

import styles from './RegisterForm.module.css';

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/auth/register', {
        email,
        username,
        name,
        password,
      });
      setMessage('');
      onSuccess();
    } catch {
      setMessage('Ошибка регистрации');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Регистрация</h2>
      <input type="email" placeholder="Email" value={email} required onChange={(e) => setEmail(e.target.value)} />
      <input type="text" placeholder="Username" value={username} required onChange={(e) => setUsername(e.target.value)} />
      <input type="text" placeholder="Name" value={name} required onChange={(e) => setName(e.target.value)} />
      <input type="password" placeholder="Пароль" value={password} required onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Зарегистрироваться</button>
      {message && <p>{message}</p>}
    </form>
  );
}
