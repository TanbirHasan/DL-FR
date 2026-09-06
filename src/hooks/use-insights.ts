"use client";

import { useQuery } from "@tanstack/react-query";
import { getInsights } from "@/lib/api/insights";

export function useInsights(year: number, month: number) {
  return useQuery({
    queryKey: ["insights", year, month] as const,
    queryFn: () => getInsights(year, month),
  });
}
