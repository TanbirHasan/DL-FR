"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateDocument, useUpdateDocument } from "@/hooks/use-documents";
import { extractErrorMessage } from "@/lib/api/client";
import type { DocumentRecord } from "@/lib/types";

const documentSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  type: z.enum(["PASSPORT", "NID", "INSURANCE", "WARRANTY", "LICENSE", "CERTIFICATE", "OTHER"]),
  identifier: z.string().max(150).optional(),
  issuer: z.string().max(150).optional(),
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  reminderDate: z.string().optional(),
  storageLocation: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

type DocumentForm = z.infer<typeof documentSchema>;

function toDateInputValue(iso: string | null) {
  return iso ? new Date(iso).toISOString().slice(0, 10) : "";
}

function optionalDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : undefined;
}

export function DocumentDialog({
  document,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  document?: DocumentRecord;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const isEdit = Boolean(document);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentForm>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: document?.title ?? "",
      type: document?.type ?? "PASSPORT",
      identifier: document?.identifier ?? "",
      issuer: document?.issuer ?? "",
      issuedAt: toDateInputValue(document?.issuedAt ?? null),
      expiresAt: toDateInputValue(document?.expiresAt ?? null),
      reminderDate: toDateInputValue(document?.reminderDate ?? null),
      storageLocation: document?.storageLocation ?? "",
      notes: document?.notes ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: document?.title ?? "",
        type: document?.type ?? "PASSPORT",
        identifier: document?.identifier ?? "",
        issuer: document?.issuer ?? "",
        issuedAt: toDateInputValue(document?.issuedAt ?? null),
        expiresAt: toDateInputValue(document?.expiresAt ?? null),
        reminderDate: toDateInputValue(document?.reminderDate ?? null),
        storageLocation: document?.storageLocation ?? "",
        notes: document?.notes ?? "",
      });
    }
  }, [document, open, reset]);

  const onSubmit = async (values: DocumentForm) => {
    try {
      const payload = {
        title: values.title,
        type: values.type,
        identifier: values.identifier || undefined,
        issuer: values.issuer || undefined,
        issuedAt: optionalDate(values.issuedAt),
        expiresAt: optionalDate(values.expiresAt),
        reminderDate: optionalDate(values.reminderDate),
        storageLocation: values.storageLocation || undefined,
        notes: values.notes || undefined,
      };
      if (isEdit && document) {
        await updateDocument.mutateAsync({ id: document.id, payload });
        toast.success("Document updated");
      } else {
        await createDocument.mutateAsync(payload);
        toast.success("Document saved");
      }
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save document"));
    }
  };

  const isSubmitting = createDocument.isPending || updateDocument.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit document" : "New document"}</DialogTitle>
          <DialogDescription>Store important document metadata, dates, reminders, and locations.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="doc-title">Title</Label>
              <Input id="doc-title" placeholder="Passport" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASSPORT">Passport</SelectItem>
                      <SelectItem value="NID">NID</SelectItem>
                      <SelectItem value="INSURANCE">Insurance</SelectItem>
                      <SelectItem value="WARRANTY">Warranty</SelectItem>
                      <SelectItem value="LICENSE">License</SelectItem>
                      <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="identifier">Identifier</Label>
              <Input id="identifier" placeholder="Document number" {...register("identifier")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer</Label>
              <Input id="issuer" placeholder="Issuing authority" {...register("issuer")} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="issuedAt">Issued</Label>
              <Input id="issuedAt" type="date" {...register("issuedAt")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires</Label>
              <Input id="expiresAt" type="date" {...register("expiresAt")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminderDate">Reminder</Label>
              <Input id="reminderDate" type="date" {...register("reminderDate")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="storageLocation">Storage location</Label>
            <Input id="storageLocation" placeholder="Locker, drawer, cloud folder" {...register("storageLocation")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-notes">Notes</Label>
            <Textarea id="doc-notes" rows={3} {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Save document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
