import { apiClient } from "./client";
import type {
  CreateHealthReminderPayload,
  HealthReminder,
  UpdateHealthReminderPayload,
} from "@/lib/types";

export async function getHealthReminders(includeCompleted = false) {
  const { data } = await apiClient.get<HealthReminder[]>("/health-reminders", {
    params: { includeCompleted },
  });
  return data;
}

export async function createHealthReminder(payload: CreateHealthReminderPayload) {
  const { data } = await apiClient.post<HealthReminder>("/health-reminders", payload);
  return data;
}

export async function updateHealthReminder(id: string, payload: UpdateHealthReminderPayload) {
  const { data } = await apiClient.patch<HealthReminder>(`/health-reminders/${id}`, payload);
  return data;
}

export async function deleteHealthReminder(id: string) {
  await apiClient.delete(`/health-reminders/${id}`);
}
