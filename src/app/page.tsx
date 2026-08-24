"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { isAuthenticated, isInitializing } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Daily Life</h1>
        <p className="max-w-md text-muted-foreground">
          Expenses, shopping lists, and reminders — all in one place.
        </p>
      </div>
      {!isInitializing && (
        <div className="flex gap-3">
          {isAuthenticated ? (
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
