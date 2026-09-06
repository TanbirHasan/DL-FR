"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  Send,
  Sparkles,
  Square,
  Tag,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { streamAssistant } from "@/lib/api/assistant";
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
  answer: string;
  context?: AssistantContext;
  streaming: boolean;
  error?: string;
  aborted?: boolean;
}

/** Minimal inline formatter: **bold**, `- ` bullet lines, blank-line paragraphs. */
function renderRich(text: string): ReactNode {
  const renderInline = (s: string, keyBase: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={`${keyBase}-${i}`} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={`${keyBase}-${i}`}>{part}</span>
      ),
    );

  const blocks = text.trim().split(/\n{2,}/);
  return blocks.map((block, bi) => {
    const lines = block.split("\n");
    const isList = lines.every((l) => /^\s*[-*]\s+/.test(l));
    if (isList) {
      return (
        <ul key={bi} className="my-1 ml-4 list-disc space-y-1 marker:text-muted-foreground">
          {lines.map((l, li) => (
            <li key={li}>{renderInline(l.replace(/^\s*[-*]\s+/, ""), `${bi}-${li}`)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={bi} className={cn(bi > 0 && "mt-2")}>
        {lines.map((l, li) => (
          <span key={li}>
            {li > 0 && <br />}
            {renderInline(l, `${bi}-${li}`)}
          </span>
        ))}
      </p>
    );
  });
}

function NumbersStrip({ context }: { context: AssistantContext }) {
  const { thisMonth, monthOverMonth, topCategoryThisMonth } = context;
  const delta = monthOverMonth.changeAmount;
  const up = delta > 0;

  const chip = "inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-[11px] font-medium";

  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      <span className={chip}>
        <Wallet className="size-3 text-muted-foreground" />
        {thisMonth.label.split(" ")[0]}: <span className="text-foreground">{formatCurrency(thisMonth.total)}</span>
      </span>
      {delta !== 0 && (
        <span
          className={cn(
            chip,
            up ? "text-destructive" : "text-emerald-600 dark:text-emerald-400",
          )}
        >
          {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {up ? "+" : "−"}
          {formatCurrency(Math.abs(delta))}
        </span>
      )}
      {context.thisMonth.income > 0 && (
        <span
          className={cn(
            chip,
            context.thisMonth.net >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive",
          )}
        >
          <PiggyBank className="size-3" />
          Net {context.thisMonth.net >= 0 ? "+" : "−"}
          {formatCurrency(Math.abs(context.thisMonth.net))}
        </span>
      )}
      {topCategoryThisMonth && (
        <span className={chip}>
          <Tag className="size-3 text-muted-foreground" />
          {topCategoryThisMonth.categoryName}
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
  const [streaming, setStreaming] = useState(false);

  const nextId = useRef(1);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const atCurrentMonth =
    year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);

  const scrollToEnd = useCallback((smooth = false) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    if (open) {
      scrollToEnd();
      inputRef.current?.focus();
    }
  }, [open, turns.length, scrollToEnd]);

  const shiftMonth = (delta: number) => {
    const zeroBased = month - 1 + delta;
    setYear((y) => y + Math.floor(zeroBased / 12));
    setMonth((((zeroBased % 12) + 12) % 12) + 1);
  };

  const updateTurn = (id: number, patch: (t: Turn) => Turn) =>
    setTurns((prev) => prev.map((t) => (t.id === id ? patch(t) : t)));

  const submit = async (raw: string) => {
    const question = raw.trim();
    if (!question || streaming) return;

    const id = nextId.current++;
    setTurns((prev) => [...prev, { id, question, answer: "", streaming: true }]);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamAssistant(
        { question, month, year },
        {
          signal: controller.signal,
          onContext: (context) => updateTurn(id, (t) => ({ ...t, context })),
          onDelta: (text) => {
            updateTurn(id, (t) => ({ ...t, answer: t.answer + text }));
            requestAnimationFrame(() => scrollToEnd());
          },
        },
      );
      updateTurn(id, (t) => ({ ...t, streaming: false }));
    } catch (err) {
      if (controller.signal.aborted) {
        updateTurn(id, (t) => ({ ...t, streaming: false, aborted: true }));
      } else {
        const message = err instanceof Error ? err.message : "Couldn't get an answer";
        updateTurn(id, (t) => ({ ...t, streaming: false, error: message }));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      requestAnimationFrame(() => scrollToEnd(true));
    }
  };

  const stop = () => abortRef.current?.abort();

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close spending assistant" : "Open spending assistant"}
        className={cn(
          "group fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full",
          "bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-black/5",
          "transition-transform duration-200 hover:scale-105 active:scale-95",
        )}
      >
        <span className="absolute inset-0 rounded-full bg-primary/40 blur-md transition-opacity group-hover:opacity-80" />
        <span className="relative">
          {open ? <X className="size-6" /> : <Sparkles className="size-6" />}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Spending assistant"
          className={cn(
            "fixed bottom-24 right-5 z-50 flex w-[380px] max-w-[calc(100vw-2.5rem)] flex-col",
            "h-[560px] max-h-[calc(100vh-8rem)] overflow-hidden rounded-3xl border bg-card shadow-2xl ring-1 ring-black/5",
            "animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-200",
          )}
        >
          {/* Header */}
          <div className="relative border-b bg-gradient-to-br from-primary/10 via-card to-card px-4 pb-3 pt-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-black/5">
                  <Sparkles className="size-4.5" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">Spending Assistant</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Powered by Gemini
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-1 -mt-1 size-7 text-muted-foreground"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="mt-2.5 flex items-center justify-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-foreground"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="min-w-[7.5rem] rounded-full bg-background/70 px-3 py-1 text-center text-xs font-medium tabular-nums ring-1 ring-border">
                {MONTH_NAMES[month - 1]} {year}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-foreground disabled:opacity-30"
                onClick={() => shiftMonth(1)}
                disabled={atCurrentMonth}
                aria-label="Next month"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Transcript */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-muted/30 px-3.5 py-4">
            {turns.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-2 text-center">
                <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="size-6" />
                </span>
                <p className="text-sm font-semibold">Ask about your spending</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Answers use your totals and categories for{" "}
                  <span className="font-medium text-foreground">
                    {MONTH_NAMES[month - 1]} {year}
                  </span>
                  . Individual notes and shops stay private.
                </p>
                <div className="mt-4 w-full space-y-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="group flex w-full items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2 text-left text-xs transition-colors hover:border-primary/40 hover:bg-accent"
                    >
                      <span>{s}</span>
                      <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              turns.map((turn) => (
                <div key={turn.id} className="space-y-2.5">
                  <div className="flex justify-end">
                    <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-[13px] leading-relaxed text-primary-foreground shadow-sm">
                      {turn.question}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Sparkles className="size-3.5" />
                    </span>
                    <div className="min-w-0 max-w-[calc(100%-2rem)] rounded-2xl rounded-bl-md border bg-card px-3.5 py-2.5 shadow-sm">
                      {turn.error ? (
                        <p className="text-[13px] text-destructive">{turn.error}</p>
                      ) : turn.answer ? (
                        <div className="text-[13px] leading-relaxed text-foreground">
                          {renderRich(turn.answer)}
                          {turn.streaming && (
                            <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-primary/70" />
                          )}
                          {turn.aborted && (
                            <span className="ml-1 text-[11px] text-muted-foreground">(stopped)</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-1 py-0.5">
                          <Dot /> <Dot delay="0.15s" /> <Dot delay="0.3s" />
                        </div>
                      )}
                      {turn.context && !turn.error && <NumbersStrip context={turn.context} />}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Composer */}
          <div className="border-t bg-card p-2.5">
            <form
              className="flex items-center gap-1.5 rounded-full border bg-background py-1 pl-3.5 pr-1 transition-shadow focus-within:ring-2 focus-within:ring-ring/40"
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your spending…"
                className="min-w-0 flex-1 bg-transparent py-1.5 text-[13px] outline-none placeholder:text-muted-foreground"
              />
              {streaming ? (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="size-8 shrink-0 rounded-full"
                  onClick={stop}
                  aria-label="Stop"
                >
                  <Square className="size-3.5 fill-current" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  className="size-8 shrink-0 rounded-full"
                  disabled={!input.trim()}
                  aria-label="Send"
                >
                  <Send className="size-4" />
                </Button>
              )}
            </form>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
              Figures come from your data · wording is AI-generated
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Dot({ delay = "0s" }: { delay?: string }) {
  return (
    <span
      className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50"
      style={{ animationDelay: delay }}
    />
  );
}
