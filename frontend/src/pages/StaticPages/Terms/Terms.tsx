import styles from '../StaticPages.module.css';

import BackButton from '../../../components/BackButton/BackButton';

export default function Terms() {
  return (
    <div className={styles.staticPage}>
      <BackButton />
      <h1>Terms and Conditions</h1>
      <p>Welcome to our platform. By using our services, you agree to comply with these terms:</p>
      <ul>
        <li>You must be at least 13 years old to use our services.</li>
        <li>You are responsible for the content you share.</li>
        <li>We reserve the right to suspend accounts that violate our policies.</li>
      </ul>
      <p>These terms may be updated at any time. Please review them periodically.</p>
    </div>
  );
}
