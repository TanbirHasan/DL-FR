"use client";

import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { DebtFormDialog } from "./debt-form-dialog";
import { useDeleteDebt, useUpdateDebt } from "@/hooks/use-debts";
import { extractErrorMessage } from "@/lib/api/client";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Debt } from "@/lib/types";

export function DebtItem({ debt }: { debt: Debt }) {
  const updateDebt = useUpdateDebt();
  const deleteDebt = useDeleteDebt();

  const handleToggleSettled = async (checked: boolean) => {
    try {
      await updateDebt.mutateAsync({ id: debt.id, payload: { isSettled: checked } });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update debt"));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDebt.mutateAsync(debt.id);
      toast.success("Debt deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete debt"));
    }
  };

  const description =
    debt.direction === "LENT"
      ? `${debt.personName} owes you`
      : `You owe ${debt.personName}`;

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
      <Checkbox
        checked={debt.isSettled}
        onCheckedChange={(checked) => handleToggleSettled(Boolean(checked))}
        className="mt-0.5"
      />
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              debt.isSettled && "text-muted-foreground line-through"
            )}
          >
            {description}
          </span>
          <Badge
            variant="outline"
            className={cn(
              debt.direction === "LENT"
                ? "border-emerald-200 text-emerald-700"
                : "border-rose-200 text-rose-700"
            )}
          >
            {formatCurrency(debt.amount)}
          </Badge>
          {debt.isSettled && <Badge variant="secondary">Settled</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">{formatDate(debt.date)}</p>
        {debt.note && <p className="text-sm text-muted-foreground">{debt.note}</p>}
      </div>
      <div className="flex items-center gap-1">
        <DebtFormDialog
          debt={debt}
          trigger={
            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
              <Pencil className="size-3.5" />
            </Button>
          }
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive">
              <Trash2 className="size-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this debt?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
