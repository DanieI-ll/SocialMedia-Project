import { useEffect, useState } from 'react';
import axios from 'axios';

import like from '../../assets/like.svg';
import liked from '../../assets/liked.svg';
import comment from '../../assets/comment.svg';
import seeAll from '../../assets/seeAll.svg';

import styles from './PostsFeed.module.css';

interface Comment {
  _id: string;
  user: { username: string };
  text: string;
}

interface Post {
  _id: string;
  description: string;
  image?: string;
  author: { username: string; _id: string; avatar?: string }; // добавлено avatar
  likesCount: number;
  likedByUser: boolean;
  comments: Comment[];
  createdAt: string;
}

interface PostsFeedProps {
  token: string;
  refresh?: boolean;
}

export default function PostsFeed({ token, refresh }: PostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showCommentInput, setShowCommentInput] = useState<Record<string, boolean>>({});
  const [commentsVisibleCount, setCommentsVisibleCount] = useState<Record<string, number>>({});
  const [followedUsers, setFollowedUsers] = useState<string[]>([]); // userId array

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

  useEffect(() => {
    async function fetchPostsAndComments() {
      try {
        const res = await axios.get<Post[]>('http://localhost:3000/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const postsData = res.data.map((post) => ({
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
      setPosts((posts) =>
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likedByUser: res.data.liked,
                likesCount: res.data.likesCount,
              }
            : post,
        ),
      );
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
      } catch {
        console.error('Ошибка загрузки аватара');
      }
    }
    fetchProfile();
  }, [token]);

  if (error) return <p>{error}</p>;

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
                <img src={post.author.avatar || '/default-avatar.png'} alt="Profile" className={styles.avatar} />
                <p className={styles.avatarUsername}>{post.author.username}</p>
                <p className={styles.postTime}>• {timeAgo(post.createdAt)} •</p>

                <p className={styles.followBtn} onClick={() => toggleFollow(post.author._id)} style={{ cursor: 'pointer', color: followedUsers.includes(post.author._id) ? '#0095f6' : '#0095f6' }}>
                  {followedUsers.includes(post.author._id) ? 'following' : 'follow'}
                </p>
              </div>

              {post.image && <img src={post.image} alt="post" style={{ width: '400px', height: '500px', borderRadius: '7px' }} />}

              <div className={styles.likeCommentBlock}>
                <div className={styles.likeBlock}>
                  <img src={post.likedByUser ? liked : like} alt="like" onClick={() => handleLike(post._id)} />

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
                      {isExpanded ? 'View less comments' : 'View all comments'}
                    </a>
                  )}
                </div>
              </div>

              {showCommentInput[post._id] && (
                <form onSubmit={(e) => handleAddComment(e, post._id)}>
                  <input
                    type="text"
                    value={commentInputs[post._id] || ''}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [post._id]: e.target.value,
                      }))
                    }
                    placeholder="Добавить комментарий"
                  />
                  <button type="submit">Отправить</button>
                </form>
              )}
            </div>
          );
        })}
      </div>
      <div className={styles.seeAllContainer}>
        <div className={styles.img}>
          <img src={seeAll} alt="seeAll" />
        </div>
        <p className={styles.mainText}>You've seen all the updates</p>
        <p className={styles.secondText}>You have viewed all new publications</p>
      </div>
    </div>
  );
}
