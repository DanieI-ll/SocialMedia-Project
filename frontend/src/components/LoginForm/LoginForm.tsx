import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext/AuthContext';
import styles from './LoginForm.module.css';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

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
      login(res.data.token, res.data.userId);
      navigate('/posts'); // переходим на ленту
    } catch {
      setMessage('Wrong password, username or email');
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.imgBlock}>
          <img src={logo} alt="logo" />
        </div>
        <div className={styles.inputs}>
          <input type="email" placeholder="Username, or email" value={email} required onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} required onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className={styles.buttonHover} type="submit">Log in</button>
        <div className={styles.lineController}>
          <div className={styles.line}></div> OR <div className={styles.line}></div>
        </div>
        {message && <p className={styles.errorMsg}>{message}</p>}
        <p className={styles.forgot}>
          <Link to="/forgot">Forgot password?</Link>
        </p>
      </form>
      <div className={styles.registerForm}>
        <p>
          Don't have an account?{' '}
          <Link to="/register">
            <span >Sign Up</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
