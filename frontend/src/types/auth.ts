export interface Credentials {
  username?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
}

export interface SignupResponse {
  message: string;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  loading: boolean;
  login: (token?: string) => void;
  logout: () => void;
}
