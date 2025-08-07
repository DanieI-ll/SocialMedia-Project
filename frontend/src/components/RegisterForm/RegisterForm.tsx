import { useState } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import styles from './RegisterForm.module.css';

import EmailVerificationForm from '../EmailVerificationForm/EmailVerificationForm';

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setEmailError('');
    setUsernameError('');
    try {
      await axios.post('http://localhost:3000/api/auth/register', {
        email,
        username,
        name,
        password,
      });
      // Kayıt başarılı olduğunda state'i güncelleyip
      // kullanıcıyı doğrulama ekranına yönlendiririz
      setIsRegistered(true);
    } catch (error) {
      const err = error as AxiosError<{ field?: string; message?: string }>;
      if (err.response?.data?.field === 'email') {
        setEmailError(err.response.data.message || '');
      } else if (err.response?.data?.field === 'username') {
        setUsernameError(err.response.data.message || '');
      } else {
        setMessage('Registration error');
      }
    }
  };

  // isRegistered true ise doğrulama formunu gösteririz
  if (isRegistered) {
    return <EmailVerificationForm email={email} onSuccess={onSuccess} />;
  }

  return (
    <div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div>
          <img src={logo} alt="logo" className={styles.logo} />
        </div>
        <h2 className={styles.title}>Sign up to see photos and videos from your friends.</h2>
        <div className={styles.inputs}>
          <input type="email" placeholder="Email" value={email} required onChange={(e) => setEmail(e.target.value)} />
          {emailError && <p className={styles.error}>{emailError}</p>}

          <input type="text" placeholder="Full Name" value={name} required onChange={(e) => setName(e.target.value)} />

          <input type="text" placeholder="Username" value={username} required onChange={(e) => setUsername(e.target.value)} />
          {usernameError && <p className={styles.error}>{usernameError}</p>}

          <input type="password" placeholder="Password" value={password} required onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className={styles.registerText}>
          <p>
            People who use our service may have uploaded your contact information.{' '}
            <Link to="/learn-more" className={styles.link}>
              Learn More
            </Link>
          </p>
        </div>
        <div className={styles.registerText}>
          <p>
            By signing up, you agree to our{' '}
            <Link to="/terms" className={styles.link}>
              Terms
            </Link>
            ,{' '}
            <Link to="/privacy" className={styles.link}>
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to="/cookies" className={styles.link}>
              Cookies
            </Link>
            .
          </p>
        </div>
        <button className={styles.hoverBtn} type="submit">
          Sign Up
        </button>
        {message && <p className={styles.error}>{message}</p>}
      </form>
      <div className={styles.haveAccount}>
        <p>
          Have an account?{' '}
          <span>
            <Link to="/login" className={styles.hoverSpan}>
              Log in
            </Link>
          </span>
        </p>
      </div>
    </div>
  );
}
