import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext/AuthContext';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import PostsPage from './pages/PostPage/PostPage';
import { Profile } from './components/Profile/Profile';
import { UserSearch } from './components/UserSearch/UserSearch';
import Layout from './components/Layout/Layout';
import CreatePostForm from './components/CreatePostForm/CreatePostForm';
import Explore from './components/Explore/Explore';

function PrivateRoute({ children }: { children: React.JSX.Element }) {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const { token } = useContext(AuthContext); // <--- теперь доступно в App

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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
          path="/explore"
          element={
            <PrivateRoute>
              <Layout>
                <Explore />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/create"
          element={
            <PrivateRoute>
              <Layout>
                <CreatePostForm
                  token={token || ''} // теперь не undefined
                  onPostCreated={() => {
                    /* обновление или пустая функция */
                  }}
                />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
