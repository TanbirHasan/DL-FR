import { apiClient } from "./client";
import type { CreateDebtPayload, Debt, DebtQuery, DebtSummary, UpdateDebtPayload } from "@/lib/types";

export async function getDebts(query: DebtQuery = {}) {
  const { data } = await apiClient.get<Debt[]>("/debts", { params: query });
  return data;
}

export async function getDebtSummary() {
  const { data } = await apiClient.get<DebtSummary>("/debts/summary");
  return data;
}

export async function createDebt(payload: CreateDebtPayload) {
  const { data } = await apiClient.post<Debt>("/debts", payload);
  return data;
}

export async function updateDebt(id: string, payload: UpdateDebtPayload) {
  const { data } = await apiClient.patch<Debt>(`/debts/${id}`, payload);
  return data;
}

export async function deleteDebt(id: string) {
  await apiClient.delete(`/debts/${id}`);
}
