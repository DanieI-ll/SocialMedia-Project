import styles from './Footer.module.css';
import { Link } from 'react-router-dom';

interface FooterProps {
  setIsSearchOpen: (value: boolean) => void;
  setIsNotificationsOpen: (value: boolean) => void;
  setIsCreateOpen: (value: boolean) => void;
}

const Footer = ({ setIsSearchOpen, setIsNotificationsOpen, setIsCreateOpen }: FooterProps) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerNavbar}>
        <Link className={styles.footerElement} to="/posts">
          <p>Home</p>
        </Link>

        <a className={styles.footerElement} onClick={() => setIsSearchOpen(true)}>
          <p>Search</p>
        </a>

        <Link className={styles.footerElement} to="/explore">
          <p>Explore</p>
        </Link>

        <Link className={styles.footerElement} to="/messenger">
          <p>Messages</p>
        </Link>

        <a className={styles.footerElement} onClick={() => setIsNotificationsOpen(true)}>
          <p>Notifications</p>
        </a>

        <a className={styles.footerElement} onClick={() => setIsCreateOpen(true)}>
          <p>Create</p>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
