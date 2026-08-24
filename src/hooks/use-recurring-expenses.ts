"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRecurringExpense,
  deleteRecurringExpense,
  getRecurringExpenses,
  updateRecurringExpense,
} from "@/lib/api/recurring-expenses";
import type { CreateRecurringExpensePayload, UpdateRecurringExpensePayload } from "@/lib/types";

export const recurringExpensesKey = ["recurring-expenses"] as const;

export function useRecurringExpenses() {
  return useQuery({ queryKey: recurringExpensesKey, queryFn: getRecurringExpenses });
}

export function useCreateRecurringExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRecurringExpensePayload) => createRecurringExpense(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recurringExpensesKey }),
  });
}

export function useUpdateRecurringExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRecurringExpensePayload }) =>
      updateRecurringExpense(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recurringExpensesKey }),
  });
}

export function useDeleteRecurringExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecurringExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recurringExpensesKey }),
  });
}
