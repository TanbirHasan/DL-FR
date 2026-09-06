"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { RequireAuth } from "@/components/guards/require-auth";
import { ExpenseAssistant } from "@/components/assistant/expense-assistant";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-transparent">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-xl">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col space-y-6 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
        <ExpenseAssistant />
      </SidebarProvider>
    </RequireAuth>
  );
}
