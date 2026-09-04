"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABEL, STATUS_ORDER } from "./status";
import { useCreateJobApplication, useUpdateJobApplication } from "@/hooks/use-job-applications";
import { extractErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { JobApplication } from "@/lib/types";

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(150),
  role: z.string().min(1, "Role is required").max(150),
  jobUrl: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  appliedDate: z.date(),
  status: z.enum(["APPLIED", "ASSESSMENT", "INTERVIEW", "OFFER", "REJECTED"]),
  description: z.string().max(10000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function JobApplicationFormDialog({
  jobApplication,
  trigger,
}: {
  jobApplication?: JobApplication;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateJobApplication();
  const updateMutation = useUpdateJobApplication();
  const isEdit = Boolean(jobApplication);

  const buildDefaults = (): FormValues => ({
    companyName: jobApplication?.companyName ?? "",
    role: jobApplication?.role ?? "",
    jobUrl: jobApplication?.jobUrl ?? "",
    appliedDate: jobApplication ? new Date(jobApplication.appliedDate) : new Date(),
    status: jobApplication?.status ?? "APPLIED",
    description: jobApplication?.description ?? "",
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaults(),
  });

  useEffect(() => {
    if (open) reset(buildDefaults());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, jobApplication, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        companyName: values.companyName,
        role: values.role,
        jobUrl: values.jobUrl || undefined,
        appliedDate: values.appliedDate.toISOString(),
        status: values.status,
        description: values.description || undefined,
      };
      if (isEdit && jobApplication) {
        await updateMutation.mutateAsync({ id: jobApplication.id, payload });
        toast.success("Job application updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Job application saved");
      }
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save job application"));
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit job application" : "Log a job application"}</DialogTitle>
          <DialogDescription>
            Paste the job post below — company, role, and stage are quick top-line fields so the
            list stays scannable.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company</Label>
              <Input id="companyName" placeholder="Acme Corp" {...register("companyName")} />
              {errors.companyName && (
                <p className="text-sm text-destructive">{errors.companyName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" placeholder="Senior Frontend Engineer" {...register("role")} />
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stage</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_ORDER.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABEL[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Applied on</Label>
              <Controller
                control={control}
                name="appliedDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="size-4" />
                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => date && field.onChange(date)}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobUrl">Job link (optional)</Label>
            <Input
              id="jobUrl"
              placeholder="https://linkedin.com/jobs/view/..."
              {...register("jobUrl")}
            />
            {errors.jobUrl && <p className="text-sm text-destructive">{errors.jobUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Paste the job post (optional)</Label>
            <Textarea
              id="description"
              placeholder="Paste the requirements, responsibilities, description..."
              className="min-h-32"
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
