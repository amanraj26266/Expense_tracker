import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { loginApi, meApi } from '../api/auth';

const STORAGE_KEY = 'expense_tracker_auth_v1';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState({ token: null, user: null, company: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          return;
        }

        const parsed = JSON.parse(raw);
        if (!parsed?.token) {
          return;
        }

        const me = await meApi(parsed.token);
        setSession({
          token: parsed.token,
          user: me.user,
          company: me.company || parsed.company || null,
        });
      } catch (error) {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    }

    hydrate();
  }, []);

  const value = useMemo(
    () => ({
      ...session,
      loading,
      isAdmin: session.user?.role === 'company_admin',
      async login(email, password) {
        const payload = await loginApi({ email, password });
        const nextSession = {
          token: payload.token,
          user: payload.user,
          company: payload.company || null,
        };
        setSession(nextSession);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      },
      async logout() {
        setSession({ token: null, user: null, company: null });
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
      async refreshMe() {
        if (!session.token) {
          return;
        }
        const payload = await meApi(session.token);
        const nextSession = {
          token: session.token,
          user: payload.user,
          company: payload.company || session.company,
        };
        setSession(nextSession);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      },
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
