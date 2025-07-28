// src/components/Layout/Layout.tsx
import Footer from '../Footer/Footer';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.container}>
      {/* Navbar buraya */}
      <div className={styles.content}>{children}</div>
      <Footer />
    </div>
  );
}
