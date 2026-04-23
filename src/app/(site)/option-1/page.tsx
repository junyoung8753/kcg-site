import type { Metadata } from "next";
import { FinalHome } from "@/components/home/final-home";

export const metadata: Metadata = {
  title: "비교안 1",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OptionOnePage() {
  return (
    <FinalHome
      lineupVariant="version1"
      lineupTitle="한국센터금거래소 시세표"
    />
  );
}
