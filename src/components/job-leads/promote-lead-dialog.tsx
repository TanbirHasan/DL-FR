"use client";

import { useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePromoteJobLead } from "@/hooks/use-job-leads";
import { extractErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { JobLead } from "@/lib/types";

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(150),
  role: z.string().min(1, "Role is required").max(150),
  jobUrl: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  deadline: z.date().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function PromoteLeadDialog({
  lead,
  open,
  onOpenChange,
}: {
  lead: JobLead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const promote = usePromoteJobLead();

  const buildDefaults = (): FormValues => ({
    companyName: lead.companyName ?? "",
    role: lead.title ?? "",
    jobUrl: "",
    deadline: lead.deadline ? new Date(lead.deadline) : null,
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(formSchema), defaultValues: buildDefaults() });

  useEffect(() => {
    if (open) reset(buildDefaults());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await promote.mutateAsync({
        id: lead.id,
        payload: {
          companyName: values.companyName,
          role: values.role,
          jobUrl: values.jobUrl || undefined,
          deadline: values.deadline ? values.deadline.toISOString() : null,
        },
      });
      toast.success("Added to Job Applications");
      onOpenChange(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not promote this lead"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promote to Job Application</DialogTitle>
          <DialogDescription>
            Confirm the details below — this becomes a real entry in your Job Applications
            tracker (status: Not applied).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company</Label>
              <Input id="companyName" {...register("companyName")} />
              {errors.companyName && (
                <p className="text-sm text-destructive">{errors.companyName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" {...register("role")} />
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobUrl">Job URL (optional)</Label>
            <Input id="jobUrl" placeholder="https://…" {...register("jobUrl")} />
            {errors.jobUrl && <p className="text-sm text-destructive">{errors.jobUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Deadline (optional)</Label>
            <Controller
              control={control}
              name="deadline"
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
                      {field.value ? format(field.value, "PPP") : "N/A — no deadline"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ?? undefined}
                      onSelect={(date) => field.onChange(date ?? null)}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={promote.isPending}>
              {promote.isPending ? "Saving..." : "Promote"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
