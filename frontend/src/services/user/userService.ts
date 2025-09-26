import { api } from "../api";

type CreateUserPayload = {
  name: string;
  email: string,
  password: string,
}

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  balance: number;
  createdAt: string;
  updatedAt?: string;
}

export const UserService = {
  onSignUp: async (payload: CreateUserPayload): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/user', payload);

    return response.data;
  },

  getUserInfo: async (): Promise<UserResponse> => {
    const response = await api.get('/user');

    return response.data;
  },

  getUserNames: async (): Promise<{id: string, name: string}[]> => {
    const response = await api.get('/user/names');

    return response.data;
  }
}