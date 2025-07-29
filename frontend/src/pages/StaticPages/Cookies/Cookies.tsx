import styles from '../StaticPages.module.css'

import BackButton from '../../../components/BackButton/BackButton';

export default function Cookies() {
  return (
    <div className={styles.staticPage}>
      <BackButton/>
      <h1>Cookies Policy</h1>
      <p>We use cookies to improve your experience:</p>
      <ul>
        <li>Essential cookies: Required for the website to function.</li>
        <li>Analytics cookies: Help us understand how users interact with the platform.</li>
        <li>You can manage cookies in your browser settings.</li>
      </ul>
    </div>
  );
}
