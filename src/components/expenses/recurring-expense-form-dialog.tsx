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
import { useCategories } from "@/hooks/use-categories";
import { useCreateRecurringExpense, useUpdateRecurringExpense } from "@/hooks/use-recurring-expenses";
import { extractErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { RecurringExpense } from "@/lib/types";

const frequencyOptions = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
] as const;

const formSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  categoryId: z.string().min(1, "Select a category"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  startDate: z.date(),
  endDate: z.date().optional(),
  note: z.string().max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function RecurringExpenseFormDialog({
  recurringExpense,
  trigger,
}: {
  recurringExpense?: RecurringExpense;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { data: categories } = useCategories();
  const createMutation = useCreateRecurringExpense();
  const updateMutation = useUpdateRecurringExpense();
  const isEdit = Boolean(recurringExpense);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: recurringExpense ? Number(recurringExpense.amount) : undefined,
      categoryId: recurringExpense?.categoryId,
      frequency: recurringExpense?.frequency ?? "MONTHLY",
      startDate: recurringExpense ? new Date(recurringExpense.startDate) : new Date(),
      endDate: recurringExpense?.endDate ? new Date(recurringExpense.endDate) : undefined,
      note: recurringExpense?.note ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        amount: recurringExpense ? Number(recurringExpense.amount) : undefined,
        categoryId: recurringExpense?.categoryId,
        frequency: recurringExpense?.frequency ?? "MONTHLY",
        startDate: recurringExpense ? new Date(recurringExpense.startDate) : new Date(),
        endDate: recurringExpense?.endDate ? new Date(recurringExpense.endDate) : undefined,
        note: recurringExpense?.note ?? "",
      });
    }
  }, [open, recurringExpense, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && recurringExpense) {
        await updateMutation.mutateAsync({
          id: recurringExpense.id,
          payload: {
            amount: values.amount,
            categoryId: values.categoryId,
            endDate: values.endDate ? values.endDate.toISOString() : null,
            note: values.note || undefined,
          },
        });
        toast.success("Recurring expense updated");
      } else {
        await createMutation.mutateAsync({
          amount: values.amount,
          categoryId: values.categoryId,
          frequency: values.frequency,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate ? values.endDate.toISOString() : undefined,
          note: values.note || undefined,
        });
        toast.success("Recurring expense created");
      }
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save recurring expense"));
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit recurring expense" : "New recurring expense"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this recurring expense. Frequency and start date can't be changed."
              : "Set up an expense that logs itself automatically, like rent or a subscription."}
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
              <Label>Category</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Controller
                control={control}
                name="frequency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Start date</Label>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isEdit}
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
            <Label>End date (optional)</Label>
            <Controller
              control={control}
              name="endDate"
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
                      {field.value ? format(field.value, "PPP") : "No end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => field.onChange(date)}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" placeholder="e.g. Apartment rent" {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
