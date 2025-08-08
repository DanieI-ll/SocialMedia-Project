import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './context/AuthContext/AuthContext';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import PostsPage from './pages/PostPage/PostPage';
import { Profile } from './components/Profile/Profile';
import { UserSearch } from './components/UserSearch/UserSearch';
import Layout from './components/Layout/Layout';
import CreatePostForm from './components/CreatePostForm/CreatePostForm';
import Explore from './components/Explore/Explore';
import EditProfilePage from './pages/EditProfilePage/EditProfilePage';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Cookies from './pages/StaticPages/Cookies/Cookies';
import LearnMore from './pages/StaticPages/LearnMore/LearnMore';
import PrivacyPolicy from './pages/StaticPages/PrivacyPolicy/PrivacyPolicy';
import NotFound from './pages/NotFound/NotFound';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import Notifications from './components/Notifications/Notifications';
import Terms from './pages/StaticPages/Terms/Terms';
import axios from 'axios';

function PrivateRoute({ children }: { children: React.JSX.Element }) {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const { token } = useContext(AuthContext);
  const [avatar, setAvatar] = useState('');
  const [username, setUsername] = useState('');

  const [currentUserId] = useState<string>('');
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);

  // Профиль загружаем один раз после логина
  useEffect(() => {
    if (!token) return;
    axios
      .get('http://localhost:3000/api/profile/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAvatar(res.data.avatar || '');
        setUsername(res.data.username || '');
      })
      .catch((err) => console.error('Ошибка загрузки профиля', err));
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route
          path="/profile/:userId"
          element={
            <Layout>
              <ProfilePage token={token} />
            </Layout>
          }
        />

        <Route
          path="*"
          element={
            <PrivateRoute>
              <Layout>
                <NotFound />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/posts"
          element={
            <PrivateRoute>
              <Layout>
                <PostsPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/search"
          element={
            <PrivateRoute>
              <Layout>
                <UserSearch />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Layout>
                <Notifications />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <PrivateRoute>
              <Layout>
                {/* Explore bileşenine gerekli prop'ları burada iletiyoruz */}
                <Explore token={token || ''} currentUserId={currentUserId} followedUsers={followedUsers} setFollowedUsers={setFollowedUsers} />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <Layout>
                <CreatePostForm token={token || ''} onPostCreated={() => {}} avatar={avatar} username={username} />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <PrivateRoute>
              <Layout>
                <EditProfilePage />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/learn-more" element={<LearnMore />} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
