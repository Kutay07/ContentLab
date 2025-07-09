import fs from "fs";
import path from "path";
import { AppConfig } from "./apps";

export const APPS_DIR = path.join(process.cwd(), "src", "config", "apps");

/** JSON dosyalarından tüm uygulama konfigürasyonlarını yükler. */
export function loadAppConfigs(): AppConfig[] {
  try {
    if (!fs.existsSync(APPS_DIR)) return [];
    const files = fs.readdirSync(APPS_DIR).filter((f) => f.endsWith(".json"));
    return files.map((file) => {
      const filePath = path.join(APPS_DIR, file);
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as AppConfig;
    });
  } catch (err) {
    console.error("App config load error:", err);
    return [];
  }
}

/** Belirli ID için konfig yükler. */
export function loadAppConfig(id: string): AppConfig | undefined {
  const filePath = path.join(APPS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return undefined;
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as AppConfig;
  } catch (err) {
    console.error("App config read error:", err);
    return undefined;
  }
}
