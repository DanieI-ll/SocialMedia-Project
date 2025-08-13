import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Explore.module.css';
import PostModal from '../PostModal/PostModal';

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

interface Comment {
  _id: string;
  user: { username: string; avatar?: string };
  text: string;
}

interface ExploreProps {
  token: string;
  currentUserId: string;
  followedUsers: string[];
  setFollowedUsers: React.Dispatch<React.SetStateAction<string[]>>;
}

const Explore = ({ token, currentUserId, followedUsers, setFollowedUsers }: ExploreProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const shufflePosts = (array: Post[]) => {
    let currentIndex = array.length,
      randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  };

  useEffect(() => {
    const fetchPostsAndComments = async () => {
      try {
        const postsResponse = await axios.get<Post[]>('http://localhost:3000/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const shuffledPosts = shufflePosts(postsResponse.data);

        const commentsPromises = shuffledPosts.map((post) =>
          axios
            .get<Comment[]>(`http://localhost:3000/comments/${post._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => ({ postId: post._id, comments: res.data }))
            .catch(() => ({ postId: post._id, comments: [] })),
        );

        const commentsResults = await Promise.all(commentsPromises);

        const postsWithComments = shuffledPosts.map((post) => {
          const foundComments = commentsResults.find((res) => res.postId === post._id);
          return {
            ...post,
            comments: foundComments?.comments || [],
          };
        });

        setPosts(postsWithComments);
      } catch (err) {
        setError('');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostsAndComments();
  }, [token]);

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const updatePostInFeed = (updatedPost: Post) => {
    setPosts((prevPosts) => prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
    if (selectedPost && selectedPost._id === updatedPost._id) {
      setSelectedPost(updatedPost);
    }
  };

  const handlePostDelete = (deletedPostId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== deletedPostId));
    setSelectedPost(null);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.mainContainer}>
      {posts.map((post) => (
        <div key={post._id} className={styles.postItem}>
          <img src={post.image} alt="post" className={styles.postImage} onClick={() => handlePostClick(post)} />
        </div>
      ))}

      {selectedPost && <PostModal post={selectedPost} onClose={handleCloseModal} token={token} currentUserId={currentUserId} followedUsers={followedUsers} setFollowedUsers={setFollowedUsers} updatePostInFeed={updatePostInFeed} onPostDelete={handlePostDelete} />}
    </div>
  );
};

export default Explore;
