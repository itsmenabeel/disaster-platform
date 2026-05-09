import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // LOAD USER FROM LOCALSTORAGE
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);

          localStorage.setItem('user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));

    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    const { token, user } = res.data;

    localStorage.setItem('token', token);

    localStorage.setItem('user', JSON.stringify(user));

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setUser(user);

    return user;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);

    const { token, user } = res.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user)); // ✅ add here too

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);