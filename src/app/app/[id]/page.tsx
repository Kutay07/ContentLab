import { loadAppConfig } from "@/config/apps.server";
import AppManagementClient from "./AppManagementClient";

// Next.js 15: params is artık Promise olarak geliyor. Asenkron fonksiyon kullanıp
// parametreleri resolve ediyoruz.
export default async function AppManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appConfig = loadAppConfig(id);
  return <AppManagementClient appId={id} initialApp={appConfig} />;
}
