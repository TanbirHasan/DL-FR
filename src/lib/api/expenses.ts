import { apiClient } from "./client";
import type {
  CreateExpensePayload,
  Expense,
  ExpenseQuery,
  ExpenseSummary,
  UpdateExpensePayload,
} from "@/lib/types";

export async function getExpenses(query: ExpenseQuery = {}) {
  const { data } = await apiClient.get<Expense[]>("/expenses", { params: query });
  return data;
}

export async function getExpenseSummary(year: number, month: number) {
  const { data } = await apiClient.get<ExpenseSummary>("/expenses/summary", {
    params: { year, month },
  });
  return data;
}

export async function createExpense(payload: CreateExpensePayload) {
  const { data } = await apiClient.post<Expense>("/expenses", payload);
  return data;
}

export async function updateExpense(id: string, payload: UpdateExpensePayload) {
  const { data } = await apiClient.patch<Expense>(`/expenses/${id}`, payload);
  return data;
}

export async function deleteExpense(id: string) {
  await apiClient.delete(`/expenses/${id}`);
}
