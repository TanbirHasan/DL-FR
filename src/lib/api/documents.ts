import { apiClient } from "./client";
import type { CreateDocumentPayload, DocumentRecord, UpdateDocumentPayload } from "@/lib/types";

export async function getDocuments(expiringOnly = false) {
  const { data } = await apiClient.get<DocumentRecord[]>("/documents", {
    params: { expiringOnly },
  });
  return data;
}

export async function createDocument(payload: CreateDocumentPayload) {
  const { data } = await apiClient.post<DocumentRecord>("/documents", payload);
  return data;
}

export async function updateDocument(id: string, payload: UpdateDocumentPayload) {
  const { data } = await apiClient.patch<DocumentRecord>(`/documents/${id}`, payload);
  return data;
}

export async function deleteDocument(id: string) {
  await apiClient.delete(`/documents/${id}`);
}
