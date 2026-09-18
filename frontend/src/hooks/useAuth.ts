import { useState, useEffect } from 'react';
import { User } from '../lib/types';

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('sdms_token'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('sdms_token');
          setToken(null);
          setUser(null);
          return;
        }
        setUser({
          id: payload.sub,
          username: payload.sub,
          role: payload.role,
          msp_id: payload.msp_id || 'PoliceMSP',
          mfa_verified: payload.mfa_verified,
          live_case_ids: [],
        });
      } catch {
        localStorage.removeItem('sdms_token');
        setToken(null);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const saveToken = (newToken: string) => {
    localStorage.setItem('sdms_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('sdms_token');
    setToken(null);
    setUser(null);
  };

  return { token, user, saveToken, logout };
}
