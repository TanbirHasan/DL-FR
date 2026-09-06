"use client";

import { useMutation } from "@tanstack/react-query";
import { askAssistant } from "@/lib/api/assistant";
import type { AssistantQuery } from "@/lib/types";

export function useAskAssistant() {
  return useMutation({
    mutationFn: (payload: AssistantQuery) => askAssistant(payload),
  });
}
