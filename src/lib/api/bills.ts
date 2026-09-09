import { apiClient } from "./client";
import type {
  Bill,
  BillPayment,
  BillPeriodQuery,
  BillSummary,
  CreateBillPayload,
  MarkBillPaidPayload,
  UpdateBillPayload,
} from "@/lib/types";

export async function getBills() {
  const { data } = await apiClient.get<Bill[]>("/bills");
  return data;
}

export async function getBillPayments(query: BillPeriodQuery = {}) {
  const { data } = await apiClient.get<BillPayment[]>("/bills/payments", { params: query });
  return data;
}

export async function getBillSummary(year: number, month: number) {
  const { data } = await apiClient.get<BillSummary>("/bills/summary", { params: { year, month } });
  return data;
}

export async function createBill(payload: CreateBillPayload) {
  const { data } = await apiClient.post<Bill>("/bills", payload);
  return data;
}

export async function updateBill(id: string, payload: UpdateBillPayload) {
  const { data } = await apiClient.patch<Bill>(`/bills/${id}`, payload);
  return data;
}

export async function deleteBill(id: string) {
  await apiClient.delete(`/bills/${id}`);
}

export async function markBillPaid(paymentId: string, payload: MarkBillPaidPayload) {
  const { data } = await apiClient.patch<BillPayment>(`/bills/payments/${paymentId}/pay`, payload);
  return data;
}

export async function markBillUnpaid(paymentId: string) {
  const { data } = await apiClient.patch<BillPayment>(`/bills/payments/${paymentId}/unpay`);
  return data;
}
