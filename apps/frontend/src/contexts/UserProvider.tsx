import { useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import UserContext from './userContext';
import { User } from '../types';

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded: User = jwtDecode<User>(token);
        setUser({ id: decoded.id, username: decoded.username, name: decoded.name });
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    setUser(null);
    Cookies.remove('token');
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
