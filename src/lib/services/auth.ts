import { getOnboardingAsAService } from '@/lib/api/endpoints';
import {
  UserCreate,
  UserLogin,
  TokenResponse,
} from '@/lib/api/schemas';
import Cookies from 'js-cookie';

const api = getOnboardingAsAService();

class AuthService {
  public async register(data: UserCreate): Promise<TokenResponse> {
    try {
      const response = await api.registerApiAuthRegisterPost(data);
      if (response.access_token) {
        this.setToken(response.access_token);
      }
      return response;
    } catch (error: any) {
      // Handle API errors and return meaningful messages
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  }

  public async login(data: UserLogin): Promise<TokenResponse> {
    try {
      const response = await api.loginApiAuthLoginPost(data);
      if (response.access_token) {
        this.setToken(response.access_token);
      }
      return response;
    } catch (error: any) {
      // Handle API errors and return meaningful messages
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed. Please check your credentials.');
      }
    }
  }

  private setToken(token: string) {
    Cookies.set('token', token, {
      expires: 1, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    // Remove automatic redirect - let the context handle it
  }

  public removeToken() {
    Cookies.remove('token');
  }

  public getToken(): string | undefined {
    return Cookies.get('token');
  }
}

export const authService = new AuthService();