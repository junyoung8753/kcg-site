import type { ReactNode } from "react";
import { InquiryAssistantWidget } from "@/components/inquiry/inquiry-assistant-widget";
import { MobileContactBar } from "@/components/layout/mobile-contact-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <InquiryAssistantWidget />
      <MobileContactBar />
    </div>
  );
}
