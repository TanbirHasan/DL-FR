"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Activity, Droplets, Dumbbell, Pill, Stethoscope, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { HealthReminderDialog } from "./health-reminder-dialog";
import { useDeleteHealthReminder, useUpdateHealthReminder } from "@/hooks/use-health-reminders";
import { extractErrorMessage } from "@/lib/api/client";
import { cn, formatDateTime } from "@/lib/utils";
import type { HealthReminder, HealthReminderType } from "@/lib/types";

const typeMeta: Record<HealthReminderType, { label: string; icon: React.ElementType }> = {
  MEDICINE: { label: "Medicine", icon: Pill },
  DOCTOR: { label: "Doctor", icon: Stethoscope },
  WATER: { label: "Water", icon: Droplets },
  EXERCISE: { label: "Exercise", icon: Dumbbell },
  OTHER: { label: "Other", icon: Activity },
};

export function HealthReminderItem({ reminder }: { reminder: HealthReminder }) {
  const [editing, setEditing] = useState(false);
  const updateReminder = useUpdateHealthReminder();
  const deleteReminder = useDeleteHealthReminder();
  const meta = typeMeta[reminder.type];
  const Icon = meta.icon;
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
      toast.success("Health reminder deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete health reminder"));
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card/85 p-3 shadow-sm shadow-slate-900/5">
      <HealthReminderDialog reminder={reminder} open={editing} onOpenChange={setEditing} />
      <Checkbox
        checked={reminder.isCompleted}
        onCheckedChange={(checked) => handleToggleComplete(Boolean(checked))}
        className="mt-0.5"
      />
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-sm font-semibold",
              reminder.isCompleted && "text-muted-foreground line-through"
            )}
          >
            {reminder.title}
          </span>
          <Badge variant="outline" className="gap-1 bg-background/70">
            <Icon className="size-3" />
            {meta.label}
          </Badge>
          <Badge variant="secondary">{reminder.frequency.toLowerCase()}</Badge>
          {isOverdue && <Badge variant="destructive">Overdue</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">Due {formatDateTime(reminder.dueAt)}</p>
        {reminder.notes && <p className="text-sm text-muted-foreground">{reminder.notes}</p>}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" onClick={() => setEditing(true)}>
          <Pencil className="size-3.5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive">
              <Trash2 className="size-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this health reminder?</AlertDialogTitle>
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
