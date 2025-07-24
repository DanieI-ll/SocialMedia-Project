import RegisterForm from '../../components/RegisterForm/RegisterForm';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    alert('Регистрация успешна! Войдите в систему.');
    navigate('/login');
  };

  return (
    <div>
      <RegisterForm onSuccess={handleRegisterSuccess} />
      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}
