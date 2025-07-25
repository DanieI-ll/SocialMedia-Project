// src/components/CreatePostForm/CreatePostForm.tsx
import { useState } from 'react';
import axios from 'axios';

interface CreatePostFormProps {
  token: string;
  onPostCreated: () => void;
}

export default function CreatePostForm({ token, onPostCreated }: CreatePostFormProps) {
  const [description, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('description', description);
      if (image) formData.append('image', image); // <-- имя поля 'image', как в бэке

      await axios.post('http://localhost:3000/posts', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMsg('Пост успешно опубликован!');
      setContent('');
      setImage(null);
      onPostCreated();
    } catch {
      alert('Ошибка при создании поста');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={description} onChange={(e) => setContent(e.target.value)} placeholder="Что у вас нового?" required />
      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
      <button type="submit" disabled={loading}>
        {loading ? 'Публикуем...' : 'Опубликовать'} {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
      </button>
    </form>
  );
}
