import { getAllDisclaimers } from "@/services/content.service";
import { DisclaimerManager } from "@/components/admin/disclaimer-manager";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminDisclaimersPage() {
  const disclaimers = await getAllDisclaimers();
  return <DisclaimerManager initial={disclaimers} />;
}
