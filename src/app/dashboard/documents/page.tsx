"use client";

import { useState } from "react";
import { FileArchive, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentCard } from "@/components/documents/document-card";
import { DocumentDialog } from "@/components/documents/document-dialog";
import { useDocuments } from "@/hooks/use-documents";

export default function DocumentsPage() {
  const [expiringOnly, setExpiringOnly] = useState(false);
  const { data: documents, isLoading } = useDocuments(expiringOnly);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm shadow-slate-900/5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <FileArchive className="size-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold">Documents Vault</h1>
            <p className="mt-1 text-muted-foreground">Track IDs, insurance, warranties, certificates, expiry dates, and storage locations.</p>
          </div>
        </div>
        <DocumentDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              New document
            </Button>
          }
        />
      </div>

      <Tabs value={expiringOnly ? "expiring" : "all"} onValueChange={(v) => setExpiringOnly(v === "expiring")}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="expiring">Expiring soon</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      )}

      {!isLoading && documents?.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-card/70 p-10 text-center text-sm text-muted-foreground">
          {expiringOnly ? "No documents expiring soon." : "No documents saved yet."}
        </div>
      )}

      {!isLoading && documents && documents.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      )}
    </div>
  );
}
