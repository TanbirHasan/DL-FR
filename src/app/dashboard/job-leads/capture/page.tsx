import { Suspense } from "react";
import { CaptureClient } from "./capture-client";

export default function JobLeadCapturePage() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <CaptureClient />
      </Suspense>
    </div>
  );
}
