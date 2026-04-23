import type { Metadata } from "next";
import { FinalHome } from "@/components/home/final-home";

export const metadata: Metadata = {
  title: "비교안 2",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OptionTwoPage() {
  return <FinalHome lineupVariant="version2" lineupTitle="시세 라인업" />;
}
