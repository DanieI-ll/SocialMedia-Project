import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';

import like from '../../assets/like.svg';
import liked from '../../assets/liked.svg';
import comment from '../../assets/comment.svg';
import seeAll from '../../assets/seeAll.svg';

import emoji from '../../assets/emoji.svg';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

import styles from './PostsFeed.module.css';

interface Comment {
  _id: string;
  user: { username: string; avatar?: string };
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

interface PostsFeedProps {
  token: string;
  refresh?: boolean;
}

interface EmojiData {
  native: string;
}

export default function PostsFeed({ token, refresh }: PostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');
  const [, setAvatar] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showCommentInput, setShowCommentInput] = useState<Record<string, boolean>>({});
  const [commentsVisibleCount, setCommentsVisibleCount] = useState<Record<string, number>>({});
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

  // Yeni: Post silme işlemini PostsFeed state'ine yansıtan fonksiyon
  const handlePostDelete = (deletedPostId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== deletedPostId));
    setSelectedPost(null); // Modalı kapat
  };

  // Yeni: PostModal'dan gelen güncellenmiş post verisini işleyen fonksiyon
  const updatePostInFeed = (updatedPost: Post) => {
    setPosts((prevPosts) => prevPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
    if (selectedPost && selectedPost._id === updatedPost._id) {
      setSelectedPost(updatedPost);
    }
  };

  useEffect(() => {
    async function fetchPostsAndComments() {
      try {
        const res = await axios.get<Post[]>('http://localhost:3000/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Post verisini tersine çevirerek en yeniyi en üste getirin
        const reversedPostsData = res.data.reverse();

        const postsData = reversedPostsData.map((post) => ({
          ...post,
          comments: [],
          likesCount: typeof post.likesCount === 'number' ? post.likesCount : 0,
          likedByUser: typeof post.likedByUser === 'boolean' ? post.likedByUser : false,
        }));

        setPosts(postsData);
        setCommentsVisibleCount(postsData.reduce((acc, post) => ({ ...acc, [post._id]: 2 }), {}));

        const commentsPromises = postsData.map((post) =>
          axios
            .get<Comment[]>(`http://localhost:3000/comments/${post._id}`)
            .then((res) => ({ postId: post._id, comments: res.data }))
            .catch(() => ({ postId: post._id, comments: [] })),
        );

        const commentsResults = await Promise.all(commentsPromises);

        // Yorum verilerini post'a eklerken de sıralamanın bozulmadığından emin olun
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            const found = commentsResults.find((c) => c.postId === post._id);
            return found ? { ...post, comments: found.comments } : post;
          }),
        );
      } catch {
        setError('Ошибка загрузки постов или комментариев');
      }
    }

    async function fetchFollowing() {
      try {
        const res = await axios.get<{ following: { following: { _id: string } }[] }>('http://localhost:3000/following/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userIds = res.data.following.map((f) => f.following._id);
        setFollowedUsers(userIds);
      } catch {
        setError('Ошибка загрузки подписок');
      }
    }

    fetchPostsAndComments();
    fetchFollowing();
  }, [token, refresh]);

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
      setError('Ошибка при изменении подписки');
    }
  }

  async function handleLike(postId: string) {
    try {
      const res = await axios.post(`http://localhost:3000/likes/${postId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((posts) => posts.map((post) => (post._id === postId ? { ...post, likedByUser: res.data.likedByUser, likesCount: res.data.likesCount } : post)));

      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost({
          ...selectedPost,
          likedByUser: res.data.likedByUser,
          likesCount: res.data.likesCount,
        });
      }
    } catch {
      setError('Ошибка при лайке');
    }
  }

  async function handleAddComment(e: React.FormEvent, postId: string) {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text) return;

    try {
      const res = await axios.post('http://localhost:3000/comments', { postId, text }, { headers: { Authorization: `Bearer ${token}` } });
      setPosts((posts) => posts.map((post) => (post._id === postId ? { ...post, comments: [...post.comments, res.data] } : post)));
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch {
      setError('Ошибка при добавлении комментария');
    }
  }

  function toggleComments(postId: string) {
    setCommentsVisibleCount((prev) => {
      const currentCount = prev[postId] || 2;
      const totalComments = posts.find((p) => p._id === postId)?.comments.length || 0;
      return {
        ...prev,
        [postId]: currentCount === 2 ? totalComments : 2,
      };
    });
  }

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get('http://localhost:3000/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvatar(res.data.avatar);
        setCurrentUserId(res.data._id);
      } catch {
        console.error('Ошибка загрузки профиля');
      }
    }
    fetchProfile();
  }, [token]);

  if (error) return <p>{error}</p>;

  function PostModal({ post, onClose, onCommentAdded, onPostDelete }: { post: Post; onClose: () => void; onCommentAdded: (newComment: Comment) => void; onPostDelete: (deletedPostId: string) => void; updatePostInFeed: (updatedPost: Post) => void }) {
    const [commentInput, setCommentInput] = useState('');
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);

    // PostsFeed.tsx içindeki lokal PostModal bileşeni
    // function PostModal(...) { ... } bloğunun içine ekleyin

    async function handleLikeInModal() {
      try {
        const res = await axios.post(`http://localhost:3000/likes/${post._id}`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedPost = {
          ...post,
          likedByUser: res.data.likedByUser,
          likesCount: res.data.likesCount,
        };

        // Modal'daki post objesini güncelleyin
        post = updatedPost;

        // Ana bileşendeki post listesini güncelleyin
        updatePostInFeed(updatedPost);

        // Modalın yeniden render edilmesini sağlamak için bir state güncellenebilir,
        // ancak `updatePostInFeed` zaten üst bileşeni güncellediği için
        // genellikle bu yeterli olur.
      } catch {
        console.error('Liking error in modal');
      }
    }

    // Ayarlar menüsüne ait fonksiyonlar
    async function handleDeletePost() {
      try {
        await axios.delete(`http://localhost:3000/posts/${post._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        onPostDelete(post._id); // Üst bileşene postun silindiğini bildir
        onClose(); // Modalı kapat
      } catch (error) {
        console.error('Post silme hatası:', error);
      }
    }

    function handleEditPost() {
      console.log('Post düzenleme sayfasına git');
      setShowSettingsMenu(false);
    }

    function handleGoToPost() {
      console.log('Post sayfasına git');
      setShowSettingsMenu(false);
    }

    function handleCopyLink() {
      navigator.clipboard
        .writeText(`http://localhost:3000/posts/${post._id}`)
        .then(() => {
          alert('Succesfuly copied!');
          setShowSettingsMenu(false);
        })
        .catch((err) => {
          console.error('Error Copy!', err);
        });
    }

    async function handleAddCommentInModal(e: React.FormEvent, postId: string) {
      e.preventDefault();
      if (!commentInput) return;

      try {
        const res = await axios.post('http://localhost:3000/comments', { postId, text: commentInput }, { headers: { Authorization: `Bearer ${token}` } });
        onCommentAdded(res.data);
        setCommentInput('');
      } catch {
        setError('Yorum eklenirken hata oluştu');
      }
    }

    // Modaldan dışarı tıklandığında menüyü kapat
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
                    <b className={styles.boldText}>{c.user?.username ?? 'Неизвестный'}:</b> {c.text}
                  </p>
                </div>
              ))}
            </div>
            <div className={styles.modalLikeComment}>
              <div className={styles.likeCommentBlock}>
                <div className={styles.likeBlock}>
                  <img style={{ cursor: 'pointer' }} src={post.likedByUser ? liked : like} alt="like" onClick={handleLikeInModal} />
                  <img
                    src={comment}
                    alt="comment"
                    onClick={() =>
                      setShowCommentInput((prev) => ({
                        ...prev,
                        [post._id]: !prev[post._id],
                      }))
                    }
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <p>{post.likesCount} likes</p>
                <p className={styles.postTimeModal}> {timeAgo(post.createdAt)} </p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <form className={styles.commentInput} onSubmit={(e) => handleAddCommentInModal(e, post._id)}>
                <div className={styles.emojiBtn} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  <img src={emoji} alt="emoji" />
                </div>
                {showEmojiPicker && (
                  <div className={styles.emojiPicker}>
                    <Picker
                      data={data}
                      onEmojiSelect={(emoji: EmojiData) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post._id]: (prev[post._id] || '') + emoji.native,
                        }))
                      }
                    />
                  </div>
                )}
                <input style={{ border: 'none' }} type="text" value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="Add Comment" />
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

  function handleCommentAddedInModal(newComment: Comment) {
    if (selectedPost) {
      setSelectedPost({
        ...selectedPost,
        comments: [...selectedPost.comments, newComment],
      });
      setPosts((prevPosts) => prevPosts.map((p) => (p._id === selectedPost._id ? { ...p, comments: [...p.comments, newComment] } : p)));
    }
  }

  return (
    <div className={styles.mainContainerAll}>
      <div className={styles.feed}>
        {posts.length === 0 && <p>Посты не найдены.</p>}
        {posts.map((post) => {
          const visibleCount = commentsVisibleCount[post._id] || 2;
          const isExpanded = visibleCount > 2;
          const hasMore = post.comments.length > 2;

          return (
            <div key={post._id} className={styles.post}>
              <div className={styles.postData}>
                <img src={post.author.avatar || '/default-avatar.png'} alt="Profile" className={styles.avatar} onClick={() => navigate(`/profile/${post.author._id}`)} style={{ cursor: 'pointer' }} />

                <p className={styles.avatarUsername}>{post.author.username}</p>
                <p className={styles.postTime}>• {timeAgo(post.createdAt)} •</p>

                {post.author._id !== currentUserId && (
                  <p className={styles.followBtn} onClick={() => toggleFollow(post.author._id)} style={{ cursor: 'pointer', color: followedUsers.includes(post.author._id) ? '#0095f6' : '#0095f6' }}>
                    {followedUsers.includes(post.author._id) ? 'following' : 'follow'}
                  </p>
                )}
              </div>

              {post.image && <img src={post.image} alt="post" style={{ width: '400px', height: '500px', borderRadius: '7px', cursor: 'pointer' }} onClick={() => setSelectedPost(post)} />}

              {selectedPost && (
                <PostModal
                  post={selectedPost}
                  onClose={() => setSelectedPost(null)}
                  onCommentAdded={handleCommentAddedInModal}
                  onPostDelete={handlePostDelete} // Yeni prop
                  updatePostInFeed={updatePostInFeed} // Yeni prop
                />
              )}

              <div className={styles.likeCommentBlock}>
                <div className={styles.likeBlock}>
                  {(() => {
                    console.log(`Post ID: ${post._id}, likedByUser: ${post.likedByUser}`);
                    return null;
                  })()}
                  <img style={{ cursor: 'pointer' }} src={post.likedByUser ? liked : like} alt="like" onClick={() => handleLike(post._id)} />

                  <img
                    src={comment}
                    alt="comment"
                    onClick={() =>
                      setShowCommentInput((prev) => ({
                        ...prev,
                        [post._id]: !prev[post._id],
                      }))
                    }
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <p>{post.likesCount} likes</p>
              </div>

              <div className={styles.description}>
                <p className={styles.author}>{post.author.username}</p>
                <p className={styles.descriptionPost}>{post.description}</p>
              </div>

              <div className={styles.more}>
                <div className={styles.comments}>
                  <div>
                    {post.comments.slice(0, visibleCount).map((c) => (
                      <p key={c._id}>
                        <b>{c.user?.username ?? 'Неизвестный'}:</b> {c.text}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  {hasMore && (
                    <a onClick={() => toggleComments(post._id)} className={styles.seeMoreBtn}>
                      {isExpanded ? 'View less comments ' : 'View all comments'}
                    </a>
                  )}
                </div>
              </div>

              <div>
                {showCommentInput[post._id] && (
                  <form style={{ display: 'flex' }} onSubmit={(e) => handleAddComment(e, post._id)}>
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
                      placeholder="Add comment..."
                    />
                    <button style={{ marginLeft: '-5px' }} className={styles.commentButton} type="submit">
                      Send
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.seeAllContainer}>
        <div className={styles.img}>
          <img src={seeAll} alt="seeAll" />
        </div>
        <p className={styles.mainText}>Tüm güncellemeleri gördünüz</p>
        <p className={styles.secondText}>Tüm yeni yayınları görüntülediniz</p>
      </div>
    </div>
  );
}
