import { apiClient } from "./client";
import type { CreateItemPayload, Item, UpdateItemPayload } from "@/lib/types";

export async function getItems(categoryId?: string) {
  const { data } = await apiClient.get<Item[]>("/items", { params: { categoryId } });
  return data;
}

export async function createItem(payload: CreateItemPayload) {
  const { data } = await apiClient.post<Item>("/items", payload);
  return data;
}

export async function updateItem(id: string, payload: UpdateItemPayload) {
  const { data } = await apiClient.patch<Item>(`/items/${id}`, payload);
  return data;
}

export async function deleteItem(id: string) {
  await apiClient.delete(`/items/${id}`);
}
