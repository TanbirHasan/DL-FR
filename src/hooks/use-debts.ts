"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDebt, deleteDebt, getDebtSummary, getDebts, updateDebt } from "@/lib/api/debts";
import type { CreateDebtPayload, DebtQuery, UpdateDebtPayload } from "@/lib/types";

const debtsKey = (query: DebtQuery) => ["debts", query] as const;
const debtSummaryKey = ["debts", "summary"] as const;

function invalidateDebts(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["debts"] });
}

export function useDebts(query: DebtQuery = {}) {
  return useQuery({ queryKey: debtsKey(query), queryFn: () => getDebts(query) });
}

export function useDebtSummary() {
  return useQuery({ queryKey: debtSummaryKey, queryFn: getDebtSummary });
}

export function useCreateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDebtPayload) => createDebt(payload),
    onSuccess: () => invalidateDebts(queryClient),
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDebtPayload }) =>
      updateDebt(id, payload),
    onSuccess: () => invalidateDebts(queryClient),
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDebt(id),
    onSuccess: () => invalidateDebts(queryClient),
  });
}
