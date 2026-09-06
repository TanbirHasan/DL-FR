import { apiClient } from "./client";
import type { AssistantAnswer, AssistantQuery } from "@/lib/types";

export async function askAssistant(payload: AssistantQuery) {
  const { data } = await apiClient.post<AssistantAnswer>("/assistant/query", payload);
  return data;
}
