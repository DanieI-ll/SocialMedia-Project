import styles from './Footer.module.css';

import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.footerNavbar}>
          <ul className={styles.footerElements}>
            <Link className={styles.footerLinks} to="/posts">
              Home
            </Link>
            <Link className={styles.footerLinks} to="/">
              Search
            </Link>
            <Link className={styles.footerLinks} to="/explore">
              Explore
            </Link>
            <Link className={styles.footerLinks} to="/messenges">
              Messages
            </Link>
            <Link className={styles.footerLinks} to="/notifications">
              Notifications
            </Link>
            <Link className={styles.footerLinks} to="/">
              Create
            </Link>
          </ul>
          <p>© 2024 ICHgram</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
