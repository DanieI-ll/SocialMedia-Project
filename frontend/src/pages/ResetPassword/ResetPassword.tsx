import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import styles from './ResetPassword.module.css';
import axios from 'axios';
import forgot from '../../assets/forgotPassword.png';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:3000/api/auth/reset/${token}`, { newPassword: password });
      alert('Password updated!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div>
      {/* <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Reset</button>
      </form>
      {error && <p>{error}</p>} */}

      <div className={styles.forgotBlock}>
        <form className={styles.forgotContainer} onSubmit={handleSubmit}>
          <div className={styles.newPasswordContainer}>
            <img src={forgot} alt="new" />
            <p className={styles.headerText}>Create A Strong Password</p>
            <p className={styles.childrenText}>Your password must be at least 6 characters and should include a combination of numbers, letters and special characters.</p>
            <input className={styles.input} type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className={styles.button} type="submit">
              Reset
            </button>
            {error && <p className={styles.message}>{error}</p>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
