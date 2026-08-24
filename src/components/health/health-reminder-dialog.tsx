"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateHealthReminder, useUpdateHealthReminder } from "@/hooks/use-health-reminders";
import { extractErrorMessage } from "@/lib/api/client";
import type { HealthReminder } from "@/lib/types";

const healthSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  type: z.enum(["MEDICINE", "DOCTOR", "WATER", "EXERCISE", "OTHER"]),
  frequency: z.enum(["ONCE", "DAILY", "WEEKLY", "MONTHLY"]),
  dueAt: z.string().min(1, "Pick a date and time"),
  notifyBefore: z.number().int().min(0),
  notes: z.string().max(500).optional(),
});

type HealthForm = z.infer<typeof healthSchema>;

function toLocalInputValue(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function HealthReminderDialog({
  reminder,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  reminder?: HealthReminder;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const createReminder = useCreateHealthReminder();
  const updateReminder = useUpdateHealthReminder();
  const isEdit = Boolean(reminder);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HealthForm>({
    resolver: zodResolver(healthSchema),
    defaultValues: {
      title: reminder?.title ?? "",
      type: reminder?.type ?? "MEDICINE",
      frequency: reminder?.frequency ?? "ONCE",
      dueAt: reminder ? toLocalInputValue(reminder.dueAt) : "",
      notifyBefore: reminder?.notifyBefore ?? 30,
      notes: reminder?.notes ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: reminder?.title ?? "",
        type: reminder?.type ?? "MEDICINE",
        frequency: reminder?.frequency ?? "ONCE",
        dueAt: reminder ? toLocalInputValue(reminder.dueAt) : "",
        notifyBefore: reminder?.notifyBefore ?? 30,
        notes: reminder?.notes ?? "",
      });
    }
  }, [open, reminder, reset]);

  const onSubmit = async (values: HealthForm) => {
    try {
      const payload = {
        title: values.title,
        type: values.type,
        frequency: values.frequency,
        dueAt: new Date(values.dueAt).toISOString(),
        notifyBefore: values.notifyBefore,
        notes: values.notes || undefined,
      };
      if (isEdit && reminder) {
        await updateReminder.mutateAsync({ id: reminder.id, payload });
        toast.success("Health reminder updated");
      } else {
        await createReminder.mutateAsync(payload);
        toast.success("Health reminder created");
      }
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save health reminder"));
    }
  };

  const isSubmitting = createReminder.isPending || updateReminder.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit health reminder" : "New health reminder"}</DialogTitle>
          <DialogDescription>Track medicine, appointments, hydration, exercise, and wellness tasks.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="health-title">Title</Label>
            <Input id="health-title" placeholder="Take medicine" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEDICINE">Medicine</SelectItem>
                      <SelectItem value="DOCTOR">Doctor</SelectItem>
                      <SelectItem value="WATER">Water</SelectItem>
                      <SelectItem value="EXERCISE">Exercise</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Controller
                control={control}
                name="frequency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONCE">Once</SelectItem>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="health-dueAt">Due date &amp; time</Label>
              <Input id="health-dueAt" type="datetime-local" {...register("dueAt")} />
              {errors.dueAt && <p className="text-sm text-destructive">{errors.dueAt.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="health-notifyBefore">Notify before (min)</Label>
              <Input
                id="health-notifyBefore"
                type="number"
                min={0}
                {...register("notifyBefore", { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="health-notes">Notes</Label>
            <Textarea id="health-notes" rows={3} {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
