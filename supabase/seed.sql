insert into prices (
  category,
  label,
  value,
  unit,
  announced_at,
  note,
  is_visible,
  display_order
)
values
  ('gold_24k_sell', '순금 24K 판매', 592000, '3.75g', '2026-04-20T09:00:00+09:00', '부가세 포함 기준, 실제 제작 상품은 공임이 별도 적용될 수 있습니다.', true, 1),
  ('gold_24k_buy', '순금 24K 매입', 528000, '3.75g', '2026-04-20T09:00:00+09:00', '실물 상태 및 감정 결과에 따라 현장 확정됩니다.', true, 2),
  ('gold_18k_buy', '18K 매입', 387500, '3.75g', '2026-04-20T09:00:00+09:00', '각인, 중량, 훼손 상태 확인 후 확정됩니다.', true, 3),
  ('gold_14k_buy', '14K 매입', 300000, '3.75g', '2026-04-20T09:00:00+09:00', '현장 계근 및 합금 상태에 따라 소폭 조정될 수 있습니다.', true, 4),
  ('platinum_sell', '백금 판매', 425000, '3.75g', '2026-04-20T09:00:00+09:00', '부가세 포함 기준, 실제 제품 수급과 공임에 따라 달라질 수 있습니다.', true, 5),
  ('platinum_buy', '백금 매입', 184000, '3.75g', '2026-04-20T09:00:00+09:00', '백금 순도와 장식 부속 분리 여부를 확인합니다.', true, 6),
  ('silver_sell', '은 판매', 15670, '3.75g', '2026-04-20T09:00:00+09:00', '실버바 판매 기준이며 실물 수급에 따라 달라질 수 있습니다.', true, 7),
  ('silver_buy', '은 매입', 6500, '3.75g', '2026-04-20T09:00:00+09:00', '산업용 은, 장식 은은 별도 기준이 적용될 수 있습니다.', true, 8)
on conflict (category) do update
set
  label = excluded.label,
  value = excluded.value,
  unit = excluded.unit,
  announced_at = excluded.announced_at,
  note = excluded.note,
  is_visible = excluded.is_visible,
  display_order = excluded.display_order,
  updated_at = now();

insert into announcements (
  title,
  slug,
  summary,
  content,
  is_pinned,
  status,
  published_at
)
values
  ('4월 주간 시세 공지 및 현장 상담 안내', 'weekly-price-briefing-april', '오전 9시 기준 시세를 중심으로 운영하며, 대량 거래 및 현장 감정은 사전 문의 후 방문을 권장드립니다.', '한국센터금거래소는 당일 고시 시세를 기준으로 상담을 진행합니다.

대량 매입, 상속 금 정리, 기업 귀금속 처분 상담은 방문 전 전화 또는 카카오 채널로 예약해 주시면 보다 정확한 안내가 가능합니다.

현장 매입 금액은 중량, 순도, 부속 분리 여부, 감정 결과에 따라 최종 확정됩니다.', true, 'published', '2026-04-20T08:30:00+09:00'),
  ('귀금속 매입 시 신분증 지참 안내', 'identity-card-required-for-purchase', '실물 매입 거래 시 관련 법규에 따라 본인 확인 절차가 필요합니다. 방문 전 신분증을 준비해 주세요.', '귀금속 및 금제품 매입 시에는 본인 명의 신분증 확인 절차가 진행됩니다.

대리 거래, 법인 거래, 고중량 거래의 경우 추가 확인 서류가 필요할 수 있으니 사전 문의를 권장드립니다.', false, 'published', '2026-04-18T10:00:00+09:00')
on conflict (slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  is_pinned = excluded.is_pinned,
  status = excluded.status,
  published_at = excluded.published_at,
  updated_at = now();

insert into products (
  category,
  name,
  slug,
  short_description,
  description,
  image_url,
  status,
  price_visible,
  price_note
)
values
  ('gold_bar', '투자용 골드바 상담', 'investment-gold-bar-consulting', '중량별 실물 골드바 상담 및 수급 안내', '실시간 재고와 공급 가능 수량은 상담 후 안내합니다. 대량 매입 또는 보관 상담이 필요한 고객을 위한 기본 구조입니다.', null, 'coming_soon', false, '시세와 수급 상황에 따라 상담 후 확정됩니다.'),
  ('purchase_guide', '귀금속 매입 안내', 'purchase-guide', '현장 감정, 계근, 정산 절차 안내', '개인 고객과 사업자 모두를 위한 매입 절차 안내 구조입니다. 상품이 적어도 서비스 페이지가 비어 보이지 않도록 핵심 역할을 합니다.', null, 'active', false, '매입 금액은 당일 고시 시세와 감정 결과로 최종 확정됩니다.')
on conflict (slug) do update
set
  category = excluded.category,
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  status = excluded.status,
  price_visible = excluded.price_visible,
  price_note = excluded.price_note,
  updated_at = now();
