// EmailVerificationForm.tsx
import { useState } from 'react';
import axios from 'axios';
import styles from './EmailVerificationForm.module.css';

import main from '../../assets/logo.png'

interface EmailVerificationFormProps {
  email: string;
  onSuccess: () => void;
}

export default function EmailVerificationForm({ email, onSuccess }: EmailVerificationFormProps) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    try {
      await axios.post('http://localhost:3000/api/auth/verify-email', {
        email,
        code,
      });
      onSuccess(); // Doğrulama başarılıysa ana sayfaya yönlendirme gibi bir işlem yap
    } catch {
      setMessage('Code not Valid!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.mainLogo}>
        <img src={main} alt="main" />
      </div>
      <h2 className={styles.title}>E-Mail Verification</h2>
      <p className={styles.titleChild}>Enter the code sent to your email address to register.</p>
      <form className={styles.formCenter} onSubmit={handleVerification}>
        <input className={styles.inputs} type="text" placeholder="Verification code" value={code} onChange={(e) => setCode(e.target.value)} required />
        <button className={styles.final} type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Verify'}
        </button>
        {message && <p className={styles.error}>{message}</p>}
      </form>
    </div>
  );
}
