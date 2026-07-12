import api from "./api";
import type { Credentials, AuthResponse, SignupResponse } from "../types/auth";

export const authService = {
  signup: async (credentials: Credentials): Promise<SignupResponse> => {
    const response = await api.post<SignupResponse>("/signup", credentials);
    return response.data;
  },

  signin: async (credentials: Credentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/signin", credentials);
    return response.data;
  },

  changePassword: async (passwords: { oldPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>("/password", passwords);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  },

  getToken: (): string | null => {
    return localStorage.getItem("token");
  },
};
export default authService;
