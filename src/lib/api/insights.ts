import { apiClient } from "./client";
import type { InsightsBundle } from "@/lib/types";

export async function getInsights(year: number, month: number) {
  const { data } = await apiClient.get<InsightsBundle>("/insights", {
    params: { year, month },
  });
  return data;
}
