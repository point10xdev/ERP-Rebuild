import { atom, selector } from "recoil";
import type { AuthState } from '../../../types/auth';

// ---------- ATOM ----------
// Atom: stores the core auth state globally in Recoil
export const authStateAtom = atom<AuthState>({
  key: "authState", // Unique key
  default: {
    scholar: null,
    faculty: null,
    tokens: null,
    selectedRole: null,
    loading: true, // Set loading to true by default
    error: null,
  },
});

// ---------- SELECTORS ----------
// Selectors derive specific parts of auth state for use in components

// Selector: Returns the current user (scholar or faculty)
export const userSelector = selector({
  key: "user",
  get: ({ get }) => {
    const auth = get(authStateAtom);
    return auth.faculty ?? auth.scholar ?? null;
  },
});

// Selector: Returns whether the user is authenticated
export const isAuthenticatedSelector = selector({
  key: "isAuthenticated",
  get: ({ get }) => {
    const auth = get(authStateAtom);
    return !!auth.tokens?.access && (auth.scholar !== null || auth.faculty !== null);
  },
});

// Selector: Returns loading state (for UI spinners)
export const loadingSelector = selector({
  key: "authLoading",
  get: ({ get }) => get(authStateAtom).loading,
});

// Selector: Returns error message (for toast or message display)
export const errorSelector = selector({
  key: "authError",
  get: ({ get }) => get(authStateAtom).error,
});

// Selector: Returns currently selected role
export const selectedRoleSelector = selector({
  key: "selectedRole",
  get: ({ get }) => get(authStateAtom).selectedRole,
});
