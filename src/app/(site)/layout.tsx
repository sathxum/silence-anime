import type { ReactNode } from "react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { PopupQueue } from "@/components/site/popup-queue";
import { getDisclaimersByPlacement } from "@/services/content.service";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const footerDisclaimers = await getDisclaimersByPlacement("site");
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer disclaimers={footerDisclaimers} />
      <PopupQueue />
    </>
  );
}
