"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );


  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => setTheme(isDark ? "light" : "dark")}
        tooltip={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? <Sun /> : <Moon />}
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
