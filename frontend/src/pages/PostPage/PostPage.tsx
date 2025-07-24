import PostsFeed from '../../components/PostsFeed/PostsFeed';
import { LogoutButton } from '../../components/LogoutButton/LogoutButton';

export default function PostPage() {
  const token = localStorage.getItem('token')!;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <LogoutButton />
      </div>
      <PostsFeed token={token} />
    </div>
  );
}
