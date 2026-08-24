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
import { useCreateJournalEntry, useUpdateJournalEntry } from "@/hooks/use-journal";
import { extractErrorMessage } from "@/lib/api/client";
import type { JournalEntry, JournalMood } from "@/lib/types";

const NONE = "__none__";

const journalSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  content: z.string().min(1, "Write a note").max(5000),
  mood: z.enum(["GREAT", "GOOD", "OKAY", "LOW", "STRESSED", NONE]),
  entryDate: z.string().min(1, "Pick a date"),
});

type JournalForm = z.infer<typeof journalSchema>;

function toDateInputValue(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export function JournalEntryDialog({
  entry,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  entry?: JournalEntry;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const createEntry = useCreateJournalEntry();
  const updateEntry = useUpdateJournalEntry();
  const isEdit = Boolean(entry);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JournalForm>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      title: entry?.title ?? "",
      content: entry?.content ?? "",
      mood: entry?.mood ?? NONE,
      entryDate: entry ? toDateInputValue(entry.entryDate) : new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: entry?.title ?? "",
        content: entry?.content ?? "",
        mood: entry?.mood ?? NONE,
        entryDate: entry ? toDateInputValue(entry.entryDate) : new Date().toISOString().slice(0, 10),
      });
    }
  }, [entry, open, reset]);

  const onSubmit = async (values: JournalForm) => {
    try {
      const payload = {
        title: values.title,
        content: values.content,
        mood: values.mood === NONE ? undefined : (values.mood as JournalMood),
        entryDate: new Date(`${values.entryDate}T00:00:00`).toISOString(),
      };
      if (isEdit && entry) {
        await updateEntry.mutateAsync({ id: entry.id, payload });
        toast.success("Journal entry updated");
      } else {
        await createEntry.mutateAsync(payload);
        toast.success("Journal entry saved");
      }
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save journal entry"));
    }
  };

  const isSubmitting = createEntry.isPending || updateEntry.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit journal entry" : "New journal entry"}</DialogTitle>
          <DialogDescription>Capture notes, events, thoughts, or important daily details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="journal-title">Title</Label>
            <Input id="journal-title" placeholder="Today at home" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="entryDate">Date</Label>
              <Input id="entryDate" type="date" {...register("entryDate")} />
            </div>
            <div className="space-y-2">
              <Label>Mood</Label>
              <Controller
                control={control}
                name="mood"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No mood</SelectItem>
                      <SelectItem value="GREAT">Great</SelectItem>
                      <SelectItem value="GOOD">Good</SelectItem>
                      <SelectItem value="OKAY">Okay</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="STRESSED">Stressed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Notes</Label>
            <Textarea id="content" rows={6} placeholder="What happened today?" {...register("content")} />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Save entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
