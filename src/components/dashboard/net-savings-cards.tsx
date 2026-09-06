"use client";

import { ArrowDownRight, ArrowUpRight, PiggyBank, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInsights } from "@/hooks/use-insights";
import { cn, formatCurrency } from "@/lib/utils";

function NetTrend({
  trend,
}: {
  trend: { label: string; net: number }[];
}) {
  const maxAbs = Math.max(1, ...trend.map((t) => Math.abs(t.net)));

  return (
    <div className="flex items-end justify-between gap-2 pt-1">
      {trend.map((t) => {
        const pct = (Math.abs(t.net) / maxAbs) * 100;
        const positive = t.net >= 0;
        return (
          <div key={t.label} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-16 w-full items-end justify-center">
              <div
                className={cn(
                  "w-full max-w-6 rounded-t-sm",
                  positive ? "bg-emerald-500/80" : "bg-destructive/80",
                )}
                style={{ height: `${Math.max(pct, 4)}%` }}
                title={`${t.label}: ${formatCurrency(t.net)}`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{t.label.slice(0, 3)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function NetSavingsCards({ year, month }: { year: number; month: number }) {
  const { data, isLoading } = useInsights(year, month);

  const income = data?.thisMonth.income ?? 0;
  const expenses = data?.thisMonth.total ?? 0;
  const net = data?.thisMonth.net ?? 0;
  const rate = data?.thisMonth.savingsRatePercent ?? null;
  const positive = net >= 0;

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <StatCard
        label="Income this month"
        icon={<ArrowUpRight className="size-4" />}
        tone="income"
        loading={isLoading}
        value={formatCurrency(income)}
      />
      <StatCard
        label="Expenses this month"
        icon={<ArrowDownRight className="size-4" />}
        tone="expense"
        loading={isLoading}
        value={formatCurrency(expenses)}
      />
      <StatCard
        label="Net saved"
        icon={<PiggyBank className="size-4" />}
        tone={positive ? "income" : "expense"}
        loading={isLoading}
        value={`${positive ? "+" : "−"}${formatCurrency(Math.abs(net))}`}
        valueClass={positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}
      />
      <StatCard
        label="Savings rate"
        icon={<Scale className="size-4" />}
        tone="neutral"
        loading={isLoading}
        value={rate === null ? "—" : `${rate}%`}
        hint={rate === null ? "No income logged" : "of income kept"}
      />

      <Card className="lg:col-span-4">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            Net savings · last 6 months
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <NetTrend trend={data.trend} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
  loading,
  valueClass,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "income" | "expense" | "neutral";
  loading: boolean;
  valueClass?: string;
  hint?: string;
}) {
  const toneClass =
    tone === "income"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : tone === "expense"
        ? "bg-destructive/10 text-destructive"
        : "bg-primary/10 text-primary";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground">{label}</CardTitle>
          <span className={cn("flex size-9 items-center justify-center rounded-lg", toneClass)}>
            {icon}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className={cn("text-3xl font-bold", valueClass)}>{value}</p>
        )}
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
