"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReminderFormDialog } from "@/components/reminders/reminder-form-dialog";
import { ReminderItem } from "@/components/reminders/reminder-item";
import { useReminders } from "@/hooks/use-reminders";

export default function RemindersPage() {
  const [showAll, setShowAll] = useState(false);
  const { data: reminders, isLoading } = useReminders(showAll);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Reminders</h1>
          <p className="text-muted-foreground">Tasks and calls you don&apos;t want to forget.</p>
        </div>
        <ReminderFormDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              New reminder
            </Button>
          }
        />
      </div>

      <Tabs value={showAll ? "all" : "upcoming"} onValueChange={(v) => setShowAll(v === "all")}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!isLoading && reminders?.length === 0 && (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {showAll ? "No reminders yet." : "No upcoming reminders."}
        </div>
      )}

      {!isLoading && reminders && reminders.length > 0 && (
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <ReminderItem key={reminder.id} reminder={reminder} />
          ))}
        </div>
      )}
    </div>
  );
}
