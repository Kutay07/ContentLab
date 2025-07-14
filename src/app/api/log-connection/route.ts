import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { LogEntry } from "@/types/log";

// Logs klasörü proje kökünde tutulur
const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "connection-events.json");

/*
 GET  /api/log-connection
  - opsiyonel query: appId, event, limit (default 100)
 POST /api/log-connection
  - body: LogEntry
*/

const LogSchema = z.object({
  timestamp: z.number(),
  event: z.string(),
  user: z.string().optional(),
  appId: z.string().optional(),
  meta: z.record(z.any()).optional(),
});

export async function GET(request: Request) {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
    let logs: LogEntry[] = [];
    try {
      const data = await fs.readFile(LOG_FILE, "utf-8");
      logs = JSON.parse(data);
    } catch {
      // dosya yoksa boş dön
    }

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");
    const event = searchParams.get("event");
    const user = searchParams.get("user");
    const startStr = searchParams.get("start");
    const endStr = searchParams.get("end");
    const startTs = startStr ? Date.parse(startStr) : undefined;
    const endTs = endStr ? Date.parse(endStr) : undefined;
    const limit = Number(searchParams.get("limit")) || 100;

    let filtered = logs;
    if (appId) filtered = filtered.filter((l) => l.appId === appId);
    if (event) filtered = filtered.filter((l) => l.event === event);
    if (user) filtered = filtered.filter((l) => l.user === user);
    if (!Number.isNaN(startTs) && startTs) {
      filtered = filtered.filter((l) => l.timestamp >= startTs);
    }
    if (!Number.isNaN(endTs) && endTs) {
      filtered = filtered.filter((l) => l.timestamp <= endTs);
    }

    filtered = filtered.slice(-limit);
    return Response.json(filtered, { status: 200 });
  } catch (err) {
    console.error("GET /api/log-connection error", err);
    return Response.json({ error: "Log okunamadı" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Gövdeyi güvenli bir şekilde oku ve işle
    const rawBody = await request.text();
    if (!rawBody) {
      // Boş gövde gönderildiyse 400 Bad Request dön
      return Response.json(
        { error: "Boş isteğe veri gönderilmedi" },
        { status: 400 }
      );
    }

    let jsonBody: unknown;
    try {
      jsonBody = JSON.parse(rawBody);
    } catch {
      // JSON parse edilemedi
      return Response.json({ error: "Geçersiz JSON formatı" }, { status: 400 });
    }

    const parsed = LogSchema.parse(jsonBody) as LogEntry;

    await fs.mkdir(LOG_DIR, { recursive: true });
    let logs: LogEntry[] = [];
    try {
      const data = await fs.readFile(LOG_FILE, "utf-8");
      logs = JSON.parse(data);
    } catch {
      // dosya yoksa yeni oluşturulacak
    }

    logs.push(parsed);
    await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2));

    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/log-connection error", err);
    return Response.json({ error: "Log kaydedilemedi" }, { status: 500 });
  }
}
