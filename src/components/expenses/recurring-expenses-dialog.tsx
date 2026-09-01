"use client";

import { toast } from "sonner";
import { Pencil, Plus, Repeat, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import { RecurringExpenseFormDialog } from "./recurring-expense-form-dialog";
import {
  useDeleteRecurringExpense,
  useRecurringExpenses,
  useUpdateRecurringExpense,
} from "@/hooks/use-recurring-expenses";
import { extractErrorMessage } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/utils";

const FREQUENCY_LABEL: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const DAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const weekendSummary = (days: number[]) =>
  [...days]
    .sort((a, b) => a - b)
    .map((d) => DAY_LABEL[d])
    .filter(Boolean)
    .join(", ");

export function RecurringExpensesDialog({ trigger }: { trigger: React.ReactNode }) {
  const { data: recurringExpenses, isLoading } = useRecurringExpenses();
  const updateMutation = useUpdateRecurringExpense();
  const deleteMutation = useDeleteRecurringExpense();

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateMutation.mutateAsync({ id, payload: { isActive } });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update recurring expense"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Recurring expense deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete recurring expense"));
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Recurring expenses</DialogTitle>
          <DialogDescription>
            Expenses that log themselves automatically, like rent or subscriptions.
          </DialogDescription>
        </DialogHeader>

        <RecurringExpenseFormDialog
          trigger={
            <Button size="sm" className="self-start">
              <Plus className="size-4" />
              New recurring expense
            </Button>
          }
        />

        <div className="max-h-96 space-y-2 overflow-y-auto">
          {isLoading && (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          )}
          {!isLoading && recurringExpenses?.length === 0 && (
            <p className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
              <Repeat className="size-6" />
              No recurring expenses set up yet.
            </p>
          )}
          {recurringExpenses?.map((item) => (
            <div key={item.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatCurrency(item.amount)}</span>
                    <Badge variant="secondary">{item.category?.name}</Badge>
                    <Badge variant="outline">{FREQUENCY_LABEL[item.frequency]}</Badge>
                    {item.frequency === "DAILY" && item.skipWeekends && (
                      <Badge variant="outline">Skips {weekendSummary(item.weekendDays)}</Badge>
                    )}
                  </div>
                  {item.note && <p className="text-sm text-muted-foreground">{item.note}</p>}
                  <p className="text-xs text-muted-foreground">
                    Next: {formatDate(item.nextRunDate)}
                    {item.endDate && ` · Ends ${formatDate(item.endDate)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={item.isActive}
                    onCheckedChange={(checked) => handleToggleActive(item.id, checked)}
                  />
                  <RecurringExpenseFormDialog
                    recurringExpense={item}
                    trigger={
                      <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                        <Pencil className="size-3.5" />
                      </Button>
                    }
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this recurring expense?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Future occurrences will stop being logged. Expenses already generated from
                          it are kept. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
