"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addShoppingListItem,
  checkShoppingListItem,
  completeShoppingList,
  createShoppingList,
  deleteShoppingList,
  deleteShoppingListItem,
  getShoppingLists,
  uncheckShoppingListItem,
  updateShoppingList,
  updateShoppingListItemPrice,
  updateShoppingListItemQuantity,
} from "@/lib/api/shopping-lists";
import type {
  AddShoppingListItemPayload,
  CompleteListPayload,
  CreateShoppingListPayload,
  UpdateItemPricePayload,
  UpdateItemQuantityPayload,
} from "@/lib/types";

export const shoppingListsKey = ["shopping-lists"] as const;

function invalidateShoppingListsAndExpenses(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: shoppingListsKey });
  queryClient.invalidateQueries({ queryKey: ["expenses"] });
}

export function useShoppingLists() {
  return useQuery({ queryKey: shoppingListsKey, queryFn: getShoppingLists });
}

export function useCreateShoppingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateShoppingListPayload) => createShoppingList(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shoppingListsKey }),
  });
}

export function useUpdateShoppingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateShoppingList(id, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shoppingListsKey }),
  });
}

export function useDeleteShoppingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShoppingList(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shoppingListsKey }),
  });
}

export function useAddShoppingListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, payload }: { listId: string; payload: AddShoppingListItemPayload }) =>
      addShoppingListItem(listId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shoppingListsKey }),
  });
}

export function useUpdateItemQuantity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdateItemQuantityPayload }) =>
      updateShoppingListItemQuantity(itemId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shoppingListsKey }),
  });
}

export function useUpdateItemPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdateItemPricePayload }) =>
      updateShoppingListItemPrice(itemId, payload),
    onSuccess: () => invalidateShoppingListsAndExpenses(queryClient),
  });
}

export function useDeleteShoppingListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteShoppingListItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shoppingListsKey }),
  });
}

export function useCheckShoppingListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, price }: { itemId: string; price?: number }) =>
      checkShoppingListItem(itemId, price),
    onSuccess: () => invalidateShoppingListsAndExpenses(queryClient),
  });
}

export function useUncheckShoppingListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => uncheckShoppingListItem(itemId),
    onSuccess: () => invalidateShoppingListsAndExpenses(queryClient),
  });
}

export function useCompleteShoppingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, payload }: { listId: string; payload: CompleteListPayload }) =>
      completeShoppingList(listId, payload),
    onSuccess: () => invalidateShoppingListsAndExpenses(queryClient),
  });
}
