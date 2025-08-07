// EmailVerificationForm.tsx
import { useState } from 'react';
import axios from 'axios';
import styles from './RegisterForm.module.css';

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
      setMessage('Doğrulama kodu hatalı veya süresi dolmuş.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>E-posta Doğrulama</h2>
      <p>Kayıt olmak için e-posta adresinize gönderilen kodu girin.</p>
      <form onSubmit={handleVerification}>
        <input type="text" placeholder="Doğrulama Kodu" value={code} onChange={(e) => setCode(e.target.value)} required />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Doğrulanıyor...' : 'Doğrula'}
        </button>
        {message && <p className={styles.error}>{message}</p>}
      </form>
    </div>
  );
}
