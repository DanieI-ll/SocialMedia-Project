import { useEffect, useState } from 'react';
import axios from 'axios';

import like from '../../assets/like.svg';
import liked from '../../assets/liked.svg';
import comment from '../../assets/comment.svg';

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
  author: { username: string };
  likesCount: number;
  likedByUser: boolean;
  comments: Comment[];
}

interface PostsFeedProps {
  token: string;
  refresh?: boolean;
}

export default function PostsFeed({ token, refresh }: PostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchPostsAndComments() {
      try {
        // Получаем посты с сервера, где уже есть likesCount и likedByUser
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

        // Параллельно загружаем комментарии
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

    fetchPostsAndComments();
  }, [token, refresh]);

  async function handleLike(postId: string) {
    try {
      const res = await axios.post(`http://localhost:3000/likes/${postId}`, null, { headers: { Authorization: `Bearer ${token}` } });
      console.log('like response:', res.data); // burada bak
      setPosts((posts) =>
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likedByUser: res.data.liked, // теперь backend отдаёт liked
                likesCount: res.data.likesCount,
              }
            : post,
        ),
      );
    } catch (err) {
      console.log(err);
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

  if (error) return <p>{error}</p>;

  console.log('PostsFeed rendered');

  return (
    <div className={styles.feed}>
      {posts.length === 0 && <p>Посты не найдены.</p>}
      {posts.map((post) => (
        <div key={post._id} className={styles.post}>
          <div className={styles.postData}>
            {/* <img src="" alt="" /> AVATAR */}
            <p className={styles.avatarUsername}>{post.author.username}</p>
            <p>• 2 wek •</p>
            <p> follow </p>
          </div>
          {post.image && <img src={post.image} alt="post" style={{ width: '400px', height: '500px' }} />}

          <div className={styles.likeCommentBlock}>
            <img
              src={post.likedByUser ? liked : like}
              alt="like"
              onClick={() => {
                handleLike(post._id);
              }}
            />
            <img src={comment} alt="comment" />
            <p>{post.likesCount} likes</p>
          </div>

          <p>{post.description}</p>

          <div className={styles.comments}>
            <h4>Комментарии</h4>
            {post.comments.map((c) => (
              <p key={c._id}>
                <b>{c.user?.username ?? 'Неизвестный'}:</b> {c.text}
              </p>
            ))}

            <form onSubmit={(e) => handleAddComment(e, post._id)}>
              <input type="text" value={commentInputs[post._id] || ''} onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))} placeholder="Добавить комментарий" />
              <button type="submit">Отправить</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
