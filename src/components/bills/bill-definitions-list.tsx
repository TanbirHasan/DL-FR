"use client";

import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BillFormDialog } from "./bill-form-dialog";
import { useDeleteBill, useUpdateBill } from "@/hooks/use-bills";
import { extractErrorMessage } from "@/lib/api/client";
import { formatCurrency } from "@/lib/utils";
import type { Bill } from "@/lib/types";

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
};

export function BillDefinitionsList({ bills }: { bills: Bill[] }) {
  const updateBill = useUpdateBill();
  const deleteBill = useDeleteBill();

  const toggleActive = async (bill: Bill, isActive: boolean) => {
    try {
      await updateBill.mutateAsync({ id: bill.id, payload: { isActive } });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update bill"));
    }
  };

  const handleDelete = async (bill: Bill) => {
    try {
      await deleteBill.mutateAsync(bill.id);
      toast.success("Bill deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete bill"));
    }
  };

  if (bills.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No bills set up yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bills.map((bill) => (
        <div
          key={bill.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/60 px-4 py-3"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{bill.name}</span>
              {bill.isVariable ? (
                <Badge variant="outline" className="text-xs">
                  Variable
                </Badge>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  {formatCurrency(bill.amount ?? 0)}
                </span>
              )}
              {!bill.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Due the {ordinal(bill.dueDay)} · {bill.category?.name ?? "—"} · reminds{" "}
              {bill.notifyBefore}d before
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Switch
              checked={bill.isActive}
              onCheckedChange={(checked) => toggleActive(bill, checked)}
            />
            <BillFormDialog
              bill={bill}
              trigger={
                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                  <Pencil className="size-4" />
                </Button>
              }
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {bill.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the bill and its unpaid monthly entries. Expenses already logged
                    from paid months are kept.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(bill)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}
