import { apiClient } from "./client";
import type { CreateReminderPayload, Reminder, UpdateReminderPayload } from "@/lib/types";

export async function getReminders(includeCompleted = false) {
  const { data } = await apiClient.get<Reminder[]>("/reminders", {
    params: { includeCompleted },
  });
  return data;
}

export async function createReminder(payload: CreateReminderPayload) {
  const { data } = await apiClient.post<Reminder>("/reminders", payload);
  return data;
}

export async function updateReminder(id: string, payload: UpdateReminderPayload) {
  const { data } = await apiClient.patch<Reminder>(`/reminders/${id}`, payload);
  return data;
}

export async function deleteReminder(id: string) {
  await apiClient.delete(`/reminders/${id}`);
}
