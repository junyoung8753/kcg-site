const guideRows = [
  ["고금·주얼리", "내가 팔 때", "신분증, 보증서·영수증, 제품 상태"],
  ["골드바·실버바", "살 때/팔 때", "브랜드, 중량, 수량, 포장 상태"],
  ["백금·은", "품목별 고시가", "순도 표기, 예상 중량, 오염·파손 상태"],
  ["법인·대량", "당일 고시+수량", "품목 목록, 예상 수량, 거래 목적"],
] as const;

export function PriceContextGuide() {
  return (
    <section className="section-shell py-10 sm:py-12">
      <div className="grid gap-8 border-y border-[var(--color-line)] py-8 lg:grid-cols-[0.34fr_0.66fr]">
        <div>
          <p className="kcg-eyebrow text-[#9a8a00]">시세 확인 기준</p>
          <h2 className="kcg-section-title mt-3 text-[#15191b]">
            품목별로 볼 기준만 확인합니다.
          </h2>
        </div>
        <div className="overflow-hidden border border-[var(--color-line)] bg-white">
          <div className="hidden grid-cols-[0.8fr_0.8fr_1.2fr] bg-[#f7fbfa] px-5 py-3 text-xs font-bold tracking-[0.14em] text-[#697171] sm:grid">
            <p>품목</p>
            <p>볼 시세</p>
            <p>준비 항목</p>
          </div>
          {guideRows.map(([item, priceLine, prepare]) => (
            <div
              key={item}
              className="grid gap-2 border-t border-[#e4ebe9] px-5 py-4 text-sm leading-6 text-[#687171] first:border-t-0 sm:grid-cols-[0.8fr_0.8fr_1.2fr]"
            >
              <p className="font-bold tracking-[-0.022em] text-[#15191b]">{item}</p>
              <p>{priceLine}</p>
              <p>{prepare}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
