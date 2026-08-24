"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createItem, deleteItem, getItems, updateItem } from "@/lib/api/items";
import type { CreateItemPayload, UpdateItemPayload } from "@/lib/types";

export const itemsKey = ["items"] as const;

export function useItems(categoryId?: string) {
  return useQuery({
    queryKey: [...itemsKey, categoryId ?? "all"],
    queryFn: () => getItems(categoryId),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemPayload) => createItem(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: itemsKey }),
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateItemPayload }) =>
      updateItem(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: itemsKey }),
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: itemsKey }),
  });
}
