"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkletCard } from "@/components/job-leads/bookmarklet-card";
import { JobLeadCard } from "@/components/job-leads/job-lead-card";
import { useJobLeadSummary, useJobLeads } from "@/hooks/use-job-leads";
import type { JobLeadStatus } from "@/lib/types";

const TABS: { value: JobLeadStatus | "all"; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "PROMOTED", label: "Promoted" },
  { value: "DISMISSED", label: "Dismissed" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "all", label: "All" },
];

export default function JobLeadsPage() {
  const [statusFilter, setStatusFilter] = useState<JobLeadStatus | "all">("NEW");
  const { data: leads, isLoading } = useJobLeads(statusFilter === "all" ? undefined : statusFilter);
  const { data: summary } = useJobLeadSummary();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm shadow-slate-900/5">
        <div>
          <h1 className="text-3xl font-bold">Job Leads</h1>
          <p className="mt-1 text-muted-foreground">
            Capture job posts from anywhere without opening the feed. AI sorts the real ones from
            the noise — promote what&apos;s worth applying to.
          </p>
        </div>
      </div>

      <BookmarkletCard />

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
        <TabsList className="flex-wrap">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              {tab.value !== "all" && summary && ` (${summary.byStatus[tab.value]})`}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}

      {!isLoading && (leads?.length ?? 0) === 0 && (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          <Inbox className="mx-auto mb-2 size-6 text-muted-foreground/60" />
          {statusFilter === "NEW"
            ? "No new leads yet — use the bookmarklet above next time you check a group."
            : "Nothing here."}
        </div>
      )}

      {!isLoading && (leads?.length ?? 0) > 0 && (
        <div className="space-y-2">
          {leads!.map((lead) => (
            <JobLeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
