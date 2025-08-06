import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import axios from 'axios';
import PostModal from '../../components/PostModal/PostModal';

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
  author: { username?: string; _id: string; avatar?: string }; // PostModal için gerekli
  likesCount: number; // PostModal için gerekli
  likedByUser: boolean; // PostModal için gerekli
  comments: Comment[]; // PostModal için gerekli
}

interface Comment {
  _id: string;
  user: { username: string };
  text: string;
}

interface FollowUser {
  _id: string;
}

interface FollowingWrapper {
  following: FollowUser;
}

export default function ProfilePage({ token }: { token: string | null }) {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Bu state, PostModal'da kullanılacak `followedUsers` state'ini ProfilePage'de yönetir.
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);

  function handlePostDelete(deletedPostId: string) {
    setPosts(posts.filter((post) => post._id !== deletedPostId));
    setSelectedPost(null);
  }

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

    async function fetchData() {
      try {
        const [userRes, postsRes, followersRes, followingRes, myProfileRes] = await Promise.all([axios.get(`http://localhost:3000/api/profile/${userId}`, { headers: { Authorization: `Bearer ${token}` } }), axios.get(`http://localhost:3000/posts/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } }), axios.get(`http://localhost:3000/followers/${userId}`, { headers: { Authorization: `Bearer ${token}` } }), axios.get(`http://localhost:3000/following/${userId}`, { headers: { Authorization: `Bearer ${token}` } }), axios.get('http://localhost:3000/following/me', { headers: { Authorization: `Bearer ${token}` } })]);

        setUser(userRes.data);
        setPosts(postsRes.data);
        setFollowers(followersRes.data.followers || []);
        setFollowing(followingRes.data.following);
        setFollowedUsers(myProfileRes.data.following.map((f: FollowingWrapper) => f.following._id));

        const commentsPromises = postsRes.data.map((post: Post) =>
          axios
            .get<Comment[]>(`http://localhost:3000/comments/${post._id}`)
            .then((res) => ({ postId: post._id, comments: res.data }))
            .catch(() => ({ postId: post._id, comments: [] })),
        );
        const commentsResults = await Promise.all(commentsPromises);

        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            const found = commentsResults.find((c) => c.postId === post._id);
            return found ? { ...post, comments: found.comments } : post;
          }),
        );
      } catch (err) {
        setError('Ошибка загрузки данных профиля');
        console.error(err);
      }
    }

    fetchData();
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

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts((prevPosts) => prevPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
    setSelectedPost(updatedPost);
  };

  if (error) return <p>{error}</p>;
  if (!user) return <p>Загрузка...</p>;

  async function handlePostClick(postToOpen: Post) {
    if (!token) return;
    try {
      // API'dan post'un güncel verilerini çek
      const postWithDetails = await axios.get(`http://localhost:3000/posts/${postToOpen._id}`, { headers: { Authorization: `Bearer ${token}` } });

      // Modal için selectedPost'u güncel verilerle ayarla
      setSelectedPost(postWithDetails.data);
    } catch (error) {
      console.error('Post verisi çekilirken hata:', error);
    }
  }

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
          <div key={post._id} onClick={() => handlePostClick(post)} style={{ cursor: 'pointer' }}>
            {post.image && <img src={post.image} alt="post" />}
          </div>
        ))}
      </div>

      {selectedPost && token && myId && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          token={token}
          currentUserId={myId}
          followedUsers={followedUsers}
          setFollowedUsers={setFollowedUsers}
          updatePostInFeed={handleUpdatePost}
          onPostDelete={handlePostDelete} // Bu satırı ekledik
        />
      )}
    </div>
  );
}
