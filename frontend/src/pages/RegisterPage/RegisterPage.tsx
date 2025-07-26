import RegisterForm from '../../components/RegisterForm/RegisterForm';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css'

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    alert('Регистрация успешна! Войдите в систему.');
    navigate('/login');
  };

  return (
    <div className={styles.div}>
      <RegisterForm onSuccess={handleRegisterSuccess} />
    </div>
  );
}
