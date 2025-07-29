import { useState } from 'react';
import styles from './ForgotPassword.module.css';
import { Link } from 'react-router-dom';
import logo from '../../assets/navbarLogo.png';
import forgot from '../../assets/forgotPassword.png';

const ForgotPassword = () => {
  const [input, setInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return setMessage('Please enter your email or username');
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername: input }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      setMessage('Password reset link has been sent to your email.');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.navbar}>
        <img src={logo} alt="logo" />
      </div>

      <div className={styles.forgotBlock}>
        <form className={styles.forgotContainer} onSubmit={handleSubmit}>
          <div>
            <img src={forgot} alt="forgotPassword" />
          </div>
          <p className={styles.headerText}>Trouble logging in?</p>
          <p className={styles.childrenText}>Enter your email, phone, or username and we'll send you a link to get back into your account.</p>
          <input className={styles.input} type="text" placeholder="Email or Username" value={input} onChange={(e) => setInput(e.target.value)} />
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Reset your password'}
          </button>

          {message && <p className={styles.message}>{message}</p>}

          <div className={styles.lineController}>
            <div className={styles.line}></div> OR <div className={styles.line}></div>
          </div>

          <p className={styles.createNewAcc}>
            <Link to="/register">Create new account</Link>
          </p>

          <div className={styles.backToLoginBlock}>
            <Link to="/login">
              <p className={styles.backToLogin}>Back to login</p>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
