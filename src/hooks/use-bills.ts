"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBill,
  deleteBill,
  getBillPayments,
  getBillSummary,
  getBills,
  markBillPaid,
  markBillUnpaid,
  updateBill,
} from "@/lib/api/bills";
import type {
  BillPeriodQuery,
  CreateBillPayload,
  MarkBillPaidPayload,
  UpdateBillPayload,
} from "@/lib/types";

const paymentsKey = (query: BillPeriodQuery) => ["bills", "payments", query] as const;
const summaryKey = (year: number, month: number) => ["bills", "summary", year, month] as const;

export function useBills() {
  return useQuery({ queryKey: ["bills", "list"], queryFn: getBills });
}

export function useBillPayments(query: BillPeriodQuery) {
  return useQuery({ queryKey: paymentsKey(query), queryFn: () => getBillPayments(query) });
}

export function useBillSummary(year: number, month: number) {
  return useQuery({ queryKey: summaryKey(year, month), queryFn: () => getBillSummary(year, month) });
}

function useInvalidateBills() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["bills"] });
    // Marking a bill paid/unpaid creates or removes an expense.
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["insights"] });
  };
}

export function useCreateBill() {
  const invalidate = useInvalidateBills();
  return useMutation({
    mutationFn: (payload: CreateBillPayload) => createBill(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateBill() {
  const invalidate = useInvalidateBills();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBillPayload }) =>
      updateBill(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteBill() {
  const invalidate = useInvalidateBills();
  return useMutation({ mutationFn: (id: string) => deleteBill(id), onSuccess: invalidate });
}

export function useMarkBillPaid() {
  const invalidate = useInvalidateBills();
  return useMutation({
    mutationFn: ({ paymentId, payload }: { paymentId: string; payload: MarkBillPaidPayload }) =>
      markBillPaid(paymentId, payload),
    onSuccess: invalidate,
  });
}

export function useMarkBillUnpaid() {
  const invalidate = useInvalidateBills();
  return useMutation({
    mutationFn: (paymentId: string) => markBillUnpaid(paymentId),
    onSuccess: invalidate,
  });
}
