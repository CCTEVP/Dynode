interface AuthResponse {
  success: boolean;
  message: string;
  requiresVerification?: boolean;
}

interface VerifyResponse {
  success: boolean;
  message: string;
  token?: string;
  // optional domains or user payload returned by the API
  domains?: string[];
  user?: any;
}

import env from "../../config/env";

class AuthService {
  // In production (Docker) the browser cannot resolve the internal Docker DNS name (source),
  // so we rely on nginx in the build container proxying /api/* to the source service.
  // For development we use the explicit external origin.
  private baseUrl =
    env.env === "production" ? "/api" : env.externalOrigins.source;

  async checkEmail(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Email check error:", error);
      return {
        success: false,
        message: "Failed to verify email. Please try again.",
      };
    }
  }

  async verifyCode(email: string, code: string): Promise<VerifyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.token) {
          this.setToken(data.token);
        }
        // if API returned domains explicitly, persist them
        if (Array.isArray(data.domains) && data.domains.length) {
          this.setUserDomains(data.domains);
        } else if (data.user && Array.isArray(data.user.domains)) {
          this.setUserDomains(data.user.domains);
        }
      }

      return data;
    } catch (error) {
      console.error("Code verification error:", error);
      return {
        success: false,
        message: "Failed to verify code. Please try again.",
      };
    }
  }

  setUserDomains(domains: string[] | undefined): void {
    try {
      if (!domains) {
        localStorage.removeItem("dynode_user_domains");
        return;
      }
      localStorage.setItem("dynode_user_domains", JSON.stringify(domains));
    } catch (e) {
      console.warn("Failed to persist user domains", e);
    }
  }

  getUserDomains(): string[] {
    try {
      const raw = localStorage.getItem("dynode_user_domains");
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  removeUserDomains(): void {
    localStorage.removeItem("dynode_user_domains");
  }

  private tryExtractDomainsFromToken(token: string): string[] | undefined {
    try {
      const parts = token.split(".");
      if (parts.length < 2) return undefined;
      const payload = JSON.parse(atob(parts[1]));
      // common claim name could be `domains` or `user` -> `domains`
      if (Array.isArray(payload.domains)) return payload.domains;
      if (payload.user && Array.isArray(payload.user.domains))
        return payload.user.domains;
      return undefined;
    } catch {
      return undefined;
    }
  }

  setToken(token: string): void {
    localStorage.setItem("dynode_auth_token", token);
    // try to persist domains if they exist inside the token payload
    const domains = this.tryExtractDomainsFromToken(token);
    if (domains) this.setUserDomains(domains);
  }

  getToken(): string | null {
    return localStorage.getItem("dynode_auth_token");
  }

  removeToken(): void {
    localStorage.removeItem("dynode_auth_token");
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Simple token expiration check
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (e) {
      return false;
    }
  }

  logout(): void {
    this.removeToken();
    window.location.href = "/";
  }
}

export default new AuthService();
