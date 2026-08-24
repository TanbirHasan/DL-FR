"use client";

import { toast } from "sonner";
import { Phone, ListTodo, Pencil, Trash2 } from "lucide-react";
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
import { ReminderFormDialog } from "./reminder-form-dialog";
import { useDeleteReminder, useUpdateReminder } from "@/hooks/use-reminders";
import { extractErrorMessage } from "@/lib/api/client";
import { cn, formatDateTime } from "@/lib/utils";
import type { Reminder } from "@/lib/types";

export function ReminderItem({ reminder }: { reminder: Reminder }) {
  const updateReminder = useUpdateReminder();
  const deleteReminder = useDeleteReminder();

  const isOverdue = !reminder.isCompleted && new Date(reminder.dueAt) < new Date();

  const handleToggleComplete = async (checked: boolean) => {
    try {
      await updateReminder.mutateAsync({ id: reminder.id, payload: { isCompleted: checked } });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update reminder"));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReminder.mutateAsync(reminder.id);
      toast.success("Reminder deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete reminder"));
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <Checkbox
        checked={reminder.isCompleted}
        onCheckedChange={(checked) => handleToggleComplete(Boolean(checked))}
        className="mt-0.5"
      />
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              reminder.isCompleted && "text-muted-foreground line-through"
            )}
          >
            {reminder.title}
          </span>
          <Badge variant="outline" className="gap-1">
            {reminder.type === "CALL" ? <Phone className="size-3" /> : <ListTodo className="size-3" />}
            {reminder.type === "CALL" ? "Call" : "Task"}
          </Badge>
          {isOverdue && <Badge variant="destructive">Overdue</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">Due {formatDateTime(reminder.dueAt)}</p>
        {reminder.notes && <p className="text-sm text-muted-foreground">{reminder.notes}</p>}
      </div>
      <div className="flex items-center gap-1">
        <ReminderFormDialog
          reminder={reminder}
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
              <AlertDialogTitle>Delete this reminder?</AlertDialogTitle>
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
