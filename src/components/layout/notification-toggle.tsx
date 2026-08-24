"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, BellOff } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { extractErrorMessage } from "@/lib/api/client";
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushStatus,
  type PushSupportStatus,
} from "@/lib/push";

export function NotificationToggle() {
  const [status, setStatus] = useState<PushSupportStatus | "loading">("loading");

  useEffect(() => {
    getPushStatus()
      .then(setStatus)
      .catch(() => setStatus("unsupported"));
  }, []);

  const handleClick = async () => {
    if (status === "subscribed") {
      try {
        await disablePushNotifications();
        setStatus("unsubscribed");
        toast.success("Notifications disabled");
      } catch (err) {
        toast.error(extractErrorMessage(err, "Could not disable notifications"));
      }
      return;
    }

    if (status === "unsubscribed") {
      try {
        await enablePushNotifications();
        setStatus("subscribed");
        toast.success("Notifications enabled");
      } catch (err) {
        setStatus((await getPushStatus().catch(() => "unsubscribed")) as PushSupportStatus);
        toast.error(extractErrorMessage(err, "Could not enable notifications"));
      }
    }
  };

  if (status === "loading" || status === "unsupported") return null;

  if (status === "denied") {
    return (
      <SidebarMenuItem>
        <p className="px-2 py-1.5 text-xs text-muted-foreground">
          Notifications blocked — enable them in your browser settings.
        </p>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={handleClick} tooltip="Toggle notifications">
        {status === "subscribed" ? <Bell /> : <BellOff />}
        <span>{status === "subscribed" ? "Notifications on" : "Enable notifications"}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
