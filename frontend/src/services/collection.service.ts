import api from "./api";
import type { Collection } from "../types/collection";

export const collectionService = {
  getCollections: async (): Promise<Collection[]> => {
    const response = await api.get<{ collections: Collection[] }>("/collections");
    return response.data.collections;
  },

  createCollection: async (name: string): Promise<Collection> => {
    const response = await api.post<{ message: string; collection: Collection }>("/collections", {
      name,
    });
    return response.data.collection;
  },

  updateCollection: async (id: string, name: string): Promise<Collection> => {
    const response = await api.put<{ message: string; collection: Collection }>(`/collections/${id}`, {
      name,
    });
    return response.data.collection;
  },

  deleteCollection: async (id: string): Promise<void> => {
    await api.delete(`/collections/${id}`);
  },
};
