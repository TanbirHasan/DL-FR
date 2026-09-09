"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import { useCreateBill, useUpdateBill } from "@/hooks/use-bills";
import { extractErrorMessage } from "@/lib/api/client";
import type { Bill } from "@/lib/types";

const billSchema = z
  .object({
    name: z.string().min(1, "Enter a name").max(100),
    isVariable: z.boolean(),
    amount: z.coerce.number().positive("Enter an amount greater than 0").optional(),
    dueDay: z.coerce.number().int().min(1, "1–31").max(31, "1–31"),
    notifyBefore: z.coerce.number().int().min(0, "0 or more").max(30, "30 or fewer"),
    categoryId: z.string().min(1, "Select a category"),
    isActive: z.boolean(),
  })
  .refine((data) => data.isVariable || data.amount !== undefined, {
    message: "Enter an amount, or mark the bill as variable",
    path: ["amount"],
  });

type BillForm = z.infer<typeof billSchema>;

export function BillFormDialog({
  bill,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  bill?: Bill;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;
  const { data: categories } = useCategories();
  const createBill = useCreateBill();
  const updateBill = useUpdateBill();
  const isEdit = Boolean(bill);

  const defaults = (): BillForm => ({
    name: bill?.name ?? "",
    isVariable: bill?.isVariable ?? false,
    amount: bill?.amount ? Number(bill.amount) : undefined,
    dueDay: bill?.dueDay ?? 1,
    notifyBefore: bill?.notifyBefore ?? 2,
    categoryId: bill?.categoryId ?? "",
    isActive: bill?.isActive ?? true,
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(billSchema), defaultValues: defaults() });

  const isVariable = watch("isVariable");

  useEffect(() => {
    if (open) reset(defaults());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bill]);

  const onSubmit = async (values: BillForm) => {
    try {
      const payload = {
        name: values.name.trim(),
        isVariable: values.isVariable,
        amount: values.isVariable ? null : values.amount,
        dueDay: values.dueDay,
        notifyBefore: values.notifyBefore,
        categoryId: values.categoryId,
        isActive: values.isActive,
      };
      if (isEdit && bill) {
        await updateBill.mutateAsync({ id: bill.id, payload });
        toast.success("Bill updated");
      } else {
        await createBill.mutateAsync({ ...payload, amount: payload.amount ?? undefined });
        toast.success("Bill added");
      }
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save bill"));
    }
  };

  const isSubmitting = createBill.isPending || updateBill.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit bill" : "Add bill"}</DialogTitle>
          <DialogDescription>
            A recurring bill with a monthly due date. Marking a month paid logs the expense
            automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Internet, Electricity, Rent…" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <Controller
            control={control}
            name="isVariable"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Variable amount</p>
                  <p className="text-xs text-muted-foreground">
                    Amount differs each month (e.g. electricity). You&apos;ll enter it when paying.
                  </p>
                </div>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                disabled={isVariable}
                {...register("amount")}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDay">Due day of month</Label>
              <Input id="dueDay" type="number" min={1} max={31} {...register("dueDay")} />
              {errors.dueDay && <p className="text-sm text-destructive">{errors.dueDay.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
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
            <div className="space-y-2">
              <Label htmlFor="notifyBefore">Remind (days before)</Label>
              <Input
                id="notifyBefore"
                type="number"
                min={0}
                max={30}
                {...register("notifyBefore")}
              />
              {errors.notifyBefore && (
                <p className="text-sm text-destructive">{errors.notifyBefore.message}</p>
              )}
            </div>
          </div>

          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">
                    Inactive bills stop generating monthly payments and reminders.
                  </p>
                </div>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />

          {categories?.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No categories yet — add one from the Expenses page first.
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Add bill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
