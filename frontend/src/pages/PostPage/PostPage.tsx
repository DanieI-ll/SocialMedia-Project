// src/pages/PostPage/PostPage.tsx
import PostsFeed from '../../components/PostsFeed/PostsFeed';
import styles from './PostPage.module.css';

export default function PostPage() {
  const token = localStorage.getItem('token')!;

  return (
    <div className={styles.postBlock}>
      <PostsFeed token={token} />
    </div>
  );
}
