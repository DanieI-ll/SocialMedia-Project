import LoginForm from '../../components/LoginForm/LoginForm';
import mainImg from '../../assets/Main.png';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  return (
    <>
      <div className={styles.mainBlock}>
        <div className={styles.img}>
          <img src={mainImg} alt="mainImage" />
        </div>
        <div>
          <LoginForm />
        </div>
      </div>
    </>
  );
}
