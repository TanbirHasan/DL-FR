"use client";

import Link from "next/link";
import { differenceInCalendarDays, format, isToday, isTomorrow } from "date-fns";
import {
  BellRing,
  Briefcase,
  CalendarClock,
  FileArchive,
  HeartPulse,
  Repeat,
  type LucideIcon,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { AgendaItem, AgendaKind } from "@/lib/types";

const KIND_META: Record<AgendaKind, { icon: LucideIcon; label: string; tint: string }> = {
  reminder: { icon: BellRing, label: "Reminder", tint: "bg-sky-500/12 text-sky-600 dark:text-sky-400" },
  bill: {
    icon: CalendarClock,
    label: "Bill",
    tint: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  },
  "recurring-expense": {
    icon: Repeat,
    label: "Recurring",
    tint: "bg-primary/12 text-primary",
  },
  "job-deadline": {
    icon: Briefcase,
    label: "Job deadline",
    tint: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  },
  document: {
    icon: FileArchive,
    label: "Document",
    tint: "bg-slate-500/12 text-slate-600 dark:text-slate-300",
  },
  health: {
    icon: HeartPulse,
    label: "Health",
    tint: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  },
};

function dateLabel(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  const diff = differenceInCalendarDays(d, new Date());
  if (diff > 1 && diff <= 7) return format(d, "EEE");
  return format(d, "d MMM");
}

function bucketOf(item: AgendaItem): string {
  const d = new Date(item.date);
  if (item.overdue) return "Overdue";
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (differenceInCalendarDays(d, new Date()) <= 7) return "This week";
  return "Later";
}

const BUCKET_ORDER = ["Overdue", "Today", "Tomorrow", "This week", "Later"];

function AgendaRow({ item }: { item: AgendaItem }) {
  const meta = KIND_META[item.kind];
  const Icon = meta.icon;
  return (
    <Link
      href={item.href}
      className="flex items-center gap-3 rounded-xl border bg-card/60 px-3 py-2.5 transition-colors hover:bg-accent/60"
    >
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", meta.tint)}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">{item.subtitle ?? meta.label}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span
          className={cn(
            "text-xs font-medium",
            item.overdue ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {item.overdue ? `Overdue · ${format(new Date(item.date), "d MMM")}` : dateLabel(item.date)}
        </span>
        {item.amount != null && (
          <span className="text-sm font-semibold tabular-nums">{formatCurrency(item.amount)}</span>
        )}
      </div>
    </Link>
  );
}

export function UpcomingAgenda({
  items,
  limit,
  emptyMessage = "Nothing due in this window. You're all clear.",
}: {
  items: AgendaItem[];
  limit?: number;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  if (limit) {
    const shown = items.slice(0, limit);
    return (
      <div className="space-y-2">
        {shown.map((item) => (
          <AgendaRow key={`${item.kind}-${item.id}`} item={item} />
        ))}
        {items.length > limit && (
          <Link
            href="/dashboard/agenda"
            className="block pt-1 text-center text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            +{items.length - limit} more
          </Link>
        )}
      </div>
    );
  }

  const grouped = BUCKET_ORDER.map((bucket) => ({
    bucket,
    rows: items.filter((item) => bucketOf(item) === bucket),
  })).filter((g) => g.rows.length > 0);

  return (
    <div className="space-y-5">
      {grouped.map(({ bucket, rows }) => (
        <div key={bucket} className="space-y-2">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                bucket === "Overdue" ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {bucket}
            </h3>
            <span className="text-xs text-muted-foreground">({rows.length})</span>
          </div>
          <div className="space-y-2">
            {rows.map((item) => (
              <AgendaRow key={`${item.kind}-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
