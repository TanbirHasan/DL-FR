"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDocument, deleteDocument, getDocuments, updateDocument } from "@/lib/api/documents";
import type { CreateDocumentPayload, UpdateDocumentPayload } from "@/lib/types";

const documentsKey = (expiringOnly: boolean) => ["documents", expiringOnly] as const;

export function useDocuments(expiringOnly = false) {
  return useQuery({
    queryKey: documentsKey(expiringOnly),
    queryFn: () => getDocuments(expiringOnly),
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDocumentPayload) => createDocument(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDocumentPayload }) =>
      updateDocument(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });
}
