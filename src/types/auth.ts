import type { Faculty } from "./faculty";
import type { Role } from "./roles";
import type { Scholar } from "./scholar";


export interface Tokens {
  access: string;
  refresh: string;
}

export interface ApiResponse {
  tokens: Tokens;
  user: Scholar | Faculty;
}

export interface LoginPayload {
  username: string;
  password: string;
  type: "scholar" | "FAC";
}

export interface AuthState {
  scholar: Scholar | null;
  faculty: Faculty | null;
  tokens: Tokens | null;
  selectedRole: Role | null;
  loading: boolean;
  error: string | null;
}


export interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requireAuth?: boolean;
  isNested?: boolean;
}