"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createHealthReminder,
  deleteHealthReminder,
  getHealthReminders,
  updateHealthReminder,
} from "@/lib/api/health-reminders";
import type { CreateHealthReminderPayload, UpdateHealthReminderPayload } from "@/lib/types";

const healthRemindersKey = (includeCompleted: boolean) =>
  ["health-reminders", includeCompleted] as const;

export function useHealthReminders(includeCompleted = false) {
  return useQuery({
    queryKey: healthRemindersKey(includeCompleted),
    queryFn: () => getHealthReminders(includeCompleted),
  });
}

export function useCreateHealthReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHealthReminderPayload) => createHealthReminder(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["health-reminders"] }),
  });
}

export function useUpdateHealthReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHealthReminderPayload }) =>
      updateHealthReminder(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["health-reminders"] }),
  });
}

export function useDeleteHealthReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHealthReminder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["health-reminders"] }),
  });
}
