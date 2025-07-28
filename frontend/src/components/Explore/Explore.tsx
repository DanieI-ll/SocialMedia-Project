import styles from './Explore.module.css';

import explore1 from '../../assets/explore1.png'
import explore2 from '../../assets/explore2.png';
import explore3 from '../../assets/explore3.png';
import explore4 from '../../assets/explore4.png';
import explore5 from '../../assets/explore5.png';
import explore6 from '../../assets/explore6.png';
import explore7 from '../../assets/explore7.png';
import explore8 from '../../assets/explore8.png';
import explorebig1 from '../../assets/explorebig1.png';
import explorebig2 from '../../assets/explorebig2.png';

const Explore = () => {
  return (
    <>
      <div className={styles.mainContainer}>
        <div className={styles.firstGrid}>
          <div className={styles.fourGrid}>
            <img src={explore1} alt="exploreImg" />
            <img src={explore2} alt="exploreImg" />
            <img src={explore3} alt="exploreImg" />
            <img src={explore4} alt="exploreImg" />
          </div>
          <div className={styles.bigGrid}>
            <img src={explorebig1} alt="exploreImg" />
          </div>
        </div>

        <div className={styles.secondGrid}>
          <div className={styles.fourGrid}>
            <img src={explore5} alt="exploreImg" />
            <img src={explore6} alt="exploreImg" />
            <img src={explore7} alt="exploreImg" />
            <img src={explore8} alt="exploreImg" />
          </div>
          <div className={styles.bigGrid}>
            <img src={explorebig2} alt="exploreImg" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Explore;
