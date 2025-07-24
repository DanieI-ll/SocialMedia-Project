import { useEffect, useState } from 'react';
import axios from 'axios';

import styles from './PostsFeed.module.css';

interface Post {
  _id: string;
  title: string;
  content: string;
}

interface PostsFeedProps {
  token: string;
}

export default function PostsFeed({ token }: PostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await axios.get('http://localhost:3000/api/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data);
      } catch {
        setError('Ошибка загрузки постов');
      }
    }
    fetchPosts();
  }, [token]);

  if (error) return <p>{error}</p>;

  return (
    <div className={styles.feed}>
      <h2>Лента постов</h2>
      {posts.length === 0 && <p>Посты не найдены.</p>}
      {posts.map((post) => (
        <div key={post._id} className={styles.post}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}
