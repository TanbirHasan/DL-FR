"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAskAssistant } from "@/hooks/use-assistant";
import { extractErrorMessage } from "@/lib/api/client";
import { cn, formatCurrency } from "@/lib/utils";
import type { AssistantContext } from "@/lib/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SUGGESTIONS = [
  "How much did I spend this month?",
  "Am I spending more than last month?",
  "Which category costs me the most?",
  "What was my biggest expense this month?",
];

interface Turn {
  id: number;
  question: string;
  answer?: string;
  error?: string;
  context?: AssistantContext;
  pending: boolean;
}

function NumbersStrip({ context }: { context: AssistantContext }) {
  const { thisMonth, monthOverMonth, topCategoryThisMonth } = context;
  const delta = monthOverMonth.changeAmount;
  const deltaLabel =
    delta === 0
      ? "same as last month"
      : `${delta > 0 ? "+" : "−"}${formatCurrency(Math.abs(delta))} vs last month`;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
      <span className="rounded-full bg-background px-2 py-0.5 ring-1 ring-border">
        {thisMonth.label}: <span className="font-medium text-foreground">{formatCurrency(thisMonth.total)}</span>
      </span>
      <span
        className={cn(
          "rounded-full bg-background px-2 py-0.5 ring-1 ring-border",
          delta > 0 && "text-destructive",
          delta < 0 && "text-emerald-600 dark:text-emerald-400",
        )}
      >
        {deltaLabel}
      </span>
      {topCategoryThisMonth && (
        <span className="rounded-full bg-background px-2 py-0.5 ring-1 ring-border">
          Top: <span className="font-medium text-foreground">{topCategoryThisMonth.categoryName}</span>{" "}
          {formatCurrency(topCategoryThisMonth.total)}
        </span>
      )}
    </div>
  );
}

export function ExpenseAssistant() {
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ask = useAskAssistant();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const shiftMonth = (delta: number) => {
    const zeroBased = month - 1 + delta;
    setYear((y) => y + Math.floor(zeroBased / 12));
    setMonth(((zeroBased % 12) + 12) % 12 + 1);
  };

  const submit = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || ask.isPending) return;
    const id = nextId.current++;
    setTurns((prev) => [...prev, { id, question: trimmed, pending: true }]);
    setInput("");

    ask.mutate(
      { question: trimmed, month, year },
      {
        onSuccess: (data) => {
          setTurns((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, pending: false, answer: data.answer, context: data.context } : t,
            ),
          );
        },
        onError: (err) => {
          setTurns((prev) =>
            prev.map((t) =>
              t.id === id
                ? { ...t, pending: false, error: extractErrorMessage(err, "Couldn't get an answer") }
                : t,
            ),
          );
        },
      },
    );
  };

  return (
    <>
      {/* Floating trigger */}
      <Button
        onClick={() => setOpen((v) => !v)}
        size="icon"
        className="fixed bottom-5 right-5 z-50 size-12 rounded-full shadow-lg shadow-primary/25"
        aria-label={open ? "Close spending assistant" : "Open spending assistant"}
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
      </Button>

      {open && (
        <div
          className="fixed bottom-20 right-5 z-50 flex h-[520px] max-h-[calc(100vh-7rem)] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl"
          role="dialog"
          aria-label="Spending assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Spending assistant</p>
                <p className="text-[11px] text-muted-foreground">Answers from your expense data</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="size-6" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="w-24 text-center text-[11px] font-medium tabular-nums">
                {MONTH_NAMES[month - 1].slice(0, 3)} {year}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={() => shiftMonth(1)}
                disabled={year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)}
                aria-label="Next month"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Transcript */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {turns.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Ask about your spending for <span className="font-medium text-foreground">{MONTH_NAMES[month - 1]} {year}</span>.
                  I only see totals and categories — not individual notes or shops.
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="rounded-lg border border-dashed px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {turns.map((turn) => (
              <div key={turn.id} className="space-y-2">
                <div className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-1.5 text-xs text-primary-foreground">
                    {turn.question}
                  </p>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
                    {turn.pending ? (
                      <p className="text-xs text-muted-foreground">Thinking…</p>
                    ) : turn.error ? (
                      <p className="text-xs text-destructive">{turn.error}</p>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">{turn.answer}</p>
                        {turn.context && <NumbersStrip context={turn.context} />}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form
            className="flex items-center gap-2 border-t px-3 py-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your spending…"
              className="h-9"
              disabled={ask.isPending}
            />
            <Button type="submit" size="icon" className="size-9 shrink-0" disabled={!input.trim() || ask.isPending}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
