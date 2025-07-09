import { LogEntry } from "@/types/log";

/** Fire-and-forget client logger */
export async function logEvent(entry: LogEntry) {
  try {
    await fetch("/api/log-connection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  } catch {
    // ignore
  }
}
