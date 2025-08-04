import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  avatar?: string;
  description?: string;
  isFollowing?: boolean;
}

interface Post {
  _id: string;
  description: string;
  image?: string;
  createdAt: string;
}

interface FollowUser {
  _id: string;
}

export default function ProfilePage({ token }: { token: string | null }) {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');

  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);

  const [myId, setMyId] = useState<string | null>(null);

  // Новое состояние для выбранного поста
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    async function fetchMyId() {
      try {
        const res = await axios.get('http://localhost:3000/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyId(res.data._id);
      } catch (err) {
        console.error('Ошибка получения моего ID', err);
      }
    }
    if (token) fetchMyId();
  }, [token]);

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

    async function fetchFollowersFollowing() {
      try {
        const [followersRes, followingRes] = await Promise.all([axios.get(`http://localhost:3000/followers/${userId}`, { headers: { Authorization: `Bearer ${token}` } }), axios.get(`http://localhost:3000/following/${userId}`, { headers: { Authorization: `Bearer ${token}` } })]);
        setFollowers(followersRes.data.followers || []);
        setFollowing(followingRes.data.following);
      } catch (err) {
        console.error('Ошибка загрузки подписчиков/подписок', err);
      }
    }

    fetchUser();
    fetchUserPosts();
    fetchFollowersFollowing();
  }, [userId, token]);

  async function handleFollow() {
    if (!token || !user) return;

    const prevIsFollowing = user.isFollowing;
    const prevFollowers = [...followers];

    setUser((prev) => (prev ? { ...prev, isFollowing: !prev.isFollowing } : prev));
    setFollowers((prev) => {
      if (prevIsFollowing) {
        return prev.filter((f) => f._id !== myId);
      } else {
        return myId ? [...prev, { _id: myId }] : prev;
      }
    });

    try {
      const res = prevIsFollowing
        ? await axios.delete(`http://localhost:3000/unfollow/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axios.post(`http://localhost:3000/follow/${user._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.followers) {
        setFollowers(res.data.followers);
        setUser((prev) => (prev ? { ...prev, isFollowing: res.data.isFollowing } : prev));
      }
    } catch (err) {
      console.error('Ошибка подписки', err);
      setUser((prev) => (prev ? { ...prev, isFollowing: prevIsFollowing } : prev));
      setFollowers(prevFollowers);
    }
  }

  if (error) return <p>{error}</p>;
  if (!user) return <p>Загрузка...</p>;

  const isOwnProfile = myId === userId;

  return (
    <div className={styles.main}>
      <div className={styles.profileDetails}>
        <div>
          <img src={user.avatar || '/default-avatar.png'} alt="avatar" style={{ width: 150, height: 150, borderRadius: '50%' }} />
        </div>

        <div>
          <div className={styles.container}>
            <h2 className={styles.username}>{user.username}</h2>
            {isOwnProfile ? (
              <div className={styles.buttonsFlex}>
                <Link to="/edit-profile" className={styles.link}>
                  Edit Profile
                </Link>
              </div>
            ) : (
              <div className={styles.buttonsFlex}>
                <div className={styles.followBtn} onClick={handleFollow} style={{ cursor: 'pointer' }}>
                  {user.isFollowing ? 'Unfollow' : 'Follow'}
                </div>
                <div className={styles.msgBtn}>Message</div>
              </div>
            )}
          </div>

          <div className={styles.userDetails}>
            <p>
              <span>{posts.length}</span> posts
            </p>
            <p>
              <span>{followers?.length || 0}</span> followers
            </p>
            <p>
              <span>{following.length}</span> following
            </p>
          </div>
          <div className={styles.discription}>
            <p>{user.description}</p>
          </div>
        </div>
      </div>

      <div className={styles.postGrid}>
        {posts.length === 0 && <p>Нет постов</p>}
        {posts.map((post) => (
          <div key={post._id} onClick={() => setSelectedPost(post)} style={{ cursor: 'pointer' }}>
            {post.image && <img src={post.image} alt="post" />}
          </div>
        ))}
      </div>

      {selectedPost && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPost(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <p>{selectedPost.description}</p>
            {selectedPost.image && <img src={selectedPost.image} alt="post" style={{ maxWidth: '100%' }} />}
            <button onClick={() => setSelectedPost(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
