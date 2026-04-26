import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const consultationRows = [
  {
    purpose: "고금·주얼리 매입 상담",
    priceLine: "내가 팔 때 현장 기준",
    prepare: "신분증, 보증서·영수증, 제품 상태",
    confirm: "순도, 실중량, 큐빅·스톤·부속 여부를 현장에서 확인합니다.",
  },
  {
    purpose: "골드바·실버바 문의",
    priceLine: "품목·중량별 고시 기준",
    prepare: "브랜드, 중량, 수량, 포장 상태",
    confirm: "재고와 수급 상황에 따라 상담 가능 여부를 먼저 안내합니다.",
  },
  {
    purpose: "백금·은 제품 상담",
    priceLine: "백금·은 매입 기준",
    prepare: "순도 표기, 예상 중량, 오염·파손 상태",
    confirm: "제품 상태와 순도 표기가 최종 안내에 영향을 줄 수 있습니다.",
  },
  {
    purpose: "법인·상속·대량 정리",
    priceLine: "당일 고시 시세와 수량 기준",
    prepare: "품목 목록, 예상 수량, 방문 목적",
    confirm: "대기 시간을 줄이기 위해 방문 전 대표번호 확인을 권장합니다.",
  },
] as const;

const sourceRows = [
  {
    label: "회사 고시 시세",
    use: "거래 상담의 우선 기준",
    source: "KCG 관리자 고시 데이터",
    caution: "현장 검수 후 최종 금액을 안내합니다.",
  },
  {
    label: "자동 국제 참고 시세",
    use: "시장 흐름과 원화 환산 참고",
    source: "Gold API, 필요 시 Metals.Dev 계약 데이터",
    caution: "회사 고시 시세와 실제 거래 금액을 대체하지 않습니다.",
  },
  {
    label: "차트·뉴스·타사 참고",
    use: "구조 분석과 링크형 참고 정보",
    source: "이용 조건을 확인한 공개 또는 계약 데이터",
    caution: "타사 내부 API·가격표·뉴스 본문은 고객 화면에 직접 사용하지 않습니다.",
  },
] as const;

export function PriceContextGuide() {
  return (
    <section className="section-shell py-14">
      <div className="grid gap-8 border-y border-[var(--color-line)] py-8 xl:grid-cols-[0.78fr_1.22fr]">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[#9a8a00]">시세 확인 기준</p>
          <h2 className="mt-4 text-[2rem] font-semibold leading-tight tracking-[-0.06em] text-[#15191b] sm:text-[2.32rem]">
            시세를 볼 때 먼저 확인할 기준
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#687171]">
            대표 금거래소 사이트들이 공통으로 강조하는 것은 가격표, 살 때·팔 때 구분, 기준 시각, 상품별 준비
            항목입니다. KCG는 쇼핑몰 주문보다 전화와 방문 상담에 맞춰 필요한 기준만 먼저 보여드립니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#ffcc00] px-5 text-sm font-semibold text-[#171717] transition hover:bg-[#f2bf00]"
            >
              전화 상담 {siteConfig.contact.phone}
            </a>
            <Link
              href="/about"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#d7e0dd] bg-white px-5 text-sm font-semibold text-[#171717] transition hover:bg-[#fbfdfc]"
            >
              방문 안내
            </Link>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] md:grid-cols-2">
          {consultationRows.map((row) => (
            <article key={row.purpose} className="bg-white px-5 py-5">
              <h3 className="text-lg font-semibold tracking-[-0.04em] text-[#15191b]">{row.purpose}</h3>
              <dl className="mt-4 grid gap-3 text-sm leading-6 text-[#687171]">
                <div>
                  <dt className="text-xs font-bold tracking-[0.16em] text-[#9a8a00]">볼 시세</dt>
                  <dd className="mt-1 text-[#15191b]">{row.priceLine}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold tracking-[0.16em] text-[#9a8a00]">준비 항목</dt>
                  <dd className="mt-1">{row.prepare}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold tracking-[0.16em] text-[#9a8a00]">최종 확인</dt>
                  <dd className="mt-1">{row.confirm}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-8 overflow-hidden border border-[var(--color-line)] bg-white">
        <div className="grid gap-3 bg-[#f7fbfa] px-5 py-4 text-xs font-bold tracking-[0.16em] text-[#697171] md:grid-cols-[0.7fr_0.95fr_1.05fr_1.15fr]">
          <p>데이터</p>
          <p>화면 역할</p>
          <p>출처 기준</p>
          <p>주의 문구</p>
        </div>
        {sourceRows.map((row) => (
          <div
            key={row.label}
            className="grid gap-3 border-t border-[#e4ebe9] px-5 py-5 text-sm leading-6 text-[#687171] md:grid-cols-[0.7fr_0.95fr_1.05fr_1.15fr]"
          >
            <p className="font-semibold text-[#15191b]">{row.label}</p>
            <p>{row.use}</p>
            <p>{row.source}</p>
            <p>{row.caution}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
