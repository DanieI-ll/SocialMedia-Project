import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext/AuthContext';
import { Link } from 'react-router-dom';
import verified from '../../assets/verified.svg'; // Mavi tik simgesini import edin
import styles from './UserSearch.module.css';

interface User {
  _id: string;
  username: string;
  avatar?: string;
  isBlueVerified?: boolean; // isBlueVerified'ı User arayüzüne ekledik
}

export const UserSearch: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [resentUsers, setResentUsers] = useState<User[]>([]);

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

  React.useEffect(() => {
    // LocalStorage'dan çekerken de isBlueVerified'ı doğru şekilde almasını sağlamak için User arayüzü ile uyumlu olmalı
    const data = JSON.parse(localStorage.getItem('resentUsers') || '[]') as User[];
    setResentUsers(data);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearInput = () => {
    setQuery('');
    setResults([]);
  };

  const handleUserClick = (user: User) => {
    const resent = JSON.parse(localStorage.getItem('resentUsers') || '[]') as User[];

    const filtered = resent.filter((u) => u._id !== user._id);

    const updated = [user, ...filtered].slice(0, 10);

    localStorage.setItem('resentUsers', JSON.stringify(updated));
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
            <Link to={`/profile/${user._id}`} className={styles.userLink} onClick={() => handleUserClick(user)}>
              <img src={user.avatar || '/default-avatar.png'} alt={user.username} className={styles.avatar} />
              <div className={styles.usernameWrapper}>
                <span className={styles.username}>{user.username}</span>
                {user.isBlueVerified && <img src={verified} alt="Verified" className={styles.verifiedIcon} />}
              </div>
            </Link>
          </li>
        ))}

        {resentUsers.length > 0 && (
          <div className={styles.resentWrapper}>
            <h4>Recent</h4>
            <ul className={styles.userResultResent}>
              {resentUsers.map((user) => (
                <li key={user._id} className={styles.userItem}>
                  <Link to={`/profile/${user._id}`} className={styles.userLink}>
                    <img src={user.avatar || '/default-avatar.png'} alt={user.username} className={styles.avatar} />
                    <div className={styles.usernameWrapper}>
                      <span className={styles.username}>{user.username}</span>
                      {user.isBlueVerified && <img src={verified} alt="Verified" className={styles.verifiedIcon} />}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ul>
    </div>
  );
};
