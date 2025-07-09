import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { AppConfig } from "@/config/apps";
import { APPS_DIR } from "@/config/apps.server";

const SupabaseSchema = z.object({
  url: z.string().url(),
  anonKey: z.string().min(10),
  projectId: z.string().min(1),
});

const AppConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["active", "inactive", "development"]),
  supabase: SupabaseSchema,
  icon: z.string().min(1),
  color: z.string().min(1),
  createdAt: z.string(),
  lastUpdated: z.string(),
});

export async function GET() {
  try {
    await fs.mkdir(APPS_DIR, { recursive: true });
    const files = (await fs.readdir(APPS_DIR)).filter((f) =>
      f.endsWith(".json")
    );
    const apps: AppConfig[] = [];
    for (const file of files) {
      const content = await fs.readFile(path.join(APPS_DIR, file), "utf-8");
      apps.push(JSON.parse(content));
    }

    return Response.json(apps, { status: 200 });
  } catch (err) {
    console.error("GET /api/apps error", err);
    return Response.json({ error: "Liste alınamadı" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = AppConfigSchema.parse(body);
    await fs.mkdir(APPS_DIR, { recursive: true });
    const filePath = path.join(APPS_DIR, `${parsed.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(parsed, null, 2), "utf-8");
    return Response.json(parsed, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { error: "Geçersiz veri: " + err.message },
        { status: 400 }
      );
    }
    console.error("POST /api/apps error", err);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}
