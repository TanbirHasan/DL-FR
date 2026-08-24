"use client";

import { BellRing, Receipt, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { isAuthenticated, isInitializing } = useAuth();

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6 text-center lg:text-left">
          <div className="space-y-3">
            <p className="mx-auto w-fit rounded-full border bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground lg:mx-0">
              Life admin, organized
            </p>
            <h1 className="text-4xl font-bold sm:text-5xl">Daily Life</h1>
            <p className="mx-auto max-w-xl text-base leading-7 text-muted-foreground lg:mx-0">
              Expenses, shopping lists, and reminders - all in one calm, practical dashboard.
            </p>
          </div>
          {!isInitializing && (
            <div className="flex justify-center gap-3 lg:justify-start">
              {isAuthenticated ? (
                <Button asChild size="lg">
                  <Link href="/dashboard">Go to dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-3 rounded-2xl border bg-card/85 p-4 shadow-xl shadow-slate-900/10">
          {[
            {
              icon: Receipt,
              title: "Monthly spending",
              value: "$1,248",
              tone: "bg-primary/10 text-primary",
            },
            {
              icon: ShoppingCart,
              title: "Groceries left",
              value: "12 items",
              tone: "bg-amber-100 text-amber-700",
            },
            {
              icon: BellRing,
              title: "Upcoming reminders",
              value: "4 today",
              tone: "bg-sky-100 text-sky-700",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-xl border bg-background/70 p-3"
            >
              <span className={`flex size-10 items-center justify-center rounded-lg ${item.tone}`}>
                <item.icon className="size-5" />
              </span>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                <p className="text-xl font-bold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
