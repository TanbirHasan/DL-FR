"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  captureJobLead,
  deleteJobLead,
  dismissJobLead,
  getJobLeadSummary,
  getJobLeads,
  promoteJobLead,
  restoreJobLead,
  retryJobLead,
} from "@/lib/api/job-leads";
import type { CaptureJobLeadPayload, JobLeadStatus, PromoteJobLeadPayload } from "@/lib/types";

export function useJobLeads(status?: JobLeadStatus) {
  return useQuery({ queryKey: ["job-leads", status], queryFn: () => getJobLeads(status) });
}

export function useJobLeadSummary() {
  return useQuery({ queryKey: ["job-leads", "summary"], queryFn: getJobLeadSummary });
}

function useInvalidateJobLeads() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["job-leads"] });
    queryClient.invalidateQueries({ queryKey: ["job-applications"] });
    queryClient.invalidateQueries({ queryKey: ["agenda"] });
  };
}

export function useCaptureJobLead() {
  const invalidate = useInvalidateJobLeads();
  return useMutation({
    mutationFn: (payload: CaptureJobLeadPayload) => captureJobLead(payload),
    onSuccess: invalidate,
  });
}

export function useRetryJobLead() {
  const invalidate = useInvalidateJobLeads();
  return useMutation({ mutationFn: (id: string) => retryJobLead(id), onSuccess: invalidate });
}

export function useDismissJobLead() {
  const invalidate = useInvalidateJobLeads();
  return useMutation({ mutationFn: (id: string) => dismissJobLead(id), onSuccess: invalidate });
}

export function useRestoreJobLead() {
  const invalidate = useInvalidateJobLeads();
  return useMutation({ mutationFn: (id: string) => restoreJobLead(id), onSuccess: invalidate });
}

export function useDeleteJobLead() {
  const invalidate = useInvalidateJobLeads();
  return useMutation({ mutationFn: (id: string) => deleteJobLead(id), onSuccess: invalidate });
}

export function usePromoteJobLead() {
  const invalidate = useInvalidateJobLeads();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PromoteJobLeadPayload }) =>
      promoteJobLead(id, payload),
    onSuccess: invalidate,
  });
}
