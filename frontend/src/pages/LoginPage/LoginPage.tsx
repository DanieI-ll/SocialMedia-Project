import LoginForm from '../../components/LoginForm/LoginForm';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div>
      <LoginForm />
      <p>
        Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
      </p>
    </div>
  );
}
