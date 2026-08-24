"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { JournalEntryDialog } from "./journal-entry-dialog";
import { useDeleteJournalEntry } from "@/hooks/use-journal";
import { extractErrorMessage } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import type { JournalEntry } from "@/lib/types";

const moodLabels: Record<string, string> = {
  GREAT: "Great",
  GOOD: "Good",
  OKAY: "Okay",
  LOW: "Low",
  STRESSED: "Stressed",
};

export function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  const [editing, setEditing] = useState(false);
  const deleteEntry = useDeleteJournalEntry();

  const handleDelete = async () => {
    try {
      await deleteEntry.mutateAsync(entry.id);
      toast.success("Journal entry deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete journal entry"));
    }
  };

  return (
    <Card>
      <JournalEntryDialog entry={entry} open={editing} onOpenChange={setEditing} />
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold">{entry.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(entry.entryDate)}</span>
            {entry.mood && <Badge variant="secondary">{moodLabels[entry.mood]}</Badge>}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this journal entry?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{entry.content}</p>
      </CardContent>
    </Card>
  );
}
