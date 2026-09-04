"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobApplicationFormDialog } from "@/components/job-applications/job-application-form-dialog";
import { JobApplicationItem } from "@/components/job-applications/job-application-item";
import { JobApplicationSummaryCards } from "@/components/job-applications/job-application-summary-cards";
import { STATUS_LABEL, STATUS_ORDER } from "@/components/job-applications/status";
import { useJobApplicationSummary, useJobApplications } from "@/hooks/use-job-applications";
import type { JobApplicationStatus } from "@/lib/types";

export default function JobApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<JobApplicationStatus | "all">("all");
  const { data: jobApplications, isLoading } = useJobApplications(
    statusFilter === "all" ? {} : { status: statusFilter }
  );
  const { data: summary, isLoading: summaryLoading } = useJobApplicationSummary();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm shadow-slate-900/5">
        <div>
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <p className="mt-1 text-muted-foreground">
            Paste a job post, tag it with a company and role, and track which stage it&apos;s at.
          </p>
        </div>
        <JobApplicationFormDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Log application
            </Button>
          }
        />
      </div>

      <JobApplicationSummaryCards summary={summary} isLoading={summaryLoading} />

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          {STATUS_ORDER.map((status) => (
            <TabsTrigger key={status} value={status}>
              {STATUS_LABEL[status]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {!isLoading && jobApplications?.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-card/70 p-10 text-center text-sm text-muted-foreground">
          {statusFilter === "all"
            ? "No job applications logged yet."
            : `No applications at "${STATUS_LABEL[statusFilter]}" stage.`}
        </div>
      )}

      {!isLoading && jobApplications && jobApplications.length > 0 && (
        <div className="space-y-2">
          {jobApplications.map((jobApplication) => (
            <JobApplicationItem key={jobApplication.id} jobApplication={jobApplication} />
          ))}
        </div>
      )}
    </div>
  );
}
