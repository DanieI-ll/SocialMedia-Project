import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext/AuthContext';
import styles from './EditProfilePage.module.css';

export default function EditProfilePage() {
  const { token } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState<File | string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get('http://localhost:3000/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName(res.data.name || '');
        setUsername(res.data.username || '');
        setDescription(res.data.description || '');
        setAvatar(res.data.avatar || null);
      } catch (err) {
        console.error('Ошибка загрузки профиля', err);
      }
    }
    if (token) fetchProfile();
  }, [token]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('username', username);
    formData.append('description', description);
    if (avatar instanceof File) formData.append('avatar', avatar);

    try {
      const res = await axios.put('http://localhost:3000/api/profile/me', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setName(res.data.name);
      setUsername(res.data.username);
      setDescription(res.data.description);
      setAvatar(res.data.avatar); // Всегда ставим строку с нового URL
      alert('Профиль обновлен');
    } catch (err) {
      console.error('Ошибка сохранения профиля', err);
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = avatar ? (typeof avatar === 'string' ? avatar : URL.createObjectURL(avatar)) : '/default-avatar.png';

  return (
    <div className={styles.mainContainer}>
      <h2 className={styles.mainText}>Edit Profile</h2>

      <form className={styles.formEvent} onSubmit={handleSubmit}>
        <div className={styles.imgChangeContainer}>
          <div className={styles.imgContainer}>
            <img src={avatarSrc} alt="avatar" />
          </div>
          <div>
            <p className={styles.usernameContainer}>{username || 'New User'}</p>
            <p className={styles.descriptionContainer}>{description}</p>
          </div>
          <label className={styles.inputImg}>
            New photo
            <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
          </label>
        </div>

        <div className={styles.editBlock}>
          <p className={styles.header}>Username</p>
          <input className={styles.input} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />

          <p className={styles.header}>Website</p>
          <input className={styles.input} type="text" placeholder="Website" />

          <p className={styles.header}>About</p>
          <div className={styles.flexBtn}>
            <textarea className={styles.input} id={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="About yourself" rows={4} maxLength={150} />
            <span className={styles.charCount}>{description.length}/150</span>
            <button className={styles.buttonDown} type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
