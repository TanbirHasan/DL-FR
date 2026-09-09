"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthPicker } from "@/components/expenses/month-picker";
import { BillFormDialog } from "@/components/bills/bill-form-dialog";
import { BillSummaryCards } from "@/components/bills/bill-summary-cards";
import { BillPaymentList } from "@/components/bills/bill-payment-list";
import { BillDefinitionsList } from "@/components/bills/bill-definitions-list";
import { useBillPayments, useBillSummary, useBills } from "@/hooks/use-bills";

export default function BillsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: payments, isLoading: paymentsLoading } = useBillPayments({ year, month });
  const { data: summary, isLoading: summaryLoading } = useBillSummary(year, month);
  const { data: bills, isLoading: billsLoading } = useBills();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm shadow-slate-900/5">
        <div>
          <h1 className="text-3xl font-bold">Bills to Pay</h1>
          <p className="mt-1 text-muted-foreground">
            Recurring bills with due dates. Mark one paid and the expense is logged for you.
          </p>
        </div>
        <BillFormDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Add bill
            </Button>
          }
        />
      </div>

      <Tabs defaultValue="month" className="space-y-4">
        <TabsList>
          <TabsTrigger value="month">This month</TabsTrigger>
          <TabsTrigger value="all">All bills</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-6">
          <MonthPicker
            year={year}
            month={month}
            onChange={(y, m) => {
              setYear(y);
              setMonth(m);
            }}
          />

          <BillSummaryCards summary={summary} isLoading={summaryLoading} />

          {paymentsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <BillPaymentList payments={payments ?? []} />
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {billsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <BillDefinitionsList bills={bills ?? []} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
