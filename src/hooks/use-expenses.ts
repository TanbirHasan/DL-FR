"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createExpense,
  deleteExpense,
  getExpenseSummary,
  getExpenses,
  updateExpense,
} from "@/lib/api/expenses";
import type { CreateExpensePayload, ExpenseQuery, UpdateExpensePayload } from "@/lib/types";

const expensesKey = (query: ExpenseQuery) => ["expenses", query] as const;
const summaryKey = (year: number, month: number) => ["expenses", "summary", year, month] as const;

export function useExpenses(query: ExpenseQuery) {
  return useQuery({ queryKey: expensesKey(query), queryFn: () => getExpenses(query) });
}

export function useExpenseSummary(year: number, month: number) {
  return useQuery({ queryKey: summaryKey(year, month), queryFn: () => getExpenseSummary(year, month) });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExpensePayload }) =>
      updateExpense(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
}
