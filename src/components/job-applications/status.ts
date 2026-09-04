import type { JobApplicationStatus } from "@/lib/types";

export const STATUS_ORDER: JobApplicationStatus[] = [
  "APPLIED",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
];

export const STATUS_LABEL: Record<JobApplicationStatus, string> = {
  APPLIED: "Applied",
  ASSESSMENT: "OA / Task",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

export const STATUS_BADGE_CLASS: Record<JobApplicationStatus, string> = {
  APPLIED: "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300",
  ASSESSMENT: "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400",
  INTERVIEW: "border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-400",
  OFFER: "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400",
  REJECTED: "border-rose-200 text-rose-700 dark:border-rose-800 dark:text-rose-400",
};
