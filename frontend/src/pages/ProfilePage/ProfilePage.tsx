import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface Post {
  _id: string;
  description: string;
  image?: string;
  createdAt: string;
}

export default function ProfilePage({ token }: { token: string | null }) {
  const { userId } = useParams<{ userId: string }>(); // ожидается userId
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;

    async function fetchUser() {
      try {
        const res = await axios.get(`http://localhost:3000/api/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch {
        setError('Ошибка загрузки пользователя');
      }
    }

    async function fetchUserPosts() {
      try {
        const res = await axios.get(`http://localhost:3000/posts/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data);
      } catch {
        setError('Ошибка загрузки постов');
      }
    }

    fetchUser();
    fetchUserPosts();
  }, [userId, token]);

  if (error) return <p>{error}</p>;
  if (!user) return <p>Загрузка...</p>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={user.avatar || '/default-avatar.png'} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%' }} />
        <h2>{user.username}</h2>
      </div>

      <h3 style={{ marginTop: 20 }}>Posts:</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, 200px)',
          gap: 10,
          marginTop: 10,
        }}
      >
        {posts.length === 0 && <p>Нет постов</p>}
        {posts.map((post) => (
          <div key={post._id} style={{ border: '1px solid #ddd', padding: 5, borderRadius: 8 }}>
            {post.image && <img src={post.image} alt="post" style={{ width: '100%', height: 150, objectFit: 'cover' }} />}
            <p>{post.description}</p>
            <p style={{ fontSize: 12, color: 'gray' }}>{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
