import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { isPushSupported, subscribeToPush, unsubscribeFromPush } from '../utils/pushNotifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then((u) => {
        setUser(u);
        // Re-subscribe if permission already granted (refreshes backend sub)
        if (isPushSupported() && Notification.permission === 'granted') {
          subscribeToPush().catch(() => {});
        }
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    subscribeToPush().catch(() => {});
  }

  async function signup(name, email, password) {
    const data = await api.post('/auth/signup', { name, email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    subscribeToPush().catch(() => {});
  }

  async function logout() {
    await unsubscribeFromPush().catch(() => {});
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
