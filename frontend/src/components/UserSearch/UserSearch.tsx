import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext/AuthContext';
import { Link } from 'react-router-dom';
import styles from './UserSearch.module.css';

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

export const UserSearch: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);

  const handleSearch = async () => {
    if (!query.trim() || !token) return;
    try {
      const res = await axios.get<User[]>(`http://localhost:3000/api/users/search?name=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearInput = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div>
      <div className={styles.inputWrapper}>
        <input className={styles.searchInput} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" onKeyDown={handleKeyDown} />
        <a
          href="#"
          className={styles.clearLink}
          onClick={(e) => {
            e.preventDefault();
            clearInput();
          }}
          aria-label="Clear search"
        >
          ×
        </a>
      </div>

      <ul className={styles.userResult}>
        {results.map((user) => (
          <li key={user._id} className={styles.userItem}>
            <Link to={`/profile/${user._id}`} className={styles.userLink}>
              <img src={user.avatar || '/default-avatar.png'} alt={user.username} className={styles.avatar} />
              <span className={styles.username}>{user.username}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
