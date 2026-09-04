"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ExternalLink, Pencil, Trash2 } from "lucide-react";
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
import { cn, formatDate } from "@/lib/utils";
import type { JobApplication } from "@/lib/types";

export function JobApplicationItem({ jobApplication }: { jobApplication: JobApplication }) {
  const [expanded, setExpanded] = useState(false);
  const updateMutation = useUpdateJobApplication();
  const deleteMutation = useDeleteJobApplication();

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
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{jobApplication.companyName}</span>
            <span className="text-sm text-muted-foreground">{jobApplication.role}</span>
            {jobApplication.jobUrl && (
              <a
                href={jobApplication.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Applied {formatDate(jobApplication.appliedDate)}</p>
          {jobApplication.description && (
            <div>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className={cn("size-3 transition-transform", expanded && "rotate-180")} />
                {expanded ? "Hide details" : "Show details"}
              </button>
              {expanded && (
                <p className="mt-1 whitespace-pre-wrap rounded-md bg-background p-2 text-sm text-muted-foreground">
                  {jobApplication.description}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Select value={jobApplication.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-7 w-auto border-none bg-transparent px-0 shadow-none [&>svg]:hidden">
              <Badge variant="outline" className={cn(STATUS_BADGE_CLASS[jobApplication.status])}>
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
          <JobApplicationFormDialog
            jobApplication={jobApplication}
            trigger={
              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
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
  );
}
