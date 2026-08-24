"use client";

import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JournalEntryCard } from "@/components/journal/journal-entry-card";
import { JournalEntryDialog } from "@/components/journal/journal-entry-dialog";
import { useJournalEntries } from "@/hooks/use-journal";

export default function JournalPage() {
  const { data: entries, isLoading } = useJournalEntries();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm shadow-slate-900/5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="size-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold">Daily Journal</h1>
            <p className="mt-1 text-muted-foreground">Keep notes, thoughts, important details, and event logs.</p>
          </div>
        </div>
        <JournalEntryDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              New entry
            </Button>
          }
        />
      </div>

      {isLoading && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      )}

      {!isLoading && entries?.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-card/70 p-10 text-center text-sm text-muted-foreground">
          No journal entries yet. Write your first note for today.
        </div>
      )}

      {!isLoading && entries && entries.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {entries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
