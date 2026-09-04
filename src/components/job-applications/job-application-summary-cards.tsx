"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_LABEL, STATUS_ORDER } from "./status";
import type { JobApplicationSummary } from "@/lib/types";

export function JobApplicationSummaryCards({
  summary,
  isLoading,
}: {
  summary?: JobApplicationSummary;
  isLoading: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {STATUS_ORDER.map((status) => (
        <Card key={status}>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              {STATUS_LABEL[status]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-10" />
            ) : (
              <p className="text-2xl font-bold">{summary?.byStatus[status] ?? 0}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
