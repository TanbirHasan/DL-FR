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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateDebt, useUpdateDebt } from "@/hooks/use-debts";
import { extractErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { Debt } from "@/lib/types";

const debtSchema = z.object({
  personName: z.string().min(1, "Name is required").max(100),
  direction: z.enum(["LENT", "BORROWED"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.date(),
  note: z.string().max(200).optional(),
});

export function DebtFormDialog({
  debt,
  trigger,
}: {
  debt?: Debt;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const createDebt = useCreateDebt();
  const updateDebt = useUpdateDebt();
  const isEdit = Boolean(debt);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      personName: debt?.personName ?? "",
      direction: debt?.direction ?? "LENT",
      amount: debt ? Number(debt.amount) : undefined,
      date: debt ? new Date(debt.date) : new Date(),
      note: debt?.note ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        personName: debt?.personName ?? "",
        direction: debt?.direction ?? "LENT",
        amount: debt ? Number(debt.amount) : undefined,
        date: debt ? new Date(debt.date) : new Date(),
        note: debt?.note ?? "",
      });
    }
  }, [open, debt, reset]);

  const onSubmit = async (values: z.infer<typeof debtSchema>) => {
    try {
      const payload = {
        personName: values.personName,
        direction: values.direction,
        amount: values.amount,
        date: values.date.toISOString(),
        note: values.note || undefined,
      };
      if (isEdit && debt) {
        await updateDebt.mutateAsync({ id: debt.id, payload });
        toast.success("Debt updated");
      } else {
        await createDebt.mutateAsync(payload);
        toast.success("Debt logged");
      }
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save debt"));
    }
  };

  const isSubmitting = createDebt.isPending || updateDebt.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit debt" : "Log a debt"}</DialogTitle>
          <DialogDescription>
            Track money you&apos;ve lent or borrowed informally.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="personName">Person</Label>
              <Input id="personName" placeholder="Rahim" {...register("personName")} />
              {errors.personName && (
                <p className="text-sm text-destructive">{errors.personName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Direction</Label>
              <Controller
                control={control}
                name="direction"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LENT">I lent them</SelectItem>
                      <SelectItem value="BORROWED">I borrowed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

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
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
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
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" placeholder="e.g. for lunch" {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Log debt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
