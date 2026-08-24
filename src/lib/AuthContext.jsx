import * as React from 'react';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Supabase OAuth/password-recovery redirects return the session in the URL hash.
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const accessToken = hash.get('access_token');
        const refreshToken = hash.get('refresh_token');
        if (accessToken && refreshToken) {
          localStorage.setItem('ovejite_supabase_session', JSON.stringify({ access_token: accessToken, refresh_token: refreshToken, token_type: 'bearer' }));
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }

        await base44.auth.me();
        if (mounted) setIsAuthenticated(true);
      } catch {
        if (mounted) setIsAuthenticated(false);
      } finally {
        if (mounted) setIsLoadingAuth(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const navigateToLogin = () => {
    window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      authChecked: !isLoadingAuth,
      navigateToLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
