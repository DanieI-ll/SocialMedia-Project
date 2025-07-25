import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext/AuthContext';

type Post = {
  _id: string;
  description: string;
  image?: string;
  author: {
    username: string;
  };
};

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  username?: string;
  posts: Post[];
};

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/djsqoq2zs/upload';
const CLOUDINARY_UPLOAD_PRESET = 'myNewPreset';

export const Profile: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    async function fetchUser() {
      try {
        const res = await axios.get('http://localhost:3000/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setName(res.data.name);
        setAvatarUrl(res.data.avatar);
      } catch (err) {
        setError('Ошибка загрузки профиля');
        console.error(err);
      }
    }
    fetchUser();
  }, [token]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const uploadAvatar = async (): Promise<string> => {
    if (!avatarFile) return avatarUrl;

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
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div>{error}</div>;
  if (!user) return <div>Загрузка...</div>;

  return (
    <div>
      <h1>Профиль</h1>
      <img src={avatarUrl || undefined} alt="Аватар" width={100} height={100} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>

      <h3>Посты пользователя</h3>
      {!user.posts || user.posts.length === 0 ? (
        <p>Посты не найдены.</p>
      ) : (
        user.posts.map((post) => (
          <div key={post._id}>
            <p>
              <b>Автор:</b> {post.author.username}
            </p>
            <p>{post.description}</p>
            {post.image && <img src={post.image} alt="post" style={{ maxWidth: '300px' }} />}
          </div>
        ))
      )}

      <h3>Редактировать профиль</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" required />
        <br />
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Сохраняю...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
};
