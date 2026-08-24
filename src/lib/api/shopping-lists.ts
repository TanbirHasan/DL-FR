import { apiClient } from "./client";
import type { CompleteListPayload, CreateShoppingListPayload, ShoppingList, ShoppingListItem } from "@/lib/types";

export async function getShoppingLists() {
  const { data } = await apiClient.get<ShoppingList[]>("/shopping-lists");
  return data;
}

export async function createShoppingList(payload: CreateShoppingListPayload) {
  const { data } = await apiClient.post<ShoppingList>("/shopping-lists", payload);
  return data;
}

export async function updateShoppingList(id: string, title: string) {
  const { data } = await apiClient.patch<ShoppingList>(`/shopping-lists/${id}`, { title });
  return data;
}

export async function deleteShoppingList(id: string) {
  await apiClient.delete(`/shopping-lists/${id}`);
}

export async function addShoppingListItem(listId: string, itemId: string) {
  const { data } = await apiClient.post<ShoppingListItem>(`/shopping-lists/${listId}/items`, { itemId });
  return data;
}

export async function deleteShoppingListItem(itemId: string) {
  await apiClient.delete(`/shopping-lists/items/${itemId}`);
}

export async function checkShoppingListItem(itemId: string, price: number) {
  const { data } = await apiClient.post<ShoppingListItem>(`/shopping-lists/items/${itemId}/check`, {
    price,
  });
  return data;
}

export async function uncheckShoppingListItem(itemId: string) {
  const { data } = await apiClient.post<ShoppingListItem>(`/shopping-lists/items/${itemId}/uncheck`);
  return data;
}

export async function completeShoppingList(listId: string, payload: CompleteListPayload) {
  const { data } = await apiClient.post<ShoppingListItem[]>(
    `/shopping-lists/${listId}/complete`,
    payload
  );
  return data;
}
