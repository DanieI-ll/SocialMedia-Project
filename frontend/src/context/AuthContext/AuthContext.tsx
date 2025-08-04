import { createContext } from 'react';

interface AuthContextType {
  token: string | null;
  userId: string | null; // добавлено
  login: (token: string, userId: string) => void; // теперь принимает userId
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null,
  login: () => {},
  logout: () => {},
});
