import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../Footer/Footer';
import styles from './Layout.module.css';
import navbarLogo from '../../assets/navbarLogo.png';
import home from '../../assets/home.svg';
import search from '../../assets/search.svg';
import explore from '../../assets/explore.svg';
import messenger from '../../assets/messenger.svg';
import notification from '../../assets/notification.svg';
import create from '../../assets/create.svg';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext/AuthContext';
import { UserSearch } from '../UserSearch/UserSearch.tsx';
import CreatePostForm from '../CreatePostForm/CreatePostForm.tsx';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const token = localStorage.getItem('token')!;
  const { token: contextToken } = useContext(AuthContext);
  const [avatar, setAvatar] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get('http://localhost:3000/api/profile/me', {
          headers: { Authorization: `Bearer ${contextToken || token}` },
        });
        setAvatar(res.data.avatar);
      } catch (err) {
        console.error('Ошибка загрузки аватара', err);
      }
    }
    fetchProfile();
  }, [contextToken, token]);

  return (
    <div className={styles.mainContainer}>
      <nav className={styles.navbar}>
        <div className={styles.imgContainer}>
          <img src={navbarLogo} alt="navbar" />
        </div>
        <div className={styles.navbarContainer}>
          <Link to="/posts" className={styles.element}>
            <img src={home} alt="home" />
            <p>Home</p>
          </Link>

          <a className={styles.element} onClick={() => setIsSearchOpen(true)}>
            <img src={search} alt="search" />
            <p>Search</p>
          </a>

          <Link to="/explore" className={styles.element}>
            <img src={explore} alt="explore" />
            <p>Explore</p>
          </Link>
          <Link to="/messenger" className={styles.element}>
            <img src={messenger} alt="messenger" />
            <p>Messenger</p>
          </Link>
          <Link to="/notifications" className={styles.element}>
            <img src={notification} alt="notification" />
            <p>Notification</p>
          </Link>
          <a className={styles.element} onClick={() => setIsCreateOpen(true)}>
            <img src={create} alt="create" />
            <p>Create</p>
          </a>
          <Link to="/profile" className={styles.element} style={{ marginTop: '59px' }}>
            {avatar ? <img src={avatar} alt="Profile" className={styles.avatar} /> : <p className={styles.profileText}>Profile</p>}
            <p className={styles.profileText}>Profile</p>
          </Link>
        </div>
      </nav>

      <main className={styles.content}>
        {children}
        <Footer />
      </main>

      {/* Search Modal */}
      {isSearchOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsSearchOpen(false)} />
          <div className={styles.searchPanel}>
            <div className={styles.searchHeader}>
              <h3>Search</h3>
            </div>
            <UserSearch />
          </div>
        </>
      )}

      {/* Create Post Modal */}
      {isCreateOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsCreateOpen(false)} />
          <div className={styles.createModal}>
            <CreatePostForm token={contextToken || token} onPostCreated={() => setIsCreateOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}
