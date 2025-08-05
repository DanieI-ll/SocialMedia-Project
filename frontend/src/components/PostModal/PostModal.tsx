import { useState } from 'react';
import axios from 'axios';
import like from '../../assets/like.svg';
import liked from '../../assets/liked.svg';
import comment from '../../assets/comment.svg';
import styles from './PostModal.module.css'; // Yeni bir CSS dosyası oluşturabilirsin

// Props tiplerini tanımlayalım
interface Comment {
  _id: string;
  user: { username: string; avatar?: string }; // добавили avatar
  text: string;
}

interface Post {
  _id: string;
  description: string;
  image?: string;
  author: { username?: string; _id: string; avatar?: string };
  likesCount: number;
  likedByUser: boolean;
  comments: Comment[];
  createdAt: string;
}

interface PostModalProps {
  post: Post;
  onClose: () => void;
  token: string;
  currentUserId: string;
  followedUsers: string[];
  setFollowedUsers: React.Dispatch<React.SetStateAction<string[]>>;
  updatePostInFeed: (updatedPost: Post) => void;
}

export default function PostModal({ post, onClose, token, currentUserId, followedUsers, setFollowedUsers, updatePostInFeed }: PostModalProps) {
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  function timeAgo(dateString: string) {
    const now = new Date();
    const createdDate = new Date(dateString);
    const diffMs = now.getTime() - createdDate.getTime();
    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }

  async function toggleFollow(userId: string) {
    try {
      if (followedUsers.includes(userId)) {
        await axios.delete(`http://localhost:3000/unfollow/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowedUsers((prev) => prev.filter((id) => id !== userId));
      } else {
        await axios.post(`http://localhost:3000/follow/${userId}`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowedUsers((prev) => [...prev, userId]);
      }
    } catch {
      console.error('Ошибка при изменении подписки');
    }
  }

  async function handleLike(postId: string) {
    try {
      const res = await axios.post(`http://localhost:3000/likes/${postId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Post'u güncelleyip üst komponente iletiyoruz
      const updatedPost = { ...post, likedByUser: res.data.likedByUser, likesCount: res.data.likesCount };
      updatePostInFeed(updatedPost);
    } catch {
      console.error('Ошибка при лайке');
    }
  }

  async function handleAddComment(e: React.FormEvent, postId: string) {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text) return;

    try {
      const res = await axios.post('http://localhost:3000/comments', { postId, text }, { headers: { Authorization: `Bearer ${token}` } });
      const updatedPost = { ...post, comments: [...post.comments, res.data] };
      updatePostInFeed(updatedPost);
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch {
      console.error('Ошибка при добавлении комментария');
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalImageWrapper}>
          <img src={post.image} alt="Post" />
        </div>
        <div className={styles.modalSide}>
          <div className={styles.modalHeader}>
            <img src={post.author.avatar || '/default-avatar.png'} alt="avatar" className={styles.modalAvatar} />
            <p className={styles.modalUsername}>{post.author.username}</p>
            <span className={styles.dot}>•</span>
            {post.author._id !== currentUserId && (
              <p
                className={styles.followBtn}
                onClick={() => toggleFollow(post.author._id)}
                style={{
                  cursor: 'pointer',
                  color: followedUsers.includes(post.author._id) ? '#0095f6' : '#0095f6',
                }}
              >
                {followedUsers.includes(post.author._id) ? 'following' : 'follow'}
              </p>
            )}
          </div>
          <div className={styles.flexContainer}>
            <div className={styles.flexContainer}>
              <img src={post.author.avatar || '/default-avatar.png'} alt="avatar" className={styles.modalAvatar} />
              <p className={styles.modalUsername}>{post.author.username}</p>
            </div>
            <span className={styles.space}></span>
            <div>
              <p className={styles.postDescripton}>{post.description}</p>
            </div>
          </div>
          <div className={styles.modalComments}>
            {post.comments.map((c) => (
              <div key={c._id} className={styles.commentItem}>
                <img src={c.user.avatar || '/default-avatar.png'} alt="avatar" className={styles.commentAvatar} />
                <p>
                  <b className={styles.boldText}>{c.user.username}</b> {c.text}
                </p>
              </div>
            ))}
          </div>

          <div className={styles.modalLikeComment}>
            <div className={styles.likeCommentBlock}>
              <div className={styles.likeBlock}>
                <img style={{ cursor: 'pointer' }} src={post.likedByUser ? liked : like} alt="like" onClick={() => handleLike(post._id)} />
                <img src={comment} alt="comment" style={{ cursor: 'pointer' }} />
              </div>
              <p>{post.likesCount} likes</p>
              <p className={styles.postTimeModal}> {timeAgo(post.createdAt)} </p>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <form className={styles.commentInput} onSubmit={(e) => handleAddComment(e, post._id)}>
              <input
                style={{ border: 'none' }}
                type="text"
                value={commentInputs[post._id] || ''}
                onChange={(e) =>
                  setCommentInputs((prev) => ({
                    ...prev,
                    [post._id]: e.target.value,
                  }))
                }
                placeholder="Add Comment"
              />
              <button className={styles.commentButton} type="submit">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
