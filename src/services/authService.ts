// services/authService.ts

import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../types/conf.json';
import { logMessage } from '../utils/logger';
import type { LoginPayload, ApiResponse, Tokens } from '../types/auth';
import type { Faculty } from '../types/faculty';
import type { Scholar } from '../types/scholar';

// Create axios instance
const authAPI = axios.create({
  baseURL: `${config.backend}/api`,
  timeout: 10000,
});

/**
 * Cookie utilities
 */
export const cookieUtils = {
  setTokens: (tokens: Tokens): void => {
    const isHttps = window.location.protocol === 'https:';
    Cookies.set('accessToken', tokens.access, {
      secure: isHttps,
      sameSite: 'strict',
      expires: 7, // 7 day expiry
    });
    Cookies.set('refreshToken', tokens.refresh, {
      secure: isHttps,
      sameSite: 'strict',
      expires: 7,
    });
  },

  getAccessToken: (): string | undefined => Cookies.get('accessToken'),
  getRefreshToken: (): string | undefined => Cookies.get('refreshToken'),

  clearTokens: (): void => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  },
};

/**
 * Token refresh
 */
export const refreshAuthToken = async (): Promise<string | null> => {
  const refreshToken = cookieUtils.getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await authAPI.post('/users/token/refresh/', {
      refresh: refreshToken,
    });

    const { access } = response.data;
    if (!access) {
      throw new Error('Invalid refresh response');
    }

    // Update access token cookie
    const isHttps = window.location.protocol === 'https:';
    Cookies.set('accessToken', access, {
      secure: isHttps,
      sameSite: 'strict',
      expires: 7,
    });

    logMessage('info', 'Token refreshed successfully', 'refreshAuthToken');
    return access;
  } catch (error) {
    logMessage('error', 'Token refresh failed', 'refreshAuthToken', error);
    // Clear tokens on failure
    cookieUtils.clearTokens();
    throw new Error('Failed to refresh token');
  }
};

/**
 * Main login function
 */
export const loginUser = async (payload: LoginPayload): Promise<ApiResponse> => {
  try {
    // Validate payload
    if (!payload.username || !payload.password || !payload.type) {
      throw new Error('Email, password, and type are required');
    }

    if (!['FAC', 'scholar'].includes(payload.type)) {
      throw new Error('Invalid user type. Must be faculty or scholar');
    }

    const response = await authAPI.post('/users/token/', payload);
    const { tokens, faculty, scholar } = response.data;

    // Validate response
    if (!tokens?.access || !tokens?.refresh) {
      throw new Error('Invalid tokens in server response');
    }

    // Get user based on type
    const user = payload.type === 'FAC' ? faculty : scholar;
    if (!user) {
      throw new Error('No user data in server response');
    }

    // Store tokens in cookies
    cookieUtils.setTokens(tokens);

    logMessage('info', 'Login successful', 'loginUser', {
      userId: user.id,
      userType: payload.type,
    });

    // Return tokens and user data to be stored in Recoil
    return { tokens, user };
  } catch (error) {
    logMessage('error', 'Login failed', 'loginUser', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      switch (status) {
        case 400:
          throw new Error(errorData?.detail || 'Invalid request data');
        case 401:
          throw new Error('Invalid username or password');
        case 404:
          throw new Error('Login endpoint not found');
        case 500:
          throw new Error('Server error. Please try again later');
        default:
          throw new Error(errorData?.detail || 'Login failed');
      }
    }

    throw error instanceof Error ? error : new Error('Login failed');
  }
};

/**
 * Logout function - clears tokens
 */
export const logoutUser = async (): Promise<void> => {
  const refreshToken = cookieUtils.getRefreshToken();

  try {
    // Attempt to invalidate refresh token on server
    if (refreshToken) {
      await authAPI.post('/users/logout/', { refresh: refreshToken });
      logMessage('info', 'Server logout successful', 'logoutUser');
    }
  } catch (error) {
    // Log error but don't throw - we still want to clear local state
    logMessage(
      'error',
      'Server logout failed, proceeding with local cleanup',
      'logoutUser',
      error
    );
  }

  // Always clear local cookies
  cookieUtils.clearTokens();

  logMessage('info', 'User logged out and tokens cleared', 'logoutUser');
};

/**
 * Initialize auth state from cookies and fetch user data
 * This should be called on app startup
 */
export const initializeAuthFromCookies = async (): Promise<{
  user: Scholar | Faculty;
  tokens: Tokens;
} | null> => {
  const accessToken = cookieUtils.getAccessToken();
  const refreshToken = cookieUtils.getRefreshToken();

  if (!accessToken || !refreshToken) {
    logMessage('info', 'No tokens found in cookies', 'initializeAuthFromCookies');
    return null;
  }

  try {
    // It's better to use a library like 'jwt-decode' for this
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const userId = payload.id;
    const userType = payload.type; // 'scholar' or 'FAC'

    if (!userId || !userType) {
      throw new Error('Invalid token payload');
    }

    // Determine endpoint based on user type
    const endpoint =
      userType === 'scholar'
        ? `/users/student/?id=${userId}`
        : `/users/faculty/?id=${userId}`;

    // Fetch user data with current token
    const response = await authAPI.get(endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = response.data;
    const tokens = { access: accessToken, refresh: refreshToken };

    logMessage(
      'info',
      'Auth state initialized from cookies',
      'initializeAuthFromCookies',
      {
        userId,
        userType,
      }
    );

    // Return the user and tokens to be set in the Recoil state
    return { user, tokens };
  } catch (error) {
    logMessage(
      'error',
      'Failed to initialize auth from cookies',
      'initializeAuthFromCookies',
      error
    );

    // Clear invalid tokens
    cookieUtils.clearTokens();

    return null;
  }
};