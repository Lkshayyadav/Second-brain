import api from "./api";
import type { Content, CreateContentInput } from "../types/content";

export const contentService = {
  getContents: async (): Promise<Content[]> => {
    const response = await api.get<{ content: Content[] }>("/content");
    return response.data.content;
  },

  createContent: async (data: CreateContentInput): Promise<Content> => {
    const response = await api.post<{ message: string; content: Content }>("/content", data);
    return response.data.content;
  },

  updateContent: async (id: string, data: Partial<CreateContentInput>): Promise<Content> => {
    const response = await api.put<{ message: string; content: Content }>(`/content/${id}`, data);
    return response.data.content;
  },

  deleteContent: async (id: string): Promise<void> => {
    await api.delete(`/content/${id}`);
  },
};
