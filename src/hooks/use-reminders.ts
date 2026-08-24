"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReminder, deleteReminder, getReminders, updateReminder } from "@/lib/api/reminders";
import type { CreateReminderPayload, UpdateReminderPayload } from "@/lib/types";

const remindersKey = (includeCompleted: boolean) => ["reminders", includeCompleted] as const;

export function useReminders(includeCompleted = false) {
  return useQuery({
    queryKey: remindersKey(includeCompleted),
    queryFn: () => getReminders(includeCompleted),
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReminderPayload) => createReminder(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateReminderPayload }) =>
      updateReminder(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReminder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  });
}
