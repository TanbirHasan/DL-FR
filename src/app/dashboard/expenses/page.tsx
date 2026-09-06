"use client";

import { useMemo, useState } from "react";
import { Plus, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryManager } from "@/components/expenses/category-manager";
import {
  EMPTY_EXPENSE_FILTERS,
  ExpenseFilterBar,
  hasActiveFilters,
  type ExpenseFilters,
} from "@/components/expenses/expense-filter-bar";
import { ExpenseFormDialog } from "@/components/expenses/expense-form-dialog";
import { ExpenseSummaryCards } from "@/components/expenses/expense-summary-cards";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { MonthPicker } from "@/components/expenses/month-picker";
import { RecurringExpensesDialog } from "@/components/expenses/recurring-expenses-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useExpenses, useExpenseSummary } from "@/hooks/use-expenses";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseQuery } from "@/lib/types";

export default function ExpensesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [filters, setFilters] = useState<ExpenseFilters>(EMPTY_EXPENSE_FILTERS);

  const debouncedFilters = useDebouncedValue(filters, 300);
  const filtersActive = hasActiveFilters(debouncedFilters);

  const query = useMemo<ExpenseQuery>(() => {
    const q: ExpenseQuery = { year, month };
    if (debouncedFilters.search.trim()) q.search = debouncedFilters.search.trim();
    if (debouncedFilters.categoryId !== "all") q.categoryId = debouncedFilters.categoryId;
    const min = Number(debouncedFilters.minAmount);
    const max = Number(debouncedFilters.maxAmount);
    if (debouncedFilters.minAmount.trim() && Number.isFinite(min)) q.minAmount = min;
    if (debouncedFilters.maxAmount.trim() && Number.isFinite(max)) q.maxAmount = max;
    return q;
  }, [year, month, debouncedFilters]);

  const { data: expenses, isLoading: expensesLoading } = useExpenses(query);
  const { data: summary, isLoading: summaryLoading } = useExpenseSummary(year, month);

  const filteredTotal = useMemo(
    () => (expenses ?? []).reduce((sum, expense) => sum + Number(expense.amount), 0),
    [expenses],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm shadow-slate-900/5">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="mt-1 text-muted-foreground">Track and review your spending with a clear monthly view.</p>
        </div>
        <div className="flex items-center gap-2">
          <CategoryManager />
          <RecurringExpensesDialog
            trigger={
              <Button variant="outline" size="sm">
                <Repeat className="size-4" />
                Recurring
              </Button>
            }
          />
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

      <ExpenseFilterBar filters={filters} onChange={setFilters} />

      {expensesLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <>
          {filtersActive && (
            <p className="px-1 text-sm text-muted-foreground">
              {(expenses ?? []).length} matching{" "}
              {(expenses ?? []).length === 1 ? "expense" : "expenses"} ·{" "}
              <span className="font-medium text-foreground">{formatCurrency(filteredTotal)}</span>
            </p>
          )}
          <ExpenseTable
            expenses={expenses ?? []}
            emptyMessage={
              filtersActive
                ? "No expenses match these filters."
                : "No expenses for this month yet."
            }
          />
        </>
      )}
    </div>
  );
}
