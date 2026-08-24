"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useExpenseSummary } from "@/hooks/use-expenses";
import { useReminders } from "@/hooks/use-reminders";
import { useShoppingLists } from "@/hooks/use-shopping-lists";
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

  const upcomingReminders = reminders?.slice(0, 4) ?? [];
  const activeListsCount = lists?.length ?? 0;
  const pendingItemsCount =
    lists?.reduce((sum, list) => sum + list.items.filter((i) => !i.isChecked).length, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">Here&apos;s an overview of your daily life.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This month&apos;s spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-semibold">{formatCurrency(summary?.total ?? 0)}</p>
            )}
            <Link href="/dashboard/expenses" className="text-xs text-muted-foreground underline underline-offset-4">
              View expenses
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Shopping lists
            </CardTitle>
          </CardHeader>
          <CardContent>
            {listsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-semibold">{activeListsCount}</p>
            )}
            <p className="text-xs text-muted-foreground">{pendingItemsCount} items left to buy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {remindersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-semibold">{reminders?.length ?? 0}</p>
            )}
            <Link href="/dashboard/reminders" className="text-xs text-muted-foreground underline underline-offset-4">
              View reminders
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top categories this month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summaryLoading && <Skeleton className="h-20 w-full" />}
            {!summaryLoading && summary?.byCategory.length === 0 && (
              <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
            )}
            {!summaryLoading &&
              summary?.byCategory.slice(0, 5).map((entry) => (
                <div key={entry.categoryId} className="flex items-center justify-between text-sm">
                  <span>{entry.categoryName}</span>
                  <span className="font-medium">{formatCurrency(entry.total)}</span>
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
                  <Badge variant="outline">{reminder.type === "CALL" ? "Call" : "Task"}</Badge>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
