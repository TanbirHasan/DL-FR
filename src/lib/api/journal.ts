import { apiClient } from "./client";
import type {
  CreateJournalEntryPayload,
  JournalEntry,
  JournalQuery,
  UpdateJournalEntryPayload,
} from "@/lib/types";

export async function getJournalEntries(query: JournalQuery = {}) {
  const { data } = await apiClient.get<JournalEntry[]>("/journal-entries", { params: query });
  return data;
}

export async function createJournalEntry(payload: CreateJournalEntryPayload) {
  const { data } = await apiClient.post<JournalEntry>("/journal-entries", payload);
  return data;
}

export async function updateJournalEntry(id: string, payload: UpdateJournalEntryPayload) {
  const { data } = await apiClient.patch<JournalEntry>(`/journal-entries/${id}`, payload);
  return data;
}

export async function deleteJournalEntry(id: string) {
  await apiClient.delete(`/journal-entries/${id}`);
}
