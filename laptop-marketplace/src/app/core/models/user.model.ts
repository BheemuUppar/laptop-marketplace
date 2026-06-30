export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'customer';
  mustChangePassword?: boolean;
  createdAt?: string;
}
export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
