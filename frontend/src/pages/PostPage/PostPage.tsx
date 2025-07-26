import { Link } from 'react-router-dom';
import CreatePostForm from '../../components/CreatePostForm/CreatePostForm';
import PostsFeed from '../../components/PostsFeed/PostsFeed';
import { useState } from 'react';
import styles from './PostPage.module.css';
import navbarLogo from '../../assets/navbarLogo.png';

import home from '../../assets/home.svg';
import search from '../../assets/search.svg';
import explore from '../../assets/explore.svg';
import messenger from '../../assets/messenger.svg';
import notification from '../../assets/notification.svg';
import create from '../../assets/create.svg';

export default function PostPage() {
  const token = localStorage.getItem('token')!;
  const [refresh, setRefresh] = useState(false);

  return (
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

          <div className={styles.element}>
            <p>Profile</p>
          </div>
        </div>
      </div>
      <div>
        <PostsFeed token={token} refresh={refresh} />
        <CreatePostForm token={token} onPostCreated={() => setRefresh((prev) => !prev)} />

        <hr />
        <Link to="/profile">Перейти в Профиль</Link>
      </div>
    </div>
  );
}
