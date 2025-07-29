import styles from './ForgotPassword.module.css';

import { Link } from 'react-router-dom';

import logo from '../../assets/navbarLogo.png';
import forgot from '../../assets/forgotPassword.png';

const ForgotPassword = () => {
  return (
    <>
      <div className={styles.mainContainer}>
        <div className={styles.navbar}>
          <img src={logo} alt="logo" />
        </div>

        <div className={styles.forgotBlock}>
          <div className={styles.forgotContainer}>
            <div>
              <img src={forgot} alt="forgotPassword" />
            </div>
            <p className={styles.headerText}>Trouble logging in?</p>
            <div>
              <p className={styles.childrenText}>Enter your email, phone, or username and we'll send you a link to get back into your account.</p>
            </div>
            <div>
              <input className={styles.input} type="text" placeholder="Email or Username" />
            </div>

            <div>
              <button className={styles.button} type="submit">
                Reset your password
              </button>
            </div>

            <div className={styles.lineController}>
              <div className={styles.line}></div> OR <div className={styles.line}></div>
            </div>

            <p className={styles.createNewAcc}>
              <Link to="/register">Create new account</Link>
            </p>

            <div className={styles.backToLoginBlock}>
              <Link to="/login">
                <p className={styles.backToLogin}>Back to login</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
