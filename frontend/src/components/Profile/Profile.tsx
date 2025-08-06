import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext/AuthContext';
import { Link } from 'react-router-dom';

import styles from './Profile.module.css';
import PostModal from '../PostModal/PostModal'; // PostModal'ı import edin

// Bu arayüzleri PostModal'ın ihtiyaçlarına göre genişletiyoruz
interface Comment {
  _id: string;
  user: { username: string };
  text: string;
}

// Post arayüzünü bu şekilde güncelleyin
interface Post {
  _id: string;
  description: string;
  image?: string;
  createdAt: string;
  author: {
    username?: string; // Burayı güncelledik
    _id: string;
    avatar?: string;
  };
  likesCount: number;
  likedByUser: boolean;
  comments: Comment[];
}

interface FollowerRelation {
  _id: string;
  follower: {
    _id: string;
    username: string;
    avatar: string;
  };
}

interface FollowingRelation {
  _id: string;
  following: {
    _id: string;
    username: string;
    avatar: string;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  username?: string;
  posts: Post[];
  description?: string;
}

interface ProfileProps {
  userId?: string;
}

export const Profile: React.FC<ProfileProps> = ({ userId }) => {
  const { token } = useContext(AuthContext);

  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [followers, setFollowers] = useState<FollowerRelation[]>([]);
  const [following, setFollowing] = useState<FollowingRelation[]>([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [myId, setMyId] = useState<string | null>(null);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // Modal için post state'i

  const [posts, setPosts] = useState<Post[]>([]);

  const isOwnProfile = !userId;

  function handlePostDelete(deletedPostId: string) {
    setPosts(posts.filter((post) => post._id !== deletedPostId));
    setSelectedPost(null);
  }

  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      try {
        // 1. Adım: Profil verisini çekin
        const url = isOwnProfile ? 'http://localhost:3000/api/profile/me' : `http://localhost:3000/api/profile/${userId}`;
        const profileRes = await axios.get<User>(url, { headers: { Authorization: `Bearer ${token}` } });
        const profileId = profileRes.data._id;

        // 2. Adım: Diğer tüm verileri paralel olarak çekin
        const [postsRes, followersRes, followingRes, myFollowingRes] = await Promise.all([axios.get<Post[]>(`http://localhost:3000/posts/user/${profileId}`, { headers: { Authorization: `Bearer ${token}` } }), axios.get<{ count: number; followers: FollowerRelation[] }>(`http://localhost:3000/followers/${profileId}`, { headers: { Authorization: `Bearer ${token}` } }), axios.get<{ count: number; following: FollowingRelation[] }>(`http://localhost:3000/following/${profileId}`, { headers: { Authorization: `Bearer ${token}` } }), axios.get<{ following: { following: { _id: string } }[] }>('http://localhost:3000/following/me', { headers: { Authorization: `Bearer ${token}` } })]);

        // Gelen verilerle state'leri güncelleyin
        setUser(profileRes.data);
        setDescription(profileRes.data.description || '');
        setAvatarUrl(profileRes.data.avatar);
        setFollowers(followersRes.data.followers);
        setFollowing(followingRes.data.following);
        setMyId(profileRes.data._id);
        setFollowedUsers(myFollowingRes.data.following.map((f) => f.following._id));

        // 3. Adım: Post verilerini PostModal için gerekli bilgilerle zenginleştirin
        const postsWithDetails = await Promise.all(
          postsRes.data.map(async (post) => {
            const commentsRes = await axios.get<Comment[]>(`http://localhost:3000/comments/${post._id}`, { headers: { Authorization: `Bearer ${token}` } });
            const likesRes = await axios.get<{ likesCount: number; likedByUser: boolean }>(`http://localhost:3000/likes/${post._id}`, { headers: { Authorization: `Bearer ${token}` } });

            return {
              ...post,
              comments: commentsRes.data,
              likesCount: likesRes.data.likesCount,
              likedByUser: likesRes.data.likedByUser,
              author: {
                username: profileRes.data.username,
                _id: profileRes.data._id,
                avatar: profileRes.data.avatar,
              },
            };
          }),
        );
        setUser((prev) => (prev ? { ...prev, posts: postsWithDetails } : null));
      } catch (err) {
        setError('Profil verilerini yüklerken hata oluştu.');
        console.error(err);
      }
    }
    fetchData();
  }, [token, userId, isOwnProfile]);

