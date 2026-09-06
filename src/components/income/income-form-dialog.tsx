"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateIncome, useUpdateIncome } from "@/hooks/use-income";
import { extractErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { Income } from "@/lib/types";

const incomeSchema = z.object({
  amount: z.coerce.number().positive("Enter an amount greater than 0"),
  source: z.string().min(1, "Enter a source").max(100),
  date: z.date(),
  note: z.string().max(200).optional(),
});

type IncomeForm = z.infer<typeof incomeSchema>;

const COMMON_SOURCES = ["Salary", "Freelance", "Business", "Bonus", "Gift", "Refund", "Investment"];

export function IncomeFormDialog({
  income,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  income?: Income;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();
  const isEdit = Boolean(income);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: income ? Number(income.amount) : undefined,
      source: income?.source ?? "",
      date: income ? new Date(income.date) : new Date(),
      note: income?.note ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        amount: income ? Number(income.amount) : undefined,
        source: income?.source ?? "",
        date: income ? new Date(income.date) : new Date(),
        note: income?.note ?? "",
      });
    }
  }, [open, income, reset]);

  const onSubmit = async (values: IncomeForm) => {
    try {
      const payload = {
        amount: values.amount,
        source: values.source.trim(),
        date: values.date.toISOString(),
        note: values.note || undefined,
      };
      if (isEdit && income) {
        await updateIncome.mutateAsync({ id: income.id, payload });
        toast.success("Income updated");
      } else {
        await createIncome.mutateAsync(payload);
        toast.success("Income added");
      }
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save income"));
    }
  };

  const isSubmitting = createIncome.isPending || updateIncome.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit income" : "Add income"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details of this income entry." : "Log money you received."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" {...register("amount")} />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="size-4" />
                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => date && field.onChange(date)}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input id="source" list="income-sources" placeholder="Salary, Upwork, Gift…" {...register("source")} />
            <datalist id="income-sources">
              {COMMON_SOURCES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {errors.source && <p className="text-sm text-destructive">{errors.source.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea id="note" rows={2} {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Add income"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
