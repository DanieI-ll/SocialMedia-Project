import { Link } from 'react-router-dom';
import CreatePostForm from '../../components/CreatePostForm/CreatePostForm';
import PostsFeed from '../../components/PostsFeed/PostsFeed';
import { useState, useEffect, useContext } from 'react';
import styles from './PostPage.module.css';
import navbarLogo from '../../assets/navbarLogo.png';
import Footer from '../../components/Footer/Footer';
import home from '../../assets/home.svg';
import search from '../../assets/search.svg';
import explore from '../../assets/explore.svg';
import messenger from '../../assets/messenger.svg';
import notification from '../../assets/notification.svg';
import create from '../../assets/create.svg';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext/AuthContext';

export default function PostPage() {
  const token = localStorage.getItem('token')!;
  const [refresh, setRefresh] = useState(false);
  const [avatar, setAvatar] = useState('');
  const { token: contextToken } = useContext(AuthContext);

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
    <div>
      <div className={styles.mainContainer}>
        <div className={styles.navbar}>
          <div className={styles.imgContainer}>
            <img src={navbarLogo} alt="navbar" />
          </div>

          <div className={styles.navbarContainer}>
            <div className={styles.element}>
              <img src={home} alt="home" />
              <p>Home</p>
            </div>
            <div className={styles.element}>
              <img src={search} alt="search" />
              <p>Search</p>
            </div>
            <div className={styles.element}>
              <img src={explore} alt="explore" />
              <p>Explore</p>
            </div>
            <div className={styles.element}>
              <img src={messenger} alt="messenger" />
              <p>Messenger</p>
            </div>
            <div className={styles.element}>
              <img src={notification} alt="notification" />
              <p>Notification</p>
            </div>
            <div className={styles.element}>
              <img src={create} alt="create" />
              <p>Create</p>
            </div>
            <Link to="/profile" className={styles.element}>
              {avatar ? <img src={avatar} alt="Profile" className={styles.avatar} /> : <p className={styles.profileText}>Profile</p>}
              <p className={styles.profileText}>Profile</p>
            </Link>
          </div>
        </div>
        <div className={styles.postBlock}>
          <PostsFeed token={token} refresh={refresh} />
          <CreatePostForm token={token} onPostCreated={() => setRefresh((prev) => !prev)} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
