"use client";

import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Bookmark, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MAX_CAPTURE_CHARS = 4000;

function buildBookmarklet(origin: string) {
  const captureUrl = `${origin}/dashboard/job-leads/capture`;
  // Kept as a single expression so it can't be broken by an accidental
  // semicolon-insertion issue when pasted as a bookmark URL.
  const code = `(function(){var t=(window.getSelection?window.getSelection().toString():'').trim();if(!t){alert('Select the job post text first, then click this bookmarklet.');return;}if(t.length>${MAX_CAPTURE_CHARS})t=t.slice(0,${MAX_CAPTURE_CHARS});var u='${captureUrl}?text='+encodeURIComponent(t)+'&src='+encodeURIComponent(location.href);window.open(u,'_blank');})();`;
  return `javascript:${code}`;
}

export function BookmarkletCard() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const href = mounted ? buildBookmarklet(window.location.origin) : null;

  const copy = async () => {
    if (!href) return;
    try {
      await navigator.clipboard.writeText(href);
      toast.success("Copied — paste it as a bookmark's URL");
    } catch {
      toast.error("Couldn't copy — select and copy the text manually");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bookmark className="size-4 text-primary" />
          <CardTitle className="text-base font-bold">Save Job Lead bookmarklet</CardTitle>
        </div>
        <CardDescription>
          A bookmark, not an extension — nothing to install. Select a job post&apos;s text on
          Facebook, click this, and it lands here for AI triage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" className="cursor-grab active:cursor-grabbing">
            <a href={href ?? "#"} onClick={(e) => e.preventDefault()} draggable>
              <Bookmark className="size-4" />
              Save Job Lead
            </a>
          </Button>
          <p className="text-xs text-muted-foreground">
            Drag this button to your bookmarks bar.
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">
            Drag not working? Right-click your bookmarks bar → Add bookmark → name it anything →
            paste this as the URL:
          </p>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
            <code className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {href ?? "Loading…"}
            </code>
            <Button size="icon" variant="ghost" className="size-7 shrink-0" onClick={copy}>
              <Copy className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
