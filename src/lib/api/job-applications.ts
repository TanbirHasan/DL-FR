import { apiClient } from "./client";
import type {
  CreateJobApplicationPayload,
  JobApplication,
  JobApplicationQuery,
  JobApplicationSummary,
  UpdateJobApplicationPayload,
} from "@/lib/types";

export async function getJobApplications(query: JobApplicationQuery = {}) {
  const { data } = await apiClient.get<JobApplication[]>("/job-applications", { params: query });
  return data;
}

export async function getJobApplicationSummary() {
  const { data } = await apiClient.get<JobApplicationSummary>("/job-applications/summary");
  return data;
}

export async function createJobApplication(payload: CreateJobApplicationPayload) {
  const { data } = await apiClient.post<JobApplication>("/job-applications", payload);
  return data;
}

export async function updateJobApplication(id: string, payload: UpdateJobApplicationPayload) {
  const { data } = await apiClient.patch<JobApplication>(`/job-applications/${id}`, payload);
  return data;
}

export async function deleteJobApplication(id: string) {
  await apiClient.delete(`/job-applications/${id}`);
}
