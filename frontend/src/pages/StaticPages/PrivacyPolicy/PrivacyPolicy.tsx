import styles from '../StaticPages.module.css';

import BackButton from '../../../components/BackButton/BackButton';

export default function PrivacyPolicy() {
  return (
    <div className={styles.staticPage}>
      <BackButton/>
      <h1>Privacy Policy</h1>
      <p>Your privacy matters to us. Here’s how we handle your data:</p>
      <ul>
        <li>We collect your email, username, and activity data to provide our services.</li>
        <li>We do not sell your personal information to third parties.</li>
        <li>You can request deletion of your data by contacting support.</li>
      </ul>
      <p>Read this policy carefully to understand how we use your information.</p>
    </div>
  );
}
