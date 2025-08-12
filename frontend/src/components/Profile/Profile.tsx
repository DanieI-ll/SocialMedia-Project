import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext/AuthContext';
import { Link } from 'react-router-dom';
import websiteImg from '../../assets/website.svg';
import verified from '../../assets/verified.svg'; // Yeni: Mavi tik simgesini import ettik

import styles from './Profile.module.css';
import PostModal from '../PostModal/PostModal'; // PostModal'ı import edin

interface Comment {
  _id: string;
  user: {
    username: string;
    isBlueVerified?: boolean; // Yeni: Yorum yapan kullanıcının mavi tik durumu
  };
  text: string;
}

interface Post {
  _id: string;
  description: string;
  image?: string;
  createdAt: string;
  author: {
    username?: string;
    _id: string;
    avatar?: string;
    isBlueVerified?: boolean; // Yeni: Post yazarının mavi tik durumu
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
  website?: string;
  isBlueVerified?: boolean; // Yeni: Kullanıcının mavi tik durumu
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
  const [website, setWebSite] = useState('');
  const [error, setError] = useState('');
  const [myId, setMyId] = useState<string | null>(null);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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
        const url = isOwnProfile ? 'http://localhost:3000/api/profile/me' : `http://localhost:3000/api/users/${userId}`; // URL'yi düzelttik
        const profileRes = await axios.get<User>(url, { headers: { Authorization: `Bearer ${token}` } });
        const profileId = profileRes.data._id;

        const [postsRes, followersRes, followingRes, myFollowingRes] = await Promise.all([axios.get<Post[]>(`http://localhost:3000/posts/user/${profileId}`, { headers: { Authorization: `Bearer ${token}` } }), axios.get<{ count: number; followers: FollowerRelation[] }>(`http://localhost:3000/followers/${profileId}`, { headers: { Authorization: `Bearer ${token}` } }), axios.get<{ count: number; following: FollowingRelation[] }>(`http://localhost:3000/following/${profileId}`, { headers: { Authorization: `Bearer ${token}` } }), axios.get<{ following: { following: { _id: string } }[] }>('http://localhost:3000/following/me', { headers: { Authorization: `Bearer ${token}` } })]);

        setUser(profileRes.data);
        setDescription(profileRes.data.description || '');
        setWebSite(profileRes.data.website || '');
        setAvatarUrl(profileRes.data.avatar);
        setFollowers(followersRes.data.followers);
        setFollowing(followingRes.data.following);
        setMyId(profileRes.data._id);
        setFollowedUsers(myFollowingRes.data.following.map((f) => f.following._id));

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
                isBlueVerified: profileRes.data.isBlueVerified,
              },
            };
          }),
        );
        setPosts(postsWithDetails);
        setUser((prev) => (prev ? { ...prev, posts: postsWithDetails } : null));
      } catch (err) {
        setError('Profil verilerini yüklerken hata oluştu.');
        console.error(err);
      }
    }
    fetchData();
  }, [token, userId, isOwnProfile]);

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts((prevPosts) => prevPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
    if (selectedPost && selectedPost._id === updatedPost._id) {
      setSelectedPost(updatedPost);
    }
  };

  const handleFollow = async () => {
    if (!token || !user || !myId) return;

    try {
      if (followedUsers.includes(user._id)) {
        await axios.delete(`http://localhost:3000/unfollow/${user._id}`, { headers: { Authorization: `Bearer ${token}` } });
        setFollowers((prev) => prev.filter((f) => f.follower._id !== myId));
        setFollowedUsers((prev) => prev.filter((id) => id !== user._id));
      } else {
        await axios.post(`http://localhost:3000/follow/${user._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        const newFollower: FollowerRelation = {
          _id: '',
          follower: {
            _id: myId,
            username: '',
            avatar: '',
          },
        };
        setFollowers((prev) => [...prev, newFollower]);
        setFollowedUsers((prev) => [...prev, user._id]);
      }
    } catch (err) {
      console.error('Takip işlemi başarısız', err);
    }
  };

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
            <h2 className={styles.username}>
              {user.username}
              {user.isBlueVerified && <img src={verified} alt="Verified" className={styles.verifiedIcon} />}
            </h2>
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
              <p className={styles.numberPost}>{posts.length}</p>
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
          {website && (
            <a className={styles.websiteContainer} href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer">
              <img src={websiteImg} alt="website" />
              {website}
            </a>
          )}
        </div>
      </div>
      <div className={styles.postGrid}>
        {posts.length === 0 ? (
          <p>Посты не найдены.</p>
        ) : (
          posts.map((post) => (
            <div key={post._id} onClick={() => handlePostClick(post)}>
              {post.image && <img src={post.image} className={styles.postSize} alt="post" style={{ cursor: 'pointer' }} />}
            </div>
          ))
        )}
      </div>

      {selectedPost && token && myId && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} token={token} currentUserId={myId} followedUsers={followedUsers} setFollowedUsers={setFollowedUsers} updatePostInFeed={handleUpdatePost} onPostDelete={handlePostDelete} />}
    </div>
  );
};
