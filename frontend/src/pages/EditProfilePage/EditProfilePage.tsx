import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext/AuthContext';

export default function EditProfilePage() {
  const { token } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    if (avatar) formData.append('avatar', avatar);

    try {
      await axios.put('http://localhost:3000/api/profile', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      alert('Профиль обновлен');
    } catch (err) {
      console.error('Ошибка сохранения профиля', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Редактировать профиль</h2>
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
}
