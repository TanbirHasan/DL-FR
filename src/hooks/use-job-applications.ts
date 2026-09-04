"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createJobApplication,
  deleteJobApplication,
  getJobApplicationSummary,
  getJobApplications,
  updateJobApplication,
} from "@/lib/api/job-applications";
import type {
  CreateJobApplicationPayload,
  JobApplicationQuery,
  UpdateJobApplicationPayload,
} from "@/lib/types";

const jobApplicationsKey = (query: JobApplicationQuery) => ["job-applications", query] as const;
const jobApplicationSummaryKey = ["job-applications", "summary"] as const;

function invalidateJobApplications(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["job-applications"] });
}

export function useJobApplications(query: JobApplicationQuery = {}) {
  return useQuery({
    queryKey: jobApplicationsKey(query),
    queryFn: () => getJobApplications(query),
  });
}

export function useJobApplicationSummary() {
  return useQuery({ queryKey: jobApplicationSummaryKey, queryFn: getJobApplicationSummary });
}

export function useCreateJobApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateJobApplicationPayload) => createJobApplication(payload),
    onSuccess: () => invalidateJobApplications(queryClient),
  });
}

export function useUpdateJobApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateJobApplicationPayload }) =>
      updateJobApplication(id, payload),
    onSuccess: () => invalidateJobApplications(queryClient),
  });
}

export function useDeleteJobApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteJobApplication(id),
    onSuccess: () => invalidateJobApplications(queryClient),
  });
}
