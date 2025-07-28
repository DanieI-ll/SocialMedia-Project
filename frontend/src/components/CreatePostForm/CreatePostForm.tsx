import { useState } from 'react';
import axios from 'axios';
import styles from './CreatePostForm.module.css';

interface CreatePostFormProps {
  token: string;
  onPostCreated: () => void;
}

export default function CreatePostForm({ token, onPostCreated }: CreatePostFormProps) {
  const [description, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim() && !image) return;
    setLoading(true);
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('description', description);
      if (image) formData.append('image', image);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  return (
    <div>
      <div className={styles.createHeader}>
        <h3>Create New Post</h3>
        <a className={`${styles.shareButton} ${loading ? styles.disabled : ''}`} onClick={loading ? undefined : handleSubmit}>
          {loading ? 'Loading...' : 'Share'}
        </a>
      </div>

      <div className={styles.flexElements}>
        <div className={`${styles.dropArea} ${isDragOver ? styles.dragOver : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          {image ? <p>{image.name}</p> : <p>Перетащите изображение сюда или выберите файл</p>}
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        </div>

        <textarea value={description} onChange={(e) => setContent(e.target.value)} placeholder="Что у вас нового?" required />
      </div>

      {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
    </div>
  );
}
