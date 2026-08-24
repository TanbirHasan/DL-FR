"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DocumentDialog } from "./document-dialog";
import { useDeleteDocument } from "@/hooks/use-documents";
import { extractErrorMessage } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import type { DocumentRecord } from "@/lib/types";

const typeLabels: Record<string, string> = {
  PASSPORT: "Passport",
  NID: "NID",
  INSURANCE: "Insurance",
  WARRANTY: "Warranty",
  LICENSE: "License",
  CERTIFICATE: "Certificate",
  OTHER: "Other",
};

function expiryBadge(document: DocumentRecord) {
  if (!document.expiresAt) return null;
  const now = new Date();
  const expires = new Date(document.expiresAt);
  const days = Math.ceil((expires.getTime() - now.getTime()) / 86_400_000);
  if (days < 0) return <Badge variant="destructive">Expired</Badge>;
  if (days <= 60) return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Expires soon</Badge>;
  return <Badge variant="secondary">Active</Badge>;
}

export function DocumentCard({ document }: { document: DocumentRecord }) {
  const [editing, setEditing] = useState(false);
  const deleteDocument = useDeleteDocument();

  const handleDelete = async () => {
    try {
      await deleteDocument.mutateAsync(document.id);
      toast.success("Document deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete document"));
    }
  };

  return (
    <Card>
      <DocumentDialog document={document} open={editing} onOpenChange={setEditing} />
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <FileText className="size-5" />
          </span>
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate text-lg font-bold">{document.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-background/70">{typeLabels[document.type]}</Badge>
              {expiryBadge(document)}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this document?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {document.identifier && <p><span className="font-semibold text-foreground">ID:</span> {document.identifier}</p>}
        {document.issuer && <p><span className="font-semibold text-foreground">Issuer:</span> {document.issuer}</p>}
        {document.issuedAt && <p><span className="font-semibold text-foreground">Issued:</span> {formatDate(document.issuedAt)}</p>}
        {document.expiresAt && <p><span className="font-semibold text-foreground">Expires:</span> {formatDate(document.expiresAt)}</p>}
        {document.reminderDate && <p><span className="font-semibold text-foreground">Reminder:</span> {formatDate(document.reminderDate)}</p>}
        {document.storageLocation && <p><span className="font-semibold text-foreground">Stored:</span> {document.storageLocation}</p>}
        {document.notes && <p className="pt-1">{document.notes}</p>}
      </CardContent>
    </Card>
  );
}
