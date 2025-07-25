import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext/AuthContext';

interface User {
  _id: string;
  name: string;
  username: string; // ekledik
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

  return (
    <div>
      <h3>Поиск пользователей</h3>
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Введите имя" />
      <button onClick={handleSearch}>Искать</button>

      <ul>
        {results.map((user) => (
          <li key={user._id}>
            {user.name} ({user.username})
          </li>
        ))}
      </ul>
    </div>
  );
};
