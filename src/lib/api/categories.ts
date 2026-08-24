import { apiClient } from "./client";
import type { Category, CreateCategoryPayload } from "@/lib/types";

export async function getCategories() {
  const { data } = await apiClient.get<Category[]>("/categories");
  return data;
}

export async function createCategory(payload: CreateCategoryPayload) {
  const { data } = await apiClient.post<Category>("/categories", payload);
  return data;
}

export async function updateCategory(id: string, payload: CreateCategoryPayload) {
  const { data } = await apiClient.patch<Category>(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string) {
  await apiClient.delete(`/categories/${id}`);
}
