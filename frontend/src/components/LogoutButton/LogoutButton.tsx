import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';

export function LogoutButton() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        logout();
        navigate('/login');
      }}
    >
      Выйти
    </button>
  );
}
