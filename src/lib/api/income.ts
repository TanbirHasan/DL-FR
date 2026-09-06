import { apiClient } from "./client";
import type {
  CreateIncomePayload,
  Income,
  IncomeQuery,
  IncomeSummary,
  UpdateIncomePayload,
} from "@/lib/types";

export async function getIncomes(query: IncomeQuery = {}) {
  const { data } = await apiClient.get<Income[]>("/income", { params: query });
  return data;
}

export async function getIncomeSummary(year: number, month: number) {
  const { data } = await apiClient.get<IncomeSummary>("/income/summary", {
    params: { year, month },
  });
  return data;
}

export async function createIncome(payload: CreateIncomePayload) {
  const { data } = await apiClient.post<Income>("/income", payload);
  return data;
}

export async function updateIncome(id: string, payload: UpdateIncomePayload) {
  const { data } = await apiClient.patch<Income>(`/income/${id}`, payload);
  return data;
}

export async function deleteIncome(id: string) {
  await apiClient.delete(`/income/${id}`);
}
