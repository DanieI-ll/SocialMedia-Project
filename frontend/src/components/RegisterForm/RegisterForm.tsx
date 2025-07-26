import { useState } from 'react';
import axios from 'axios';

import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

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
    <div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div>
          <img src={logo} alt="logo" />
        </div>
        <h2>Sign up to see photos and videos from your friends.</h2>
        <div className={styles.inputs}>
          <input type="email" placeholder="Email" value={email} required onChange={(e) => setEmail(e.target.value)} />
          <input type="text" placeholder="Full Name" value={name} required onChange={(e) => setName(e.target.value)} />
          <input type="text" placeholder="Username" value={username} required onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} required onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className={styles.registerText}>
          <p>
            People who use our service may have uploaded your contact information to Instagram. <a href="#">Learn More</a>
          </p>
        </div>

        <div className={styles.registerText}>
          <p>
            By signing up, you agree to our <a href="#">Terms,</a> <a href="#">Privacy Policy</a> and <a href="#">Cookies.</a>
          </p>
        </div>
        <button type="submit">Sign Up</button>
        {message && <p>{message}</p>}
      </form>
      <div className={styles.haveAccount}>
        <p>
          Have an account?{' '}
          <Link to="/login">
            <span>Log in</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
