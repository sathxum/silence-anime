import { getAllPopups } from "@/services/content.service";
import { PopupManager } from "@/components/admin/popup-manager";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminPopupsPage() {
  const popups = await getAllPopups();
  return <PopupManager initialPopups={popups} />;
}
