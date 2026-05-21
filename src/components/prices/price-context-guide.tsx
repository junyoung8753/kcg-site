const guideRows = [
  ["고금·주얼리", "내가 팔 때", "신분증, 보증서·영수증, 제품 상태"],
  ["골드바·실버바", "내가 살 때/내가 팔 때", "브랜드, 중량, 수량, 포장 상태"],
  ["백금·은", "품목별 고시가", "순도 표기, 예상 중량, 오염·파손 상태"],
  ["법인·대량", "당일 고시+수량", "품목 목록, 예상 수량, 거래 목적"],
] as const;

const priceReadingSteps = [
  ["01", "내가 살 때·내가 팔 때 분리", "고객 기준에서 구매는 내가 살 때, 매입 상담은 내가 팔 때 열을 먼저 봅니다."],
  ["02", "품목 확인", "순금, 18K, 14K, 백금, 은은 같은 기준으로 보지 않습니다."],
  ["03", "고시 시각 확인", "가격은 당일 회사 고시 시각 기준이며 이후 조정될 수 있습니다."],
  ["04", "현장 확정", "실제 금액은 순도, 중량, 부속, 제품 상태 확인 후 안내합니다."],
] as const;

const preCallChecks = [
  ["무엇을 보유했나요?", "순금, 18K, 14K, 백금, 은, 골드바, 실버바, 주얼리처럼 품목을 먼저 구분합니다."],
  ["얼마나 있나요?", "정확하지 않아도 대략 중량, 수량, 포장 상태를 알려주면 안내가 빨라집니다."],
  ["어떻게 오시나요?", "방문 가능 시간, 법인·대리·상속 정리 여부는 전화 전에 따로 표시해 둡니다."],
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
          <p className="mt-4 text-sm leading-7 text-[#687171]">
            전화하기 전에는 아래 네 가지만 먼저 확인하면 됩니다. 회사 고시 시세가 우선이며 자동 참고 시세는
            시장 흐름 확인용입니다.
          </p>
        </div>

        <div className="grid gap-6">
          <div className="grid overflow-hidden border border-[#dfe6e4] bg-[#111416] text-white lg:grid-cols-[0.45fr_0.55fr]">
            <div className="flex min-h-[14rem] flex-col justify-between bg-[#202426] p-5">
              <div>
                <p className="kcg-fine-label text-[#ffcc00]">PRICE READING</p>
                <p className="mt-4 max-w-xs text-xl font-black leading-tight tracking-normal">
                  회사 고시 시세를 먼저 보고 참고 시세는 흐름만 확인합니다.
                </p>
              </div>
              <p className="text-sm leading-6 text-white/62">
                자동 참고 데이터는 회사 가격을 덮어쓰지 않습니다.
              </p>
            </div>
            <div className="grid gap-px bg-white/12 sm:grid-cols-2">
              {priceReadingSteps.map(([number, title, body]) => (
                <div key={title} className="bg-[#141719] px-5 py-5">
                  <p className="kcg-fine-label text-[#ffcc00]">{number}</p>
                  <p className="mt-3 text-base font-bold tracking-[-0.022em]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/68">{body}</p>
                </div>
              ))}
            </div>
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

          <div className="grid gap-px overflow-hidden border border-[#eadfbc] bg-[#eadfbc] md:grid-cols-3">
            {preCallChecks.map(([title, body]) => (
              <div key={title} className="bg-[#fffdf4] px-5 py-5">
                <p className="kcg-fine-label text-[#9a8a00]">전화 전 확인</p>
                <h3 className="mt-2 text-base font-bold tracking-[-0.02em] text-[#15191b]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#687171]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
