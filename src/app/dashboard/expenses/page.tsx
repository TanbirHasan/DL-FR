"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryManager } from "@/components/expenses/category-manager";
import { ExpenseFormDialog } from "@/components/expenses/expense-form-dialog";
import { ExpenseSummaryCards } from "@/components/expenses/expense-summary-cards";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { MonthPicker } from "@/components/expenses/month-picker";
import { useExpenses, useExpenseSummary } from "@/hooks/use-expenses";

export default function ExpensesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: expenses, isLoading: expensesLoading } = useExpenses({ year, month });
  const { data: summary, isLoading: summaryLoading } = useExpenseSummary(year, month);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Expenses</h1>
          <p className="text-muted-foreground">Track and review your spending.</p>
        </div>
        <div className="flex items-center gap-2">
          <CategoryManager />
          <ExpenseFormDialog
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                Add expense
              </Button>
            }
          />
        </div>
      </div>

      <MonthPicker
        year={year}
        month={month}
        onChange={(y, m) => {
          setYear(y);
          setMonth(m);
        }}
      />

      <ExpenseSummaryCards summary={summary} isLoading={summaryLoading} />

      {expensesLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <ExpenseTable expenses={expenses ?? []} />
      )}
    </div>
  );
}
