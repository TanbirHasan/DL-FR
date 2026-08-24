"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebtFormDialog } from "@/components/debts/debt-form-dialog";
import { DebtItem } from "@/components/debts/debt-item";
import { DebtSummaryCards } from "@/components/debts/debt-summary-cards";
import { useDebtSummary, useDebts } from "@/hooks/use-debts";

export default function DebtsPage() {
  const [showAll, setShowAll] = useState(false);
  const { data: debts, isLoading } = useDebts(showAll ? {} : { settled: false });
  const { data: summary, isLoading: summaryLoading } = useDebtSummary();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm shadow-slate-900/5">
        <div>
          <h1 className="text-3xl font-bold">Debts</h1>
          <p className="mt-1 text-muted-foreground">
            Track money you&apos;ve lent or borrowed informally.
          </p>
        </div>
        <DebtFormDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Log debt
            </Button>
          }
        />
      </div>

      <DebtSummaryCards summary={summary} isLoading={summaryLoading} />

      <Tabs value={showAll ? "all" : "active"} onValueChange={(v) => setShowAll(v === "all")}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {!isLoading && debts?.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-card/70 p-10 text-center text-sm text-muted-foreground">
          {showAll ? "No debts logged yet." : "No active debts — everything's settled."}
        </div>
      )}

      {!isLoading && debts && debts.length > 0 && (
        <div className="space-y-2">
          {debts.map((debt) => (
            <DebtItem key={debt.id} debt={debt} />
          ))}
        </div>
      )}
    </div>
  );
}
