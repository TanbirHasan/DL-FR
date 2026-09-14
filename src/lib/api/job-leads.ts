import { apiClient } from "./client";
import type {
  CaptureJobLeadPayload,
  JobLead,
  JobLeadStatus,
  JobLeadSummary,
  PromoteJobLeadPayload,
} from "@/lib/types";

export async function captureJobLead(payload: CaptureJobLeadPayload) {
  const { data } = await apiClient.post<JobLead>("/job-leads", payload);
  return data;
}

export async function getJobLeads(status?: JobLeadStatus) {
  const { data } = await apiClient.get<JobLead[]>("/job-leads", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function getJobLeadSummary() {
  const { data } = await apiClient.get<JobLeadSummary>("/job-leads/summary");
  return data;
}

export async function retryJobLead(id: string) {
  const { data } = await apiClient.post<JobLead>(`/job-leads/${id}/retry`);
  return data;
}

export async function dismissJobLead(id: string) {
  const { data } = await apiClient.patch<JobLead>(`/job-leads/${id}/dismiss`);
  return data;
}

export async function restoreJobLead(id: string) {
  const { data } = await apiClient.patch<JobLead>(`/job-leads/${id}/restore`);
  return data;
}

export async function deleteJobLead(id: string) {
  await apiClient.delete(`/job-leads/${id}`);
}

export async function promoteJobLead(id: string, payload: PromoteJobLeadPayload) {
  const { data } = await apiClient.post<JobLead>(`/job-leads/${id}/promote`, payload);
  return data;
}
