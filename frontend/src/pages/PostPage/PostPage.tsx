import { Link } from 'react-router-dom';
import CreatePostForm from '../../components/CreatePostForm/CreatePostForm';
import PostsFeed from '../../components/PostsFeed/PostsFeed';
import { useState } from 'react';

export default function PostPage() {
  const token = localStorage.getItem('token')!;
  const [refresh, setRefresh] = useState(false);

  return (
    <div>
      <CreatePostForm token={token} onPostCreated={() => setRefresh((prev) => !prev)} />
      <PostsFeed token={token} refresh={refresh} />

      <hr />
      <Link to="/profile">Перейти в Профиль</Link>
    </div>
  );
}
