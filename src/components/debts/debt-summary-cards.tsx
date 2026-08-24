"use client";

import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import type { DebtSummary } from "@/lib/types";

export function DebtSummaryCards({
  summary,
  isLoading,
}: {
  summary?: DebtSummary;
  isLoading: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Owed to you
            </CardTitle>
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <ArrowDownLeft className="size-4" />
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-3xl font-bold text-emerald-600">
              {formatCurrency(summary?.totalOwedToMe ?? 0)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">You owe</CardTitle>
            <span className="flex size-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-3xl font-bold text-rose-600">{formatCurrency(summary?.totalIOwe ?? 0)}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Net</CardTitle>
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Scale className="size-4" />
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-3xl font-bold">{formatCurrency(summary?.net ?? 0)}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {summary && summary.net >= 0 ? "You're net owed" : "You're net in debt"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
