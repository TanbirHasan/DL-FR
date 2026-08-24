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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateReminder, useUpdateReminder } from "@/hooks/use-reminders";
import { extractErrorMessage } from "@/lib/api/client";
import type { Reminder } from "@/lib/types";

const reminderSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  type: z.enum(["TASK", "CALL"]),
  dueAt: z.string().min(1, "Pick a due date and time"),
  notifyBefore: z.coerce.number().int().min(0),
  notes: z.string().max(500).optional(),
});

type ReminderForm = z.infer<typeof reminderSchema>;

function toLocalInputValue(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function ReminderFormDialog({
  reminder,
  trigger,
}: {
  reminder?: Reminder;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();
  const isEdit = Boolean(reminder);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: reminder?.title ?? "",
      type: reminder?.type ?? "TASK",
      dueAt: reminder ? toLocalInputValue(reminder.dueAt) : "",
      notifyBefore: reminder?.notifyBefore ?? 30,
      notes: reminder?.notes ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: reminder?.title ?? "",
        type: reminder?.type ?? "TASK",
        dueAt: reminder ? toLocalInputValue(reminder.dueAt) : "",
        notifyBefore: reminder?.notifyBefore ?? 30,
        notes: reminder?.notes ?? "",
      });
    }
  }, [open, reminder, reset]);

  const onSubmit = async (values: ReminderForm) => {
    try {
      const payload = {
        title: values.title,
        type: values.type,
        dueAt: new Date(values.dueAt).toISOString(),
        notifyBefore: values.notifyBefore,
        notes: values.notes || undefined,
      };
      if (isEdit && reminder) {
        await updateReminder.mutateAsync({ id: reminder.id, payload });
        toast.success("Reminder updated");
      } else {
        await createReminder.mutateAsync(payload);
        toast.success("Reminder created");
      }
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save reminder"));
    }
  };

  const isSubmitting = createReminder.isPending || updateReminder.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit reminder" : "New reminder"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this reminder." : "Get notified before something is due."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Call the landlord" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="TASK">Task</SelectItem>
                      <SelectItem value="CALL">Call</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notifyBefore">Notify before (min)</Label>
              <Input id="notifyBefore" type="number" min={0} {...register("notifyBefore")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueAt">Due date &amp; time</Label>
            <Input id="dueAt" type="datetime-local" {...register("dueAt")} />
            {errors.dueAt && <p className="text-sm text-destructive">{errors.dueAt.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" rows={2} {...register("notes")} />
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
