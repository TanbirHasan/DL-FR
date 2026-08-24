import { apiClient } from "./client";
import type { PushSubscriptionPayload } from "@/lib/types";

export async function getVapidPublicKey() {
  const { data } = await apiClient.get<{ publicKey: string }>("/push/public-key");
  return data.publicKey;
}

export async function subscribeToPush(payload: PushSubscriptionPayload) {
  await apiClient.post("/push/subscribe", payload);
}

export async function unsubscribeFromPush(endpoint: string) {
  await apiClient.post("/push/unsubscribe", { endpoint });
}
