import { apiClient } from "./client";
import { useAuthStore } from "@/store/auth-store";
import type { AssistantAnswer, AssistantContext, AssistantQuery } from "@/lib/types";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function askAssistant(payload: AssistantQuery) {
  const { data } = await apiClient.post<AssistantAnswer>("/assistant/query", payload);
  return data;
}

interface StreamHandlers {
  onContext?: (context: AssistantContext) => void;
  onDelta?: (text: string) => void;
  signal?: AbortSignal;
}

/**
 * Calls the SSE streaming endpoint and invokes handlers as chunks arrive.
 * Resolves when the stream finishes; rejects with an Error on transport or
 * server-signalled ("event: error") failure.
 */
export async function streamAssistant(payload: AssistantQuery, handlers: StreamHandlers) {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${baseURL}/api/assistant/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    credentials: "include",
    signal: handlers.signal,
  });

  if (!res.ok || !res.body) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const rawEvents = buffer.split("\n\n");
    buffer = rawEvents.pop() ?? "";

    for (const raw of rawEvents) {
      let name = "message";
      let data = "";
      for (const line of raw.split("\n")) {
        if (line.startsWith("event:")) name = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;

      const parsed = JSON.parse(data);
      if (name === "context") handlers.onContext?.(parsed as AssistantContext);
      else if (name === "delta") handlers.onDelta?.((parsed as { text: string }).text);
      else if (name === "error") throw new Error((parsed as { message: string }).message);
      else if (name === "done") return;
    }
  }
}