  // Modal içindeki güncellemeleri yönetmek için bir fonksiyon
  const handleUpdatePost = (updatedPost: Post) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedPosts = prevUser.posts.map((post) => (post._id === updatedPost._id ? updatedPost : post));
      return { ...prevUser, posts: updatedPosts };
    });
    setSelectedPost(updatedPost);
  };

  // Takip etme/bırakma fonksiyonu
  const handleFollow = async () => {
    if (!token || !user || !myId) return;

    try {
      if (followedUsers.includes(user._id)) {
        await axios.delete(`http://localhost:3000/unfollow/${user._id}`, { headers: { Authorization: `Bearer ${token}` } });
        setFollowedUsers((prev) => prev.filter((id) => id !== user._id));
      } else {
        await axios.post(`http://localhost:3000/follow/${user._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setFollowedUsers((prev) => [...prev, user._id]);
      }
    } catch (err) {
      console.error('Takip işlemi başarısız', err);
    }
  };

  // Profile.tsx'in içindeki fonksiyonların olduğu yere ekleyin
  async function handlePostClick(postToOpen: Post) {
    try {
      const postWithLikes = await axios.get<Post>(`http://localhost:3000/posts/${postToOpen._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedPost(postWithLikes.data);
    } catch (error) {
      console.error('Post verisi çekilirken hata:', error);
    }
  }

  if (error) return <div>{error}</div>;
  if (!user) return <div>Загрузка...</div>;

  return (
    <div className={styles.mainContainer}>
      <div className={styles.profileContainer}>
        <div className={styles.avatarContainer}>
          <img src={avatarUrl || user.avatar} alt="Аватар" />
        </div>
        <div className={styles.mainUsernameContainer}>
          <div className={styles.usernameContainer}>
            <h2>{user.username}</h2>
            {isOwnProfile ? (
              <Link to="/edit-profile" className={styles.link}>
                Edit Profile
              </Link>
            ) : (
              <button onClick={handleFollow} className={styles.followBtn}>
                {followedUsers.includes(user._id) ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
          <div className={styles.userInfoContainer}>
            <div className={styles.postContainer}>
              <p className={styles.numberPost}>{user.posts.length}</p>
              <p className={styles.postText}>posts</p>
            </div>
            <div className={styles.postContainer}>
              <h3 className={styles.numberPost}>{followers.length}</h3>
              <p className={styles.postText}>followers</p>
            </div>
            <div className={styles.postContainer}>
              <h3 className={styles.numberPost}>{following.length}</h3>
              <p className={styles.postText}>following</p>
            </div>
          </div>
          <p className={styles.descriptionP}>{description}</p>
        </div>
      </div>
      <div className={styles.postGrid}>
        {user.posts.length === 0 ? (
          <p>Посты не найдены.</p>
        ) : (
          user.posts.map((post) => (
            <div key={post._id} onClick={() => handlePostClick(post)}>
              {post.image && <img src={post.image} alt="post" style={{ cursor: 'pointer' }} />}
            </div>
          ))
        )}
      </div>

      {/* Modalı koşullu olarak render etme */}
      {selectedPost && token && myId && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          token={token}
          currentUserId={myId}
          followedUsers={followedUsers}
          setFollowedUsers={setFollowedUsers}
          updatePostInFeed={handleUpdatePost}
          onPostDelete={handlePostDelete} // <- добавь сюда
        />
      )}
    </div>
  );
};
