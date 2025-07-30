import styles from './NotFound.module.css';

import mainImg from '../../assets/Main.png';

const NotFound = () => {
  return (
    <>
      <div className={styles.mainContainer}>
        <div className={styles.imgBlock}><img src={mainImg} alt="main" /></div>
        <div className={styles.content}>
          <h2 className={styles.contentHeader}>Oops! Page Not Found (404 Error)</h2>
          <p className={styles.contentP}>We're sorry, but the page you're looking for doesn't seem to exist. If you typed the URL manually, please double-check the spelling. If you clicked on a link, it may be outdated or broken.</p>
        </div>
      </div>
    </>
  );
};

export default NotFound;
