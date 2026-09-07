"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlarmClock, CalendarDays, ChevronDown, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { JobApplicationFormDialog } from "./job-application-form-dialog";
import { STATUS_BADGE_CLASS, STATUS_LABEL, STATUS_ORDER } from "./status";
import { useDeleteJobApplication, useUpdateJobApplication } from "@/hooks/use-job-applications";
import { extractErrorMessage } from "@/lib/api/client";
import { cn, formatDate, initials } from "@/lib/utils";
import type { JobApplication, JobApplicationStatus } from "@/lib/types";

const STATUS_ACCENT: Record<JobApplicationStatus, { bar: string; tile: string }> = {
  NOT_APPLIED: {
    bar: "bg-zinc-300 dark:bg-zinc-600",
    tile: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  },
  APPLIED: {
    bar: "bg-slate-400",
    tile: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  ASSESSMENT: {
    bar: "bg-amber-400",
    tile: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  INTERVIEW: {
    bar: "bg-indigo-400",
    tile: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
  },
  OFFER: {
    bar: "bg-emerald-500",
    tile: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  REJECTED: {
    bar: "bg-rose-400",
    tile: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  },
};

function deadlineMeta(deadline: string) {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (days < 0) {
    return { tone: "bg-destructive/10 text-destructive", label: `Deadline passed · ${formatDate(deadline)}` };
  }
  if (days === 0) return { tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400", label: "Due today" };
  if (days === 1) return { tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400", label: "Due tomorrow" };
  if (days <= 7) {
    return { tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400", label: `Due in ${days} days` };
  }
  return { tone: "bg-muted text-muted-foreground", label: `Deadline ${formatDate(deadline)}` };
}

export function JobApplicationItem({ jobApplication }: { jobApplication: JobApplication }) {
  const [expanded, setExpanded] = useState(false);
  const updateMutation = useUpdateJobApplication();
  const deleteMutation = useDeleteJobApplication();

  const accent = STATUS_ACCENT[jobApplication.status];
  const deadline = jobApplication.deadline ? deadlineMeta(jobApplication.deadline) : null;

  const handleStatusChange = async (status: string) => {
    try {
      await updateMutation.mutateAsync({
        id: jobApplication.id,
        payload: { status: status as JobApplication["status"] },
      });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update stage"));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(jobApplication.id);
      toast.success("Job application deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete job application"));
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:border-foreground/15 hover:shadow-sm">
      <span className={cn("absolute inset-y-0 left-0 w-1", accent.bar)} aria-hidden />

      <div className="flex items-start gap-3 py-3 pl-5 pr-3">
        <div
          className={cn(
            "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
            accent.tile,
          )}
          aria-hidden
        >
          {initials(jobApplication.companyName) || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate font-semibold leading-tight">{jobApplication.companyName}</h3>
                {jobApplication.jobUrl && (
                  <a
                    href={jobApplication.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Open job posting"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">{jobApplication.role}</p>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              <Select value={jobApplication.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-auto w-auto border-none bg-transparent p-0 shadow-none focus-visible:ring-0 [&>svg]:hidden">
                  <Badge
                    variant="outline"
                    className={cn("cursor-pointer font-medium", STATUS_BADGE_CLASS[jobApplication.status])}
                  >
                    <SelectValue />
                  </Badge>
                </SelectTrigger>
                <SelectContent align="end">
                  {STATUS_ORDER.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center opacity-60 transition-opacity group-hover:opacity-100">
                <JobApplicationFormDialog
                  jobApplication={jobApplication}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      aria-label="Edit"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  }
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this job application?</AlertDialogTitle>
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
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {jobApplication.status === "NOT_APPLIED" ? "Saved" : "Applied"}{" "}
              {formatDate(jobApplication.appliedDate)}
            </span>
            {deadline && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium",
                  deadline.tone,
                )}
              >
                <AlarmClock className="size-3.5" />
                {deadline.label}
              </span>
            )}
          </div>

          {jobApplication.description && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
                {expanded ? "Hide job post" : "Show job post"}
              </button>
              {expanded && (
                <p className="mt-1.5 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
                  {jobApplication.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
