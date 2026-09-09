"use client";

import { useQuery } from "@tanstack/react-query";
import { getAgenda } from "@/lib/api/agenda";

export function useAgenda(days: number) {
  return useQuery({
    queryKey: ["agenda", days],
    queryFn: () => getAgenda(days),
  });
}
