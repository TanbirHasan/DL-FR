"use client";

import { useState } from "react";
import { HeartPulse, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HealthReminderDialog } from "@/components/health/health-reminder-dialog";
import { HealthReminderItem } from "@/components/health/health-reminder-item";
import { useHealthReminders } from "@/hooks/use-health-reminders";

export default function HealthPage() {
  const [showAll, setShowAll] = useState(false);
  const { data: reminders, isLoading } = useHealthReminders(showAll);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm shadow-slate-900/5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <HeartPulse className="size-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold">Health Reminders</h1>
            <p className="mt-1 text-muted-foreground">Medicine, doctor visits, hydration, exercise, and wellness routines.</p>
          </div>
        </div>
        <HealthReminderDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              New health reminder
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
        <div className="rounded-2xl border border-dashed bg-card/70 p-10 text-center text-sm text-muted-foreground">
          {showAll ? "No health reminders yet." : "No upcoming health reminders."}
        </div>
      )}

      {!isLoading && reminders && reminders.length > 0 && (
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <HealthReminderItem key={reminder.id} reminder={reminder} />
          ))}
        </div>
      )}
    </div>
  );
}
