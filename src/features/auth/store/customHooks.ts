// -------- Custom Hooks --------
// These hooks simplify access to the Recoil authentication state

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import {
  authStateAtom,
  userSelector,
  isAuthenticatedSelector,
  loadingSelector,
  errorSelector,
  selectedRoleSelector,
} from './authAtoms';

import type { Scholar } from '../../../types/scholar';
import type { Faculty } from '../../../types/faculty';
import type { Role } from '../../../types/roles';
import type { LoginPayload, ApiResponse, Tokens } from '../../../types/auth';

import { 
  loginUser, 
  logoutUser, 
  initializeAuthFromCookies 
} from '../../../services/authService';

// Hook to access full authentication state object
export const useAuthState = () => useRecoilValue(authStateAtom);

// Hooks to access individual derived pieces of auth state
export const useUser = () => useRecoilValue(userSelector);
export const useIsAuthenticated = () => useRecoilValue(isAuthenticatedSelector);
export const useAuthLoading = () => useRecoilValue(loadingSelector);
export const useAuthError = () => useRecoilValue(errorSelector);
export const useSelectedRole = () => useRecoilValue(selectedRoleSelector);

// ---------- HOOK: useAuth ----------
// Combines authentication-related methods and state access
export const useAuth = () => {
  const [authState, setAuthState] = useRecoilState(authStateAtom);

  // Start login — show loading spinner, clear error
  const startLoading = () => {
    setAuthState((prevState) => ({
      ...prevState,
      loading: true,
      error: null,
    }));
  };

  // Handle login success — update tokens, user, roles
  const setSuccess = (response: ApiResponse, type: LoginPayload['type']) => {
    const { tokens, user } = response;

    const isFaculty = type === 'FAC';
    const isScholar = type === 'scholar';

    // Type-safe casting based on login type
    const faculty: Faculty | null = isFaculty
      ? { ...user as Faculty, roles: (user as Faculty).roles ?? [] }
      : null;

    const scholar: Scholar | null = isScholar ? user as Scholar : null;

    // Set role: if scholar, it's always 'scholar'; otherwise take the first role of faculty
    const selectedRole: Role | null = isScholar
      ? 'scholar'
      : (faculty?.roles?.[0] as Role) ?? null;

    setAuthState({
      faculty,
      scholar,
      tokens,
      selectedRole,
      loading: false,
      error: null,
    });
  };

  // Handle login failure — stop loading and store error
  const setFailure = (error: string) => {
    setAuthState((prevState) => ({
      ...prevState,
      loading: false,
      error,
    }));
  };

  // Perform login: call backend, process response
  const login = async ({ username, password, type }: LoginPayload) => {
    startLoading();
    try {
      const response = await loginUser({ username, password, type });
      setSuccess(response, type);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        setFailure(error.message);
      }
      throw error; // Still throw to allow local error handling
    }
  };

  // Allow switching role for multi-role users
  const setSelectedRole = (role: Role | null) => {
    setAuthState((prev) => ({
      ...prev,
      selectedRole: role,
    }));
  };

(window as any).debugSetRole = setSelectedRole;

  // Clear auth state (helper function)
  const clearAuthState = () => {
    setAuthState({
      faculty: null,
      scholar: null,
      tokens: null,
      selectedRole: null,
      loading: false,
      error: null,
    });
  };

  /// Updated logout: use authService logout + clear Recoil state
  const logout = async () => {
    try {
      // Call the logout function from authService (handles server logout + cookie clearing)
      await logoutUser();
    } catch (error) {
      // Even if server logout fails, we still want to clear local state
      console.error('Server logout failed:', error);
    } finally {
      // Always clear Recoil auth state
      clearAuthState();
    }
  };

  // Clear only the error field in auth state
  const clearError = () => {
    setAuthState((prev) => ({
      ...prev,
      error: null,
    }));
  };

  // Return everything the consuming component might need
  return {
    login,
    logout,
    setSelectedRole,
    clearError,
    clearAuthState,
    isAuthenticated: useIsAuthenticated(),
    user: useUser(),
    loading: useAuthLoading(),
    error: useAuthError(),
    selectedRole: useSelectedRole(),
  };
};

// ---------- HOOK: useInitAuth ----------
// Initializes auth state on app load using cookies
export const useInitAuth = () => {
  const setAuthState = useSetRecoilState(authStateAtom);

  const initializeAuth = async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    
    try {
      // Use authService to handle all initialization logic
      const authData = await initializeAuthFromCookies();
      
      if (!authData) {
        // No valid auth data found
        setAuthState((prev) => ({ ...prev, loading: false }));
        return;
      }

      const { user, tokens } = authData;
      
      // Determine user type and set up Recoil state
      const isScholar = 'enroll' in user; // Scholar has enrollment number
      const faculty: Faculty | null = isScholar ? null : user as Faculty;
      const scholar: Scholar | null = isScholar ? user as Scholar : null;
      
      const selectedRole: Role | null = isScholar
        ? 'scholar'
        : (faculty?.roles?.[0] as Role) ?? null;

      setAuthState({
        faculty,
        scholar,
        tokens,
        selectedRole,
        loading: false,
        error: null,
      });

    } catch (error) {
      // authService already handled cleanup, just update Recoil state
      setAuthState({
        faculty: null,
        scholar: null,
        tokens: null,
        selectedRole: null,
        loading: false,
        error: 'Session expired. Please login again.',
      });
    }
  };

  return { initializeAuth };
};