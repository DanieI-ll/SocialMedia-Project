import { useState, useRef } from 'react';
import axios from 'axios';
import styles from './CreatePostForm.module.css';
import upload from '../../assets/upload.svg';
import emoji from '../../assets/emoji.svg';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

interface CreatePostFormProps {
  token: string;
  avatar: string;
  username: string;
  onPostCreated: () => void;
}

interface EmojiData {
  native: string;
}

export default function CreatePostForm({ token, onPostCreated, avatar, username }: CreatePostFormProps) {
  const [description, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async () => {
    if (!description.trim() && !image) return;
    setLoading(true);
    setSuccessMsg('');
    try {
      const formData = new FormData();
      formData.append('description', description);
      if (image) formData.append('image', image);
      await axios.post('http://localhost:3000/posts/create', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg('Пост успешно опубликован!');
      setContent('');
      setImage(null);
      onPostCreated();
      window.location.reload();
    } catch {
      alert('Ошибка при создании поста');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setImage(e.dataTransfer.files[0]);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      {/* Header kısmı: Avatar + Başlık + Share butonu */}
      <div className={styles.createHeader}>
        <div className={styles.userInfo}>
          <div className={styles.relative}>
            {avatar && <img src={avatar} alt="User avatar" className={styles.avatar} />} <p>{username}</p>
          </div>
          <h3>Create New Post</h3>
        </div>
        <a className={`${styles.shareButton} ${loading ? styles.disabled : ''}`} onClick={loading ? undefined : handleSubmit}>
          {loading ? 'Loading...' : 'Share'}
        </a>
      </div>

      <div className={styles.flexElements}>
        {/* Drag & Drop Alanı */}
        <div
          className={`${styles.dropArea} ${isDragOver ? styles.dragOver : ''}`}
          onClick={handleFileClick}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {image ? <p>{image.name}</p> : <img src={upload} alt="img" />}
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setImage(e.target.files?.[0] || null)} />
        </div>

        {/* Textarea + Emoji + Sayaç */}
        <div className={styles.textareaWrapper}>
          <textarea value={description} onChange={(e) => e.target.value.length <= 2200 && setContent(e.target.value)} placeholder="Что у вас нового?" />
          <div className={styles.emojiBtn} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <img src={emoji} alt="emoji" />
          </div>
          {showEmojiPicker && (
            <div className={styles.emojiPicker}>
              <Picker data={data} onEmojiSelect={(emoji: EmojiData) => setContent((prev) => prev + emoji.native)} />
            </div>
          )}

          <div className={styles.charCount}>{description.length}/2200</div>
        </div>
      </div>
      {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
    </div>
  );
}
