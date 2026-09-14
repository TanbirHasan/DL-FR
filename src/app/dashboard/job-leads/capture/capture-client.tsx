"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCaptureJobLead } from "@/hooks/use-job-leads";
import { extractErrorMessage } from "@/lib/api/client";
import type { JobLead } from "@/lib/types";

const AUTO_CLOSE_MS = 3500;

function ResultCard({ lead, onClose }: { lead: JobLead; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => window.close(), AUTO_CLOSE_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-5" />
          <CardTitle className="text-base font-bold">Saved to Job Leads</CardTitle>
        </div>
        {lead.isJobPost === false && (
          <CardDescription>
            Heads up — this didn&apos;t look like a job post. It&apos;s saved anyway; dismiss it
            from the list if it&apos;s not relevant.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-semibold">{lead.title ?? "Untitled post"}</p>
          <p className="text-sm text-muted-foreground">
            {[lead.companyName, lead.location].filter(Boolean).join(" · ") || "No details extracted"}
          </p>
        </div>
        {lead.relevance && <Badge variant="outline">{lead.relevance} relevance</Badge>}
        {lead.summary && <p className="text-sm text-muted-foreground">{lead.summary}</p>}
        <div className="flex items-center gap-2 pt-2">
          <Button asChild size="sm">
            <Link href="/dashboard/job-leads">View Job Leads</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="size-4" />
            Close tab
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">This tab closes itself in a few seconds.</p>
      </CardContent>
    </Card>
  );
}

function ManualCapture() {
  const [text, setText] = useState("");
  const captureLead = useCaptureJobLead();
  const [saved, setSaved] = useState<JobLead | null>(null);

  const submit = async () => {
    if (text.trim().length < 10) {
      toast.error("Paste a bit more of the post");
      return;
    }
    try {
      const lead = await captureLead.mutateAsync({ rawText: text.trim() });
      setSaved(lead);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save this lead"));
    }
  };

  if (saved) return <ResultCard lead={saved} onClose={() => window.close()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-bold">Add a job lead</CardTitle>
        <CardDescription>
          Opened without the bookmarklet — paste the post text manually instead.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          rows={8}
          placeholder="Paste the job post text here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button onClick={submit} disabled={captureLead.isPending}>
          {captureLead.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save lead"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function CaptureClient() {
  const searchParams = useSearchParams();
  const text = searchParams.get("text");
  const sourceUrl = searchParams.get("src") ?? undefined;

  const captureLead = useCaptureJobLead();
  const firedRef = useRef(false);
  const [result, setResult] = useState<JobLead | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!text || firedRef.current) return;
    firedRef.current = true;
    captureLead
      .mutateAsync({ rawText: text, sourceUrl })
      .then(setResult)
      .catch((err) => setError(extractErrorMessage(err, "Could not save this lead")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  if (!text) return <ManualCapture />;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-destructive">
            Couldn&apos;t save this lead
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/job-leads">Go to Job Leads</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (result) return <ResultCard lead={result} onClose={() => window.close()} />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          <CardTitle className="text-base font-bold">Saving and analyzing…</CardTitle>
        </div>
        <CardDescription>Reading the captured text with AI to pull out the details.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          {text}
        </p>
      </CardContent>
    </Card>
  );
}
