import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import like from '../../assets/like.svg';
import liked from '../../assets/liked.svg';
import comment from '../../assets/comment.svg';
import emoji from '../../assets/emoji.svg';
import verified from '../../assets/verified.svg'; // Mavi tik simgesi eklendi
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import styles from './PostModal.module.css';

interface Comment {
  _id: string;
  user: { username: string; avatar?: string; isBlueVerified?: boolean }; // Mavi tik eklendi
  text: string;
}

interface Post {
  _id: string;
  description: string;
  image?: string;
  author: { username?: string; _id: string; avatar?: string; isBlueVerified?: boolean }; // Mavi tik eklendi
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
  onPostDelete: (deletedPostId: string) => void;
}

interface EmojiData {
  native: string;
}

export default function PostModal({ post, onClose, token, currentUserId, followedUsers, setFollowedUsers, updatePostInFeed, onPostDelete }: PostModalProps) {
  const [commentInput, setCommentInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(post.description);

  function handleProfileClick() {
    onClose();
    navigate(`/profile/${post.author._id}`);
  }

  async function handleDeletePost() {
    try {
      await axios.delete(`http://localhost:3000/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onPostDelete(post._id);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Post silme hatası:', error);
    }
  }

  function handleEditPost() {
    setIsEditing(true);
    setShowSettingsMenu(false);
  }

  async function handleSaveEdit() {
    try {
      const res = await axios.put(
        `http://localhost:3000/posts/${post._id}`,
        { description: editedDescription },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const updatedPost = {
        ...post,
        description: res.data.description,
      };

      updatePostInFeed(updatedPost);
      setIsEditing(false);
    } catch (error) {
      console.error('Post düzenleme hatası:', error);
    }
  }

  function handleCancelEdit() {
    setEditedDescription(post.description);
    setIsEditing(false);
  }

  function handleGoToPost() {
    console.log('Post sayfasına git');
    setShowSettingsMenu(false);
  }

  function handleCopyLink() {
    navigator.clipboard
      .writeText(`http://localhost:3000/posts/${post._id}`)
      .then(() => {
        alert('Link kopyalandı!');
        setShowSettingsMenu(false);
      })
      .catch((err) => {
        console.error('Link kopyalama hatası:', err);
      });
  }

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
      console.error('Follow status change error');
    }
  }

  async function handleLike() {
    try {
      const res = await axios.post(`http://localhost:3000/likes/${post._id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updatePostInFeed({ ...post, likedByUser: res.data.likedByUser, likesCount: res.data.likesCount });
    } catch {
      console.error('Liking error');
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentInput) return;

    try {
      const res = await axios.post('http://localhost:3000/comments', { postId: post._id, text: commentInput }, { headers: { Authorization: `Bearer ${token}` } });
      const newComment = res.data;

      updatePostInFeed({ ...post, comments: [...post.comments, newComment] });
      setCommentInput('');
    } catch {
      console.error('Adding comment error');
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      {showSettingsMenu && <div className={styles.settingsBackdrop} onClick={() => setShowSettingsMenu(false)} />}
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalImageWrapper}>
          <img src={post.image} alt="Post" />
        </div>
        <div className={styles.modalSide}>
          <div className={styles.modalHeader}>
            <div className={styles.headerInfo}>
              <img
                src={post.author.avatar || '/default-avatar.png'}
                alt="avatar"
                className={styles.modalAvatar}
                onClick={handleProfileClick}
                style={{ cursor: 'pointer' }}
              />
              <p className={styles.modalUsername} onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                {post.author.username}
                {post.author.isBlueVerified && <img src={verified} alt="Verified" className={styles.verifiedIcon} />} {/* Mavi tik eklendi */}
              </p>
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
            <div className={styles.settingsWrapper}>
              <div className={styles.settingsIcon} onClick={() => setShowSettingsMenu(!showSettingsMenu)}>
                ...
              </div>
              {showSettingsMenu && (
                <div className={styles.settingsMenu}>
                  {post.author._id === currentUserId && (
                    <>
                      <div className={`${styles.settingsMenuItem} ${styles.danger}`} onClick={handleDeletePost}>
                        <p style={{ color: 'red' }}> Delete</p>
                      </div>
                      <div className={styles.settingsMenuItem} onClick={handleEditPost}>
                        Edit
                      </div>
                    </>
                  )}
                  <div className={styles.settingsMenuItem} onClick={handleGoToPost}>
                    Go to post
                  </div>
                  <div className={styles.settingsMenuItem} onClick={handleCopyLink}>
                    Copy link
                  </div>
                  <div className={styles.settingsMenuItem} onClick={() => setShowSettingsMenu(false)}>
                    Cancel
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={styles.flexContainer} style={{ marginBottom: '15px' }}>
            <div className={styles.flexContainer}>
              <img src={post.author.avatar || '/default-avatar.png'} alt="avatar" className={styles.modalAvatar}/>
              <p className={styles.modalUsername}>
                {post.author.username}
                {post.author.isBlueVerified && <img src={verified} alt="Verified" className={styles.verifiedIcon} />} {/* Mavi tik eklendi */}
              </p>
            </div>
            <span className={styles.space}></span>
            <div>
              {isEditing ? (
                <div className={styles.modalWrapperEdit}>
                  <textarea className={styles.editDescription} value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} />
                  <div className={styles.editButtons}>
                    <button className={styles.saveButton} onClick={handleSaveEdit}>
                      Save
                    </button>
                    <button className={styles.cancelButton} onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className={styles.postDescripton}>{post.description}</p>
              )}
            </div>
          </div>
          <div className={styles.modalComments}>
            {post.comments?.map((c) => (
              <div key={c._id} className={styles.commentItem}>
                <img src={c.user.avatar || '/default-avatar.png'} alt="avatar" className={styles.commentAvatar}/>
                <p>
                  <b className={styles.boldText}>
                    {' '}
                    {c.user.username}
                    {c.user.isBlueVerified && <img src={verified} alt="Verified" className={styles.verifiedIcon} />} {/* Mavi tik eklendi */}
                  </b>{' '}
                  {c.text}
                </p>
              </div>
            ))}
          </div>
          <div className={styles.modalLikeComment}>
            <div className={styles.likeCommentBlock}>
              <div className={styles.likeBlock}>
                <img style={{ cursor: 'pointer' }} src={post.likedByUser ? liked : like} alt="like" onClick={handleLike} />
                <img src={comment} alt="comment" style={{ cursor: 'pointer' }} />
              </div>
              <p>{post.likesCount} likes</p>
              <p className={styles.postTimeModal}> {timeAgo(post.createdAt)} </p>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <form className={styles.commentInput} onSubmit={handleAddComment}>
              <div className={styles.emojiBtn} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <img src={emoji} alt="emoji" />
              </div>
              {showEmojiPicker && (
                <div className={styles.emojiPicker}>
                  <Picker data={data} onEmojiSelect={(emoji: EmojiData) => setCommentInput((prev) => prev + emoji.native)} />
                </div>
              )}
              <input style={{ border: 'none' }} type="text" value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="Add comment..." />
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