import { api } from "../api";

type LoginPayload =  {
  email: string;
  password: string;
}

type AuthResponse = {
  access_token: string;
}

const EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000;

export const AuthService = {
  onSignIn: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', payload);

    const expirationDate = new Date().getTime() + EXPIRATION_TIME_MS;

    localStorage.setItem('auth_token', response.data.access_token);
    localStorage.setItem('auth_expires_at', expirationDate.toString());

    return response.data;
  },

  onLogout: (): void => {
    localStorage.removeItem('auto_token');
    localStorage.removeItem('auth_expires_at');
  }
};