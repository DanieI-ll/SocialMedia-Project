import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';

import logoutButton from '../../assets/logout.svg';

import styles from './LogoutButton.module.css';

export function LogoutButton() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <a
      className={styles.logoutBtn}
      onClick={() => {
        localStorage.removeItem('resentUsers'); // ← önce localStorage temizlenir
        logout();
        navigate('/login');
      }}
    >
      <div className={styles.logoutBtnImg}>
        <img src={logoutButton} alt="logoutButton" />
      </div>{' '}
      <p className={styles.logoutText}>Logout</p>
    </a>
  );
}
