// Explore.tsx
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

  // Postları rastgele sıralayan yardımcı fonksiyon
  const shufflePosts = (array: Post[]) => {
    let currentIndex = array.length,
      randomIndex;

    // Kalan elemanlar varken...
    while (currentIndex !== 0) {
      // Kalan bir eleman seçin...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // Ve onu mevcut elemanla değiştirin.
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

        // Postları rastgele sırala
        const shuffledPosts = shufflePosts(postsResponse.data);

        // Her bir post için yorumları çekecek promise'leri oluşturun
        const commentsPromises = shuffledPosts.map(
          (post) =>
            axios
              .get<Comment[]>(`http://localhost:3000/comments/${post._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then((res) => ({ postId: post._id, comments: res.data }))
              .catch(() => ({ postId: post._id, comments: [] })), // Hata durumunda boş yorum dizisi döndür
        );

        // Tüm yorum isteklerinin tamamlanmasını bekleyin
        const commentsResults = await Promise.all(commentsPromises);

        // Yorum verilerini ilgili postlara ekleyin
        const postsWithComments = shuffledPosts.map((post) => {
          const foundComments = commentsResults.find((res) => res.postId === post._id);
          return {
            ...post,
            comments: foundComments?.comments || [],
          };
        });

        setPosts(postsWithComments);
      } catch (err) {
        setError('Postlar veya yorumlar yüklenirken bir hata oluştu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostsAndComments();
  }, [token]);

  // Modal'ı kapatma fonksiyonu
  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  // Post akışını güncelleyen fonksiyon
  const updatePostInFeed = (updatedPost: Post) => {
    setPosts((prevPosts) => prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
    if (selectedPost && selectedPost._id === updatedPost._id) {
      setSelectedPost(updatedPost);
    }
  };

  // Post silme işlemini yöneten fonksiyon
  const handlePostDelete = (deletedPostId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== deletedPostId));
    setSelectedPost(null);
  };

  if (loading) {
    return <p>Yükleniyor...</p>;
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
