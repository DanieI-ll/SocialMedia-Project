import styles from './Footer.module.css';

const Footer = () => {
  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.footerNavbar}>
          <ul className={styles.footerElements}>
            <li>Home</li>
            <li>Search</li>
            <li>Explore</li>
            <li>Messages</li>
            <li>Notificaitons</li>
            <li>Create</li>
          </ul>
          <p>© 2024 ICHgram</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
