import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext/AuthContext';
import { Link } from 'react-router-dom';

import styles from './Profile.module.css';

type Post = {
  _id: string;
  description: string;
  image?: string;
  author: {
    username: string;
  };
};

type User = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  username?: string;
  posts: Post[];
};

type Follower = {
  _id: string;
  username: string;
  avatar: string;
};

interface ProfileProps {
  userId?: string;
}

export const Profile: React.FC<ProfileProps> = ({ userId }) => {
  const { token } = useContext(AuthContext);

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isOwnProfile = !userId;

  useEffect(() => {
    if (!token) return;

    async function fetchProfile() {
      try {
        const url = isOwnProfile ? 'http://localhost:3000/api/profile/me' : `http://localhost:3000/api/profile/${userId}`;
        const res = await axios.get<User>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        if (isOwnProfile) {
          setName(res.data.name);
          setAvatarUrl(res.data.avatar);
        }
      } catch (err) {
        setError('Ошибка загрузки профиля');
        console.error(err);
      }
    }

    async function fetchFollowersFollowing() {
      try {
        const userParam = isOwnProfile ? 'me' : userId;
        const [followersRes, followingRes] = await Promise.all([
          axios.get<{ followers: Follower[] }>(`http://localhost:3000/api/followers/${userParam}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<{ following: Follower[] }>(`http://localhost:3000/api/following/${userParam}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setFollowers(followersRes.data.followers);
        setFollowing(followingRes.data.following);
      } catch (err) {
        console.error('Ошибка загрузки подписчиков/подписок', err);
      }
    }

    fetchProfile();
    fetchFollowersFollowing();
  }, [token, userId, isOwnProfile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const uploadAvatar = async (): Promise<string> => {
    if (!avatarFile) return avatarUrl;

    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/djsqoq2zs/upload';
    const CLOUDINARY_UPLOAD_PRESET = 'myNewPreset';

    const formData = new FormData();
    formData.append('file', avatarFile);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await axios.post(CLOUDINARY_URL, formData);
      return res.data.secure_url;
    } catch (err) {
      console.error('Ошибка загрузки аватара:', err);
      return avatarUrl;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const uploadedAvatarUrl = await uploadAvatar();

    try {
      await axios.put('http://localhost:3000/api/profile/me', { name, avatar: uploadedAvatarUrl }, { headers: { Authorization: `Bearer ${token}` } });
      setUser((prev) => (prev ? { ...prev, name, avatar: uploadedAvatarUrl } : null));
      setAvatarUrl(uploadedAvatarUrl);
    } catch (err) {
      console.error('Ошибка обновления профиля:', err);
      setError('Ошибка обновления профиля');
    } finally {
      setLoading(false);
    }
  };

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
            {isOwnProfile && (
              <Link to="/edit-profile" className={styles.link}>
                Edit Profile
              </Link>
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
              {followers.length === 0 ? (
                <p></p>
              ) : (
                followers.map((follower) => (
                  <div key={follower._id}>
                    <img src={follower.avatar} alt={follower.username} width={30} height={30} />
                    <span>{follower.username}</span>
                  </div>
                ))
              )}
            </div>

            <div className={styles.postContainer}>
              <h3 className={styles.numberPost}>{following.length}</h3>
              <p className={styles.postText}>following</p>
              {following.length === 0 ? (
                <p></p>
              ) : (
                following.map((followed) => (
                  <div key={followed._id}>
                    <img src={followed.avatar} alt={followed.username} width={30} height={30} />
                    <span>{followed.username}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <p>description</p>
        </div>
      </div>
      <div className={styles.postGrid}>{user.posts.length === 0 ? <p>Посты не найдены.</p> : user.posts.map((post) => <div key={post._id}>{post.image && <img src={post.image} alt="post" />}</div>)}</div>
    </div>
  );
};
