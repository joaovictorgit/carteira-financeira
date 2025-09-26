import { api } from "../api";

type CreateUserPayload = {
  name: string;
  email: string,
  password: string,
}

type UserResponse = {
  id: string;
  name: string;
  email: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export const UserService = {
  onSignUp: async (payload: CreateUserPayload): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/user', payload);

    return response.data;
  }
}