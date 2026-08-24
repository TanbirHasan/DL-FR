import { apiClient } from "./client";
import type {
  CreateRecurringExpensePayload,
  RecurringExpense,
  UpdateRecurringExpensePayload,
} from "@/lib/types";

export async function getRecurringExpenses() {
  const { data } = await apiClient.get<RecurringExpense[]>("/recurring-expenses");
  return data;
}

export async function createRecurringExpense(payload: CreateRecurringExpensePayload) {
  const { data } = await apiClient.post<RecurringExpense>("/recurring-expenses", payload);
  return data;
}

export async function updateRecurringExpense(id: string, payload: UpdateRecurringExpensePayload) {
  const { data } = await apiClient.patch<RecurringExpense>(`/recurring-expenses/${id}`, payload);
  return data;
}

export async function deleteRecurringExpense(id: string) {
  await apiClient.delete(`/recurring-expenses/${id}`);
}
