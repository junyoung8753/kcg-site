import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const purchaseRows = [
  {
    item: "순금·돌반지·순금 주얼리",
    standard: "고객이 팔 때 순금 매입 시세 기준",
    check: "각인 순도, 실중량, 보증서·케이스 보유 여부",
  },
  {
    item: "18K·14K 고금",
    standard: "함량별 매입 시세 기준",
    check: "큐빅·스톤·부속 분리 여부, 파손 및 납땜 상태",
  },
  {
    item: "골드바",
    standard: "제품 종류와 중량별 현장 기준",
    check: "브랜드, 중량, 포장 상태, 수량 확인",
  },
];

const extendedPurchaseRows = [
  {
    item: "백금·은 제품",
    standard: "백금·은 매입 시세 및 제품 상태 기준",
    check: "순도 표기, 산화·오염 상태, 실중량 확인",
  },
];

const buyingFlow = [
  ["01", "방문 상담", "품목과 예상 중량을 먼저 확인"],
  ["02", "품목 확인", "순금·18K·14K·백금·은 구분"],
  ["03", "함량·중량 확인", "부속과 제품 상태까지 함께 확인"],
  ["04", "매입가 안내", "당일 고시 시세 기준으로 안내"],
  ["05", "고객 결정", "조건 확인 후 진행 여부 결정"],
] as const;

export function PurchaseGuide({ showExtendedRows = false }: { showExtendedRows?: boolean }) {
  const rows = showExtendedRows ? [...purchaseRows, ...extendedPurchaseRows] : purchaseRows;

  return (
    <section className="border-y border-[#dfe7e5] bg-[#fbfdfc]">
      <div className="section-shell py-12 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="kcg-eyebrow text-[#9a8a00]">고금매입 안내</p>
            <h2 className="kcg-section-title mt-3 max-w-2xl text-[#15191b]">
              고객이 팔 때 기준을 먼저 확인하고 상담하실 수 있습니다.
            </h2>
            <p className="kcg-body-copy mt-5 max-w-2xl text-[#687171]">
              순금, 18K, 14K, 백금, 은 제품은 같은 금액으로 일괄 처리하지 않습니다. 시세표의 매입 기준을
              참고한 뒤 실물의 순도와 중량을 현장에서 확인합니다.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/prices"
                className="kcg-action-token inline-flex h-12 items-center justify-center rounded-full bg-[#ffcc00] px-6 text-sm font-bold text-[#171717] shadow-[0_14px_32px_rgba(255,204,0,0.22)]"
              >
                시세표 보기
              </Link>
              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="kcg-action-token inline-flex h-12 items-center justify-center rounded-full border border-[#d8dfdc] bg-white px-6 text-sm font-semibold text-[#171717]"
              >
                전화 문의 {siteConfig.contact.phone}
              </a>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="overflow-hidden border border-[#202426] bg-[#111416] text-white">
              <div className="min-h-[13rem] bg-[#202426] p-5">
                <p className="kcg-fine-label text-[#ffcc00]">OLD GOLD FLOW</p>
                <p className="mt-4 max-w-md text-xl font-black leading-tight tracking-[-0.022em]">
                  품목, 중량, 고시 기준, 현장 확인 순서로 안내합니다.
                </p>
                <p className="mt-4 max-w-md text-sm leading-6 text-white/64">
                  실제 매입 금액은 사진이 아니라 실물 확인과 회사 고시 시세 기준으로 최종 안내합니다.
                </p>
              </div>
              <div className="grid gap-px bg-white/10 sm:grid-cols-5">
                {buyingFlow.map(([number, title, body]) => (
                  <div key={title} className="bg-[#141719] px-4 py-4">
                    <p className="kcg-fine-label text-[#ffcc00]">{number}</p>
                    <p className="mt-2 text-sm font-bold tracking-[-0.022em]">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-white/68">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden border border-[#dfe6e4] bg-white">
              <div className="grid grid-cols-[0.92fr_0.9fr_1.18fr] bg-[#f7fbfa] px-5 py-3 text-xs font-bold tracking-[0.16em] text-[#697171]">
                <p>품목</p>
                <p>고객이 팔 때</p>
                <p>현장 확인</p>
              </div>
              {rows.map((row) => (
                <div
                  key={row.item}
                  className="grid gap-4 border-t border-[#e4ebe9] px-5 py-5 text-sm leading-6 text-[#687171] sm:grid-cols-[0.92fr_0.9fr_1.18fr]"
                >
                  <p className="font-bold tracking-[-0.022em] text-[#15191b]">{row.item}</p>
                  <p>{row.standard}</p>
                  <p>{row.check}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
