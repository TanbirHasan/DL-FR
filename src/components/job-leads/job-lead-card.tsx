"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
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
import { PromoteLeadDialog } from "./promote-lead-dialog";
import {
  useDeleteJobLead,
  useDismissJobLead,
  useRestoreJobLead,
  useRetryJobLead,
} from "@/hooks/use-job-leads";
import { extractErrorMessage } from "@/lib/api/client";
import { cn, formatDateTime } from "@/lib/utils";
import type { JobLead, JobLeadRelevance } from "@/lib/types";

const RELEVANCE_META: Record<JobLeadRelevance, { bar: string; badge: string; label: string }> = {
  high: {
    bar: "bg-emerald-500",
    badge: "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400",
    label: "High relevance",
  },
  medium: {
    bar: "bg-amber-400",
    badge: "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400",
    label: "Medium relevance",
  },
  low: {
    bar: "bg-zinc-300 dark:bg-zinc-600",
    badge: "border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400",
    label: "Low relevance",
  },
};

export function JobLeadCard({ lead }: { lead: JobLead }) {
  const [expanded, setExpanded] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const dismiss = useDismissJobLead();
  const restore = useRestoreJobLead();
  const retry = useRetryJobLead();
  const remove = useDeleteJobLead();

  const relevance = lead.relevance ? RELEVANCE_META[lead.relevance] : null;
  const isPending = lead.processedAt === null && !lead.processingError;
  const notAJob = lead.isJobPost === false;

  const handleDismiss = async () => {
    try {
      await dismiss.mutateAsync(lead.id);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not dismiss this lead"));
    }
  };

  const handleRestore = async () => {
    try {
      await restore.mutateAsync(lead.id);
      toast.success("Moved back to New");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not restore this lead"));
    }
  };

  const handleRetry = async () => {
    try {
      await retry.mutateAsync(lead.id);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not re-analyze this lead"));
    }
  };

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(lead.id);
      toast.success("Lead deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete this lead"));
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:border-foreground/15 hover:shadow-sm">
      <span
        className={cn("absolute inset-y-0 left-0 w-1", relevance?.bar ?? "bg-muted-foreground/20")}
        aria-hidden
      />
      <PromoteLeadDialog lead={lead} open={promoting} onOpenChange={setPromoting} />

      <div className="space-y-2 py-3 pl-5 pr-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate font-semibold leading-tight">
                {lead.title ?? (isPending ? "Analyzing…" : "Untitled post")}
              </h3>
              {lead.sourceUrl && (
                <a
                  href={lead.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Open original post"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {[lead.companyName, lead.location].filter(Boolean).join(" · ") || " "}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
            {(lead.status === "DISMISSED" || lead.status === "ARCHIVED") && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                aria-label="Restore"
                onClick={handleRestore}
              >
                <Undo2 className="size-3.5" />
              </Button>
            )}
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
                  <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
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

        <div className="flex flex-wrap items-center gap-1.5">
          {relevance && (
            <Badge variant="outline" className={cn("font-medium", relevance.badge)}>
              {relevance.label}
            </Badge>
          )}
          {isPending && (
            <Badge variant="outline" className="gap-1 font-medium">
              <Sparkles className="size-3 animate-pulse" />
              Analyzing…
            </Badge>
          )}
          {notAJob && (
            <Badge variant="outline" className="gap-1 border-zinc-200 text-zinc-500 dark:border-zinc-700">
              <AlertTriangle className="size-3" />
              Doesn&apos;t look like a job post
            </Badge>
          )}
          {lead.deadline && (
            <Badge variant="outline">Deadline {formatDateTime(lead.deadline).split(",")[0]}</Badge>
          )}
          {lead.status === "PROMOTED" && (
            <Badge className="border-transparent bg-emerald-500/12 text-emerald-700 dark:text-emerald-300">
              Promoted
            </Badge>
          )}
          {lead.status === "DISMISSED" && <Badge variant="secondary">Dismissed</Badge>}
          {lead.status === "ARCHIVED" && <Badge variant="secondary">Archived (no action taken)</Badge>}
        </div>

        {lead.summary && <p className="text-sm text-muted-foreground">{lead.summary}</p>}

        {lead.processingError && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <span className="min-w-0 truncate">Couldn&apos;t analyze: {lead.processingError}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 shrink-0 gap-1 px-2 text-destructive hover:text-destructive"
              onClick={handleRetry}
              disabled={retry.isPending}
            >
              <RotateCcw className="size-3" />
              Retry
            </Button>
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
            {expanded ? "Hide raw post" : "Show raw post"}
          </button>
          {expanded && (
            <p className="mt-1.5 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
              {lead.rawText}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-xs text-muted-foreground">
            Captured {formatDateTime(lead.capturedAt)}
          </span>
          {lead.status === "NEW" && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDismiss} disabled={dismiss.isPending}>
                Dismiss
              </Button>
              <Button size="sm" onClick={() => setPromoting(true)}>
                Promote to application
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
