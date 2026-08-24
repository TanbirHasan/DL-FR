"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseSummary } from "@/lib/types";

export function ExpenseSummaryCards({
  summary,
  isLoading,
}: {
  summary?: ExpenseSummary;
  isLoading: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total this month
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-3xl font-semibold">{formatCurrency(summary?.total ?? 0)}</p>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Spend by category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {isLoading && (
            <>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </>
          )}
          {!isLoading && summary?.byCategory.length === 0 && (
            <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
          )}
          {!isLoading &&
            summary?.byCategory.map((entry) => {
              const percent = summary.total > 0 ? (entry.total / summary.total) * 100 : 0;
              return (
                <div key={entry.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{entry.categoryName}</span>
                    <span className="text-muted-foreground">{formatCurrency(entry.total)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
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
