import { apiClient } from "./client";
import type { AgendaResponse } from "@/lib/types";

export async function getAgenda(days?: number) {
  const { data } = await apiClient.get<AgendaResponse>("/agenda", {
    params: days ? { days } : undefined,
  });
  return data;
}
