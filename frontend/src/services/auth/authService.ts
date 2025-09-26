import { api } from "../api";

type LoginPayload =  {
  email: string;
  password: string;
}

type AuthResponse = {
  access_token: string;
}

export const AuthService = {
  onSignIn: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', payload);

    localStorage.setItem('auth_token', response.data.access_token);

    return response.data;
  }
};