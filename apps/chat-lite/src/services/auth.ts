/**
 * 认证服务 - 对接 API 端口的登录注册接口
 */

const API_BASE = '/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  phone?: string;
  isVerified?: boolean;
  avatar?: string;
  bio?: string;
  skills?: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  errors?: any[];
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  name: string;
  password: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  phone?: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');
      if (savedToken && savedUser) {
        this.token = savedToken;
        this.user = JSON.parse(savedUser);
      }
    } catch (error) {
      console.error('恢复会话失败:', error);
      this.clearSession();
    }
  }

  private clearSession(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  private saveSession(token: string, user: User): void {
    this.token = token;
    this.user = user;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  getAuthHeader(): Record<string, string> {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }

  async login(params: LoginParams): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (data.success && data.data) {
        this.saveSession(data.data.token, data.data.user);
      }
      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '网络错误，请稍后再试',
      };
    }
  }

  async register(params: RegisterParams): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (data.success && data.data) {
        this.saveSession(data.data.token, data.data.user);
      }
      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '网络错误，请稍后再试',
      };
    }
  }

  async guestLogin(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success && data.data) {
        this.saveSession(data.data.token, data.data.user);
      }
      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '访客登录失败',
      };
    }
  }

  logout(): void {
    this.clearSession();
  }

  updateUser(user: Partial<User>): void {
    if (this.user) {
      this.user = { ...this.user, ...user };
      localStorage.setItem('auth_user', JSON.stringify(this.user));
    }
  }
}

export const authService = new AuthService();
export default authService;
