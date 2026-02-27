import { constructApiUrl } from "@uxin/utils";
import { getAuthToken } from "./utils";

export interface AuthResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  avatar?: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export class AuthService {
  static async login(email: string, password: string): Promise<AuthResponse<AuthData>> {
    try {
      const url = constructApiUrl("/api/v1/auth/login");
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || "Login failed",
          error: "Login failed",
        };
      }

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      return { success: true, data: data.data };
    } catch (error) {
      console.error("API Login failed:", error);
      return { success: false, error: "Network error" };
    }
  }

  static async register(userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<AuthResponse<AuthData>> {
    try {
      const url = constructApiUrl("/api/v1/auth/register");
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message === "该邮箱已被注册") {
          return { success: false, message: "User exists", error: "User exists" };
        }
        return {
          success: false,
          message: data.message || "Registration failed",
          error: data.message,
        };
      }

      if (!data.success) return { success: false, message: data.message };

      return { success: true, data: data.data };
    } catch (error) {
      console.error("API Register failed:", error);
      return { success: false, error: "Network error" };
    }
  }

  static async validateToken(token: string): Promise<AuthResponse<AuthData>> {
    try {
      const url = constructApiUrl("/api/v1/auth/refresh");
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        return { success: false, error: "Token validation failed" };
      }

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      return { success: true, data: data.data };
    } catch (error) {
      console.error("Token validation failed:", error);
      return { success: false, error: "Network error" };
    }
  }

  static async guestLogin(): Promise<AuthResponse<AuthData>> {
    try {
      const url = constructApiUrl("/api/v1/auth/guest");
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        return { success: false, message: "Guest login failed" };
      }

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      return { success: true, data: data.data };
    } catch (error) {
      console.error("Guest login failed:", error);
      return { success: false, error: "Network error" };
    }
  }

  static async createGuestUser(): Promise<User | null> {
    const email = `guest-${Date.now()}@example.com`;
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8); // Simple random password
    const name = "Guest User";

    const result = await this.register({
      email,
      password,
      name,
      role: "CUSTOMER",
    });

    if (result.success && result.data) {
      return result.data.user;
    }
    return null;
  }
}
