import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Restore session from localStorage on page load ───
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!storedToken || !storedUser || storedUser === 'undefined') {
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setRole(parsedUser.role);

        // Verify token is still valid with the backend
        const { data } = await api.get('/auth/me');
        const freshUser = data.user;

        // Update with fresh data from server
        setUser(freshUser);
        setRole(freshUser.role);
        localStorage.setItem('user', JSON.stringify(freshUser));

      } catch (error) {
        // Token expired or invalid — clear everything
        console.warn('Session restore failed, clearing auth state.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ─── Register: Create new account ───
  const register = useCallback(async ({ name, email, password, role: userRole, tenantId }) => {
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
      role: userRole,
      tenantId,
    });

    const { token: newToken, user: newUser } = data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
    setRole(newUser.role);

    return newUser;
  }, []);

  // ─── Login: Authenticate existing user ───
  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post('/auth/login', { email, password });

    const { token: newToken, user: newUser } = data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
    setRole(newUser.role);

    return newUser;
  }, []);

  // ─── Logout: Clear session ───
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setRole(null);
  }, []);

  // ─── Set Auth Data dynamically (e.g. on role upgrade) ───
  const setAuthData = useCallback((newUser, newToken) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setRole(newUser.role);
  }, []);

  // ─── Role-based permission check ───
  const hasPermission = useCallback((permission) => {
    if (role === 'admin') return true;
    const permMap = {
      viewer: ['watch_video'],
      editor: ['watch_video', 'upload_video', 'edit_video'],
    };
    return (permMap[role] || []).includes(permission);
  }, [role]);

  const value = {
    user,
    token,
    role,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    hasPermission,
    setAuthData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
