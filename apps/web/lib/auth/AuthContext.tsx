'use client';

import { AuthTokens } from '@repo/types';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const isRefreshingRef = useRef(false);

  const logout = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken || isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);

    try {
      console.log('Environment variables:', {
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        nodeEnv: process.env.NODE_ENV,
      });

      console.log('Attempting to refresh token...', {
        refreshToken: refreshToken.substring(0, 10) + '...',
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-tokens`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
            Accept: 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
          cache: 'no-store',
          credentials: 'include',
          mode: 'cors',
        },
      );

      console.log('Refresh response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok,
      });

      if (response.ok) {
        const tokens: AuthTokens = await response.json();
        console.log('Received new tokens:', {
          accessTokenLength: tokens.access_token.length,
          refreshTokenLength: tokens.refresh_token.length,
        });

        // Set state first
        setAccessToken(tokens.access_token);
        setRefreshToken(tokens.refresh_token);
        setIsAuthenticated(true);

        // Then set cookies
        Cookies.set('accessToken', tokens.access_token, {
          secure: true,
          sameSite: 'lax',
          path: '/',
          expires: 7, // Set cookie to expire in 7 days
        });
        Cookies.set('refreshToken', tokens.refresh_token, {
          secure: true,
          sameSite: 'lax',
          path: '/',
          expires: 7, // Set cookie to expire in 7 days
        });

        console.log('Successfully refreshed tokens and updated cookies');
      } else {
        const errorText = await response.text();
        console.error('Token refresh failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        // Only logout if we get a 401 or 403 response
        if (response.status === 401 || response.status === 403) {
          console.log('Unauthorized response, logging out...');
          logout();
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // Don't logout on network errors, let the user retry
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [refreshToken, logout]);

  const login = useCallback(async (tokens: AuthTokens) => {
    try {
      console.log('Attempting to login...', {
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
      });

      // Set state first
      setAccessToken(tokens.access_token);
      setRefreshToken(tokens.refresh_token);
      setIsAuthenticated(true);

      // Then set cookies
      Cookies.set('accessToken', tokens.access_token, {
        secure: true,
        sameSite: 'lax',
        path: '/',
        expires: 7, // Set cookie to expire in 7 days
      });
      Cookies.set('refreshToken', tokens.refresh_token, {
        secure: true,
        sameSite: 'lax',
        path: '/',
        expires: 7, // Set cookie to expire in 7 days
      });

      console.log('Successfully logged in and set tokens');
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial state
      setAccessToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      throw error;
    }
  }, []);

  // Initialize tokens from cookies on mount
  useEffect(() => {
    console.log('Initializing auth state from cookies...');
    const storedAccessToken = Cookies.get('accessToken');
    const storedRefreshToken = Cookies.get('refreshToken');

    console.log('Stored tokens:', {
      hasAccessToken: !!storedAccessToken,
      hasRefreshToken: !!storedRefreshToken,
      accessTokenLength: storedAccessToken?.length,
      refreshTokenLength: storedRefreshToken?.length,
    });

    if (storedRefreshToken) {
      try {
        // Set the refresh token in state first
        setRefreshToken(storedRefreshToken);

        // If we have an access token, verify it
        if (storedAccessToken) {
          try {
            const decoded = jwtDecode<{ exp: number }>(storedAccessToken);
            const expirationTime = decoded.exp ? decoded.exp * 1000 : 0;
            const currentTime = Date.now();

            console.log('Token expiration:', {
              expiresIn: Math.floor((expirationTime - currentTime) / 1000),
              isExpired: currentTime >= expirationTime,
              currentTime,
              expirationTime,
            });

            // If token is valid, set it and authenticated state
            if (currentTime < expirationTime) {
              setAccessToken(storedAccessToken);
              setIsAuthenticated(true);
            } else {
              // Token is expired, refresh it
              console.log('Access token expired, attempting refresh...');
              refreshAccessToken();
            }
          } catch (error) {
            console.error('Error decoding access token:', error);
            // Token is invalid, refresh it
            refreshAccessToken();
          }
        } else {
          // No access token, refresh it
          console.log('No access token found, attempting refresh...');
          refreshAccessToken();
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        // Try to refresh on any error
        refreshAccessToken();
      }
    } else {
      console.log('No refresh token found');
    }

    // Mark initialization as complete
    setIsInitialized(true);
  }, [refreshAccessToken]);

  // Set up token refresh interval
  useEffect(() => {
    if (!accessToken || !refreshToken || isRefreshing) return;

    let refreshTimer: NodeJS.Timeout;

    try {
      const decoded = jwtDecode<{ exp: number }>(accessToken);
      const expirationTime = decoded.exp ? decoded.exp * 1000 : 0;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // Refresh 5 minutes before expiry
      const refreshTime = Math.max(0, timeUntilExpiry - 300000);

      if (refreshTime === 0) {
        refreshAccessToken();
      } else {
        refreshTimer = setTimeout(refreshAccessToken, refreshTime);
      }
    } catch (error) {
      console.error('Error setting up refresh timer:', error);
      // Don't immediately refresh on decode error
    }

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [accessToken, refreshToken, refreshAccessToken, isRefreshing]);

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      isAuthenticated,
      login,
      logout,
    }),
    [accessToken, refreshToken, isAuthenticated, login, logout],
  );

  // Don't render children until initialization is complete
  if (!isInitialized) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
