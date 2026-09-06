"use client";

import { Coins, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import type { IncomeSummary } from "@/lib/types";

export function IncomeSummaryCards({
  summary,
  isLoading,
}: {
  summary?: IncomeSummary;
  isLoading: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Income this month
            </CardTitle>
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Coins className="size-4" />
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-3xl font-bold">{formatCurrency(summary?.total ?? 0)}</p>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <CardTitle className="text-sm font-semibold text-muted-foreground">By source</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {isLoading && (
            <>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </>
          )}
          {!isLoading && (summary?.bySource.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">No income recorded yet.</p>
          )}
          {!isLoading &&
            summary?.bySource.map((entry) => {
              const percent = summary.total > 0 ? (entry.total / summary.total) * 100 : 0;
              return (
                <div key={entry.source} className="space-y-1.5 rounded-lg bg-muted/45 px-3 py-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{entry.source}</span>
                    <span className="font-semibold text-foreground">{formatCurrency(entry.total)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
}
