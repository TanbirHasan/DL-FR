"use client";

import { CalendarClock, CheckCircle2, CircleAlert, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import type { BillSummary } from "@/lib/types";

export function BillSummaryCards({
  summary,
  isLoading,
}: {
  summary?: BillSummary;
  isLoading: boolean;
}) {
  const cards = [
    {
      label: "Billed this month",
      value: formatCurrency(summary?.billed ?? 0),
      icon: Wallet,
      tint: "bg-primary/10 text-primary",
    },
    {
      label: "Paid",
      value: formatCurrency(summary?.paid ?? 0),
      icon: CheckCircle2,
      tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Still to pay",
      value: formatCurrency(summary?.outstanding ?? 0),
      icon: CalendarClock,
      tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Overdue",
      value: String(summary?.byStatus.OVERDUE ?? 0),
      icon: CircleAlert,
      tint: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                {card.label}
              </CardTitle>
              <span
                className={`flex size-9 items-center justify-center rounded-lg ${card.tint}`}
              >
                <card.icon className="size-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-bold">{card.value}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
