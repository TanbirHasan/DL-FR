"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createIncome,
  deleteIncome,
  getIncomeSummary,
  getIncomes,
  updateIncome,
} from "@/lib/api/income";
import type { CreateIncomePayload, IncomeQuery, UpdateIncomePayload } from "@/lib/types";

const incomeKey = (query: IncomeQuery) => ["income", query] as const;
const summaryKey = (year: number, month: number) => ["income", "summary", year, month] as const;

export function useIncomes(query: IncomeQuery) {
  return useQuery({ queryKey: incomeKey(query), queryFn: () => getIncomes(query) });
}

export function useIncomeSummary(year: number, month: number) {
  return useQuery({ queryKey: summaryKey(year, month), queryFn: () => getIncomeSummary(year, month) });
}

function useInvalidateIncome() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["income"] });
    queryClient.invalidateQueries({ queryKey: ["insights"] });
  };
}

export function useCreateIncome() {
  const invalidate = useInvalidateIncome();
  return useMutation({
    mutationFn: (payload: CreateIncomePayload) => createIncome(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateIncome() {
  const invalidate = useInvalidateIncome();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateIncomePayload }) =>
      updateIncome(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteIncome() {
  const invalidate = useInvalidateIncome();
  return useMutation({
    mutationFn: (id: string) => deleteIncome(id),
    onSuccess: invalidate,
  });
}
