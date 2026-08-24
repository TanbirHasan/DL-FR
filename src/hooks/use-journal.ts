"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
  updateJournalEntry,
} from "@/lib/api/journal";
import type { CreateJournalEntryPayload, JournalQuery, UpdateJournalEntryPayload } from "@/lib/types";

const journalKey = (query: JournalQuery) => ["journal-entries", query] as const;

export function useJournalEntries(query: JournalQuery = {}) {
  return useQuery({
    queryKey: journalKey(query),
    queryFn: () => getJournalEntries(query),
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateJournalEntryPayload) => createJournalEntry(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["journal-entries"] }),
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateJournalEntryPayload }) =>
      updateJournalEntry(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["journal-entries"] }),
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteJournalEntry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["journal-entries"] }),
  });
}
