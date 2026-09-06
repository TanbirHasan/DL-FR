"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IncomeFormDialog } from "@/components/income/income-form-dialog";
import { IncomeSummaryCards } from "@/components/income/income-summary-cards";
import { IncomeTable } from "@/components/income/income-table";
import { MonthPicker } from "@/components/expenses/month-picker";
import { useIncomes, useIncomeSummary } from "@/hooks/use-income";

export default function IncomePage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: incomes, isLoading: incomesLoading } = useIncomes({ year, month });
  const { data: summary, isLoading: summaryLoading } = useIncomeSummary(year, month);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm shadow-slate-900/5">
        <div>
          <h1 className="text-3xl font-bold">Income</h1>
          <p className="mt-1 text-muted-foreground">
            Track what comes in so you can see what you actually keep.
          </p>
        </div>
        <IncomeFormDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Add income
            </Button>
          }
        />
      </div>

      <MonthPicker
        year={year}
        month={month}
        onChange={(y, m) => {
          setYear(y);
          setMonth(m);
        }}
      />

      <IncomeSummaryCards summary={summary} isLoading={summaryLoading} />

      {incomesLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <IncomeTable incomes={incomes ?? []} />
      )}
    </div>
  );
}
