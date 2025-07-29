import styles from '../StaticPages.module.css';

import BackButton from '../../../components/BackButton/BackButton';

export default function LearnMore() {
  return (
    <div className={styles.staticPage}>
      <BackButton/>
      <h1>Learn More</h1>
      <p>People who use our service may have uploaded your contact information. This allows us to help you find people you know.</p>
      <p>You can manage your contact settings in your account or reach out to our support for more details.</p>
    </div>
  );
}
