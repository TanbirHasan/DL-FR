"use client";

import Link from "next/link";
import { BellRing, BookOpen, FileArchive, HeartPulse, Receipt, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { NetSavingsCards } from "@/components/dashboard/net-savings-cards";
import { useAuth } from "@/hooks/use-auth";
import { useExpenseSummary } from "@/hooks/use-expenses";
import { useReminders } from "@/hooks/use-reminders";
import { useShoppingLists } from "@/hooks/use-shopping-lists";
import { useDocuments } from "@/hooks/use-documents";
import { useHealthReminders } from "@/hooks/use-health-reminders";
import { useJournalEntries } from "@/hooks/use-journal";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const now = new Date();
  const { data: summary, isLoading: summaryLoading } = useExpenseSummary(
    now.getFullYear(),
    now.getMonth() + 1
  );
  const { data: reminders, isLoading: remindersLoading } = useReminders(false);
  const { data: lists, isLoading: listsLoading } = useShoppingLists();
  const { data: journalEntries, isLoading: journalLoading } = useJournalEntries();
  const { data: healthReminders, isLoading: healthLoading } = useHealthReminders(false);
  const { data: documents, isLoading: documentsLoading } = useDocuments(true);

  const upcomingReminders = reminders?.slice(0, 4) ?? [];
  const activeListsCount = lists?.length ?? 0;
  const pendingItemsCount =
    lists?.reduce((sum, list) => sum + list.items.filter((i) => !i.isChecked).length, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card/85 p-5 shadow-sm shadow-slate-900/5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit bg-background/70">
              Today&apos;s control center
            </Badge>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
              <p className="mt-1 text-muted-foreground">
                Your spending, errands, and reminders at a glance.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/dashboard/expenses">Review month</Link>
          </Button>
        </div>
      </div>

      <NetSavingsCards year={now.getFullYear()} month={now.getMonth() + 1} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                This month&apos;s spend
              </CardTitle>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Receipt className="size-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-bold">{formatCurrency(summary?.total ?? 0)}</p>
            )}
            <Link href="/dashboard/expenses" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
              View expenses
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Shopping lists
              </CardTitle>
              <span className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <ShoppingCart className="size-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {listsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{activeListsCount}</p>
            )}
            <p className="text-xs text-muted-foreground">{pendingItemsCount} items left to buy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Upcoming reminders
              </CardTitle>
              <span className="flex size-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <BellRing className="size-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {remindersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{reminders?.length ?? 0}</p>
            )}
            <Link href="/dashboard/reminders" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
              View reminders
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Journal entries
              </CardTitle>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="size-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {journalLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{journalEntries?.length ?? 0}</p>}
            <Link href="/dashboard/journal" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
              Open journal
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Health reminders
              </CardTitle>
              <span className="flex size-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <HeartPulse className="size-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {healthLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{healthReminders?.length ?? 0}</p>}
            <Link href="/dashboard/health" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
              View health
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Documents expiring
              </CardTitle>
              <span className="flex size-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <FileArchive className="size-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {documentsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{documents?.length ?? 0}</p>}
            <Link href="/dashboard/documents" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
              Open vault
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <CardTitle className="text-base font-bold">Top categories this month</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {summaryLoading && <Skeleton className="h-20 w-full" />}
            {!summaryLoading && summary?.byCategory.length === 0 && (
              <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
            )}
            {!summaryLoading &&
              summary?.byCategory.slice(0, 5).map((entry) => (
                <div key={entry.categoryId} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                  <span className="font-medium">{entry.categoryName}</span>
                  <span className="font-bold">{formatCurrency(entry.total)}</span>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming reminders</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/reminders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {remindersLoading && <Skeleton className="h-20 w-full" />}
            {!remindersLoading && upcomingReminders.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing coming up.</p>
            )}
            {!remindersLoading &&
              upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{reminder.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(reminder.dueAt)}</p>
                  </div>
                  <Badge variant="outline" className="bg-background/70">
                    {reminder.type === "CALL" ? "Call" : "Task"}
                  </Badge>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
