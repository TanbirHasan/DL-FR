"use client";

import { useState } from "react";
import { CalendarDays, CircleAlert, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UpcomingAgenda } from "@/components/dashboard/upcoming-agenda";
import { useAgenda } from "@/hooks/use-agenda";
import { formatCurrency } from "@/lib/utils";

const RANGES = [7, 14, 30] as const;

export default function AgendaPage() {
  const [days, setDays] = useState<number>(7);
  const { data, isLoading } = useAgenda(days);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm shadow-slate-900/5">
        <div>
          <h1 className="text-3xl font-bold">Upcoming</h1>
          <p className="mt-1 text-muted-foreground">
            Every due date across the app — bills, reminders, deadlines, renewals — in one list.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-background/60 p-1">
          {RANGES.map((r) => (
            <Button
              key={r}
              size="sm"
              variant={days === r ? "default" : "ghost"}
              onClick={() => setDays(r)}
            >
              {r} days
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Due items</CardTitle>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="size-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{data?.count ?? 0}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Overdue</CardTitle>
              <span className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <CircleAlert className="size-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{data?.overdueCount ?? 0}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Committed money
              </CardTitle>
              <span className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Wallet className="size-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-bold">{formatCurrency(data?.totalAmount ?? 0)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : (
        <UpcomingAgenda items={data?.items ?? []} />
      )}
    </div>
  );
}
