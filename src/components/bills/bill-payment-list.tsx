"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMarkBillPaid, useMarkBillUnpaid } from "@/hooks/use-bills";
import { extractErrorMessage } from "@/lib/api/client";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { BillPayment, BillPaymentStatus } from "@/lib/types";

const STATUS_STYLES: Record<BillPaymentStatus, string> = {
  UPCOMING: "border-transparent bg-sky-500/12 text-sky-700 dark:text-sky-300",
  PAID: "border-transparent bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  OVERDUE: "border-transparent bg-destructive/12 text-destructive",
};

const STATUS_LABEL: Record<BillPaymentStatus, string> = {
  UPCOMING: "Upcoming",
  PAID: "Paid",
  OVERDUE: "Overdue",
};

function MarkPaidDialog({
  payment,
  onOpenChange,
}: {
  payment: BillPayment;
  onOpenChange: (open: boolean) => void;
}) {
  const markPaid = useMarkBillPaid();
  const [amount, setAmount] = useState(() =>
    payment.bill.amount ? String(Number(payment.bill.amount)) : ""
  );

  const submit = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter an amount greater than 0");
      return;
    }
    try {
      await markPaid.mutateAsync({ paymentId: payment.id, payload: { amountPaid: value } });
      toast.success(`${payment.bill.name} marked paid`);
      onOpenChange(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not mark bill paid"));
    }
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Pay {payment.bill.name}</DialogTitle>
          <DialogDescription>
            This logs an expense in {payment.bill.category?.name ?? "the bill's category"} dated today.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="amountPaid">Amount paid</Label>
          <Input
            id="amountPaid"
            type="number"
            step="0.01"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={markPaid.isPending}>
            {markPaid.isPending ? "Saving..." : "Confirm payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BillPaymentList({ payments }: { payments: BillPayment[] }) {
  const markUnpaid = useMarkBillUnpaid();
  const [payingId, setPayingId] = useState<string | null>(null);

  const paying = payments.find((p) => p.id === payingId) ?? null;

  const handleUnpay = async (payment: BillPayment) => {
    try {
      await markUnpaid.mutateAsync(payment.id);
      toast.success(`${payment.bill.name} moved back to unpaid`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not undo payment"));
    }
  };

  if (payments.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
        No bills due this month. Add a bill to start tracking.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {paying && (
        <MarkPaidDialog
          key={paying.id}
          payment={paying}
          onOpenChange={(open) => !open && setPayingId(null)}
        />
      )}
      {payments.map((payment) => {
        const expected = payment.amountPaid ?? payment.bill.amount;
        return (
          <div
            key={payment.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/60 px-4 py-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{payment.bill.name}</span>
                <Badge className={cn("text-xs", STATUS_STYLES[payment.status])}>
                  {STATUS_LABEL[payment.status]}
                </Badge>
                {payment.bill.isVariable && (
                  <Badge variant="outline" className="text-xs">
                    Variable
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Due {formatDate(payment.dueDate)}
                {payment.bill.category?.name && ` · ${payment.bill.category.name}`}
                {payment.status === "PAID" && payment.paidAt && ` · Paid ${formatDate(payment.paidAt)}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-right font-semibold tabular-nums",
                  payment.status === "PAID" && "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {expected ? formatCurrency(expected) : "—"}
              </span>
              {payment.status === "PAID" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnpay(payment)}
                  disabled={markUnpaid.isPending}
                >
                  <RotateCcw className="size-4" />
                  Undo
                </Button>
              ) : (
                <Button size="sm" onClick={() => setPayingId(payment.id)}>
                  <Check className="size-4" />
                  Mark paid
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
