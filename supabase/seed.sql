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
  ('gold_24k_sell', '순금 24K 판매', 954000, '3.75g', '2026-04-30T09:00:00+09:00', '부가세 포함 기준, 실제 제작 상품은 공임이 별도 적용될 수 있습니다.', true, 1),
  ('gold_24k_buy', '순금 24K 매입', 799000, '3.75g', '2026-04-30T09:00:00+09:00', '실물 상태 및 감정 결과에 따라 현장 확정됩니다.', true, 2),
  ('gold_18k_buy', '18K 매입', 587300, '3.75g', '2026-04-30T09:00:00+09:00', '각인, 중량, 훼손 상태 확인 후 확정됩니다.', true, 3),
  ('gold_14k_buy', '14K 매입', 455500, '3.75g', '2026-04-30T09:00:00+09:00', '현장 계근 및 합금 상태에 따라 소폭 조정될 수 있습니다.', true, 4),
  ('platinum_sell', '백금 판매', 397000, '3.75g', '2026-04-30T09:00:00+09:00', '부가세 포함 기준, 실제 제품 수급과 공임에 따라 달라질 수 있습니다.', true, 5),
  ('platinum_buy', '백금 매입', 322000, '3.75g', '2026-04-30T09:00:00+09:00', '백금 순도와 장식 부속 분리 여부를 확인합니다.', true, 6),
  ('silver_sell', '은 판매', 14650, '3.75g', '2026-04-30T09:00:00+09:00', '실버바 판매 기준이며 실물 수급에 따라 달라질 수 있습니다.', true, 7),
  ('silver_buy', '은 매입', 12020, '3.75g', '2026-04-30T09:00:00+09:00', '산업용 은, 장식 은은 별도 기준이 적용될 수 있습니다.', true, 8)
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
  ('4월 주간 시세 공지 및 거래 상담 안내', 'weekly-price-briefing-april', '오전 9시 기준 시세를 중심으로 운영하며, 대량 거래 및 현장 감정은 사전 문의를 권장드립니다.', '한국센터금거래소는 당일 고시 시세를 기준으로 상담을 진행합니다.

대량 매입, 상속 금 정리, 기업 귀금속 처분 상담은 거래 전 전화 또는 카카오 채널로 예약해 주시면 보다 정확한 안내가 가능합니다.

현장 매입 금액은 중량, 순도, 부속 분리 여부, 감정 결과에 따라 최종 확정됩니다.', true, 'published', '2026-04-20T08:30:00+09:00'),
  ('귀금속 매입 시 신분증 지참 안내', 'identity-card-required-for-purchase', '실물 매입 거래 시 관련 법규에 따라 본인 확인 절차가 필요합니다. 거래 전 신분증을 준비해 주세요.', '귀금속 및 금제품 매입 시에는 본인 명의 신분증 확인 절차가 진행됩니다.

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
  subcategory,
  name,
  slug,
  short_description,
  description,
  image_url,
  specs,
  status,
  display_order,
  is_featured,
  price_visible,
  price_basis,
  weight_grams,
  making_fee,
  manual_price,
  price_label,
  price_note,
  public_note
)
values
  ('gold_bar', '소형 골드바', 'KCG 골드바 1g', 'kcg-gold-bar-1g', '소액 실물 보유용 1g 순금 골드바', 'KCG 골드바 1g은 소액 실물 보유와 선물 수요를 위한 순금 제품입니다. 표시 가격은 현재 회사 고시 시세와 상담 기준 공임을 기준으로 계산한 참고가입니다.', null, array['순금 999.9', '중량 1g', '보증서·패키지 확인'], 'hidden', 910, false, false, 'gold_24k_sell', 1, 20000, null, '현재 고시가 기준 참고가', '실제 금액은 공임·수급·실물 확인 후 달라질 수 있습니다.', '소형 골드바는 당일 수급 가능 여부를 본사 전화로 먼저 확인해 주세요.'),
  ('gold_bar', '1돈 골드바', 'KCG 골드바 1돈', 'investment-gold-bar-consulting', '1돈 기준 투자·선물용 순금 골드바', '가장 많이 찾는 1돈 단위 골드바입니다. 가격은 현재 회사 고시가와 상담 기준 공임 기준 참고가이며, 재고와 브랜드·포장 상태는 문의 후 확인합니다.', '/products/kcg-approved-goldbar-1don-20260517.jpg', array['순금 999.9', '1돈 단위 상담', '보증서·패키지 확인'], 'active', 10, true, false, 'gold_24k_sell', 3.75, 35000, null, '현재 고시가 기준 참고가', '공임과 수급 상황에 따라 실제 안내 금액이 달라질 수 있습니다.', '희망 수량을 알려주시면 당일 수급 가능 범위를 먼저 확인해 드립니다.'),
  ('gold_bar', '2돈 골드바', 'KCG 골드바 2돈', 'kcg-gold-bar-2don', '2돈 기준 순금 골드바 상담', '2돈 골드바는 선물과 실물 보유 수요에 맞춘 상담 단위입니다. 현재 회사 고시가 기준 참고가를 확인하고 수급 가능 여부를 문의해 주세요.', '/products/kcg-approved-goldbar-2don-20260517.jpg', array['순금 999.9', '2돈 단위 상담', '수량별 수급 확인'], 'active', 20, true, false, 'gold_24k_sell', 7.5, 45000, null, '현재 고시가 기준 참고가', '공임과 수급 상황에 따라 실제 안내 금액이 달라질 수 있습니다.', '희망 수량과 방문 일정을 알려주시면 상담이 빠릅니다.'),
  ('gold_bar', '3돈 골드바', 'KCG 골드바 3돈', 'kcg-gold-bar-3don', '3돈 기준 순금 골드바 상담', '3돈 골드바는 여러 개 구매나 중량 선물 상담에 맞춘 단위입니다. 가격은 회사 고시가 기준 참고가이며, 재고와 공임 조건은 문의 후 확인합니다.', '/products/kcg-approved-goldbar-3don-20260517.jpg', array['순금 999.9', '3돈 단위 상담', '수급·공임 확인'], 'active', 30, false, false, 'gold_24k_sell', 11.25, 55000, null, '현재 고시가 기준 참고가', '공임과 수급 상황에 따라 실제 안내 금액이 달라질 수 있습니다.', '희망 중량과 수량을 함께 알려주시면 수급 가능 범위를 확인합니다.'),
  ('gold_bar', '5돈 골드바', 'KCG 골드바 5돈', 'kcg-gold-bar-5don', '5돈 기준 중량 골드바 상담', '5돈 골드바는 중량감 있는 선물과 실물 보유 상담에 맞춘 단위입니다. 현재 고시가 기준 참고가와 별도로 수급·공임 조건 확인이 필요합니다.', '/products/kcg-approved-goldbar-5don-20260517.jpg', array['순금 999.9', '5돈 단위 상담', '중량 수급 확인'], 'inquiry_required', 40, false, false, 'gold_24k_sell', 18.75, 0, null, '현재 고시가 기준 참고가', '고중량은 공임과 수급 조건을 별도 확인합니다.', '당일 상담 가능 여부와 수급 조건을 본사 전화로 확인해 주세요.'),
  ('gold_bar', '중량 골드바', 'KCG 골드바 10g', 'kcg-gold-bar-10g', '중량감 있는 실물 보유용 10g 골드바', '10g 단위 골드바는 투자용 실물 보유와 선물 수요에 모두 대응하는 중량입니다. 현재 고시가 기준 참고가를 먼저 확인하고 수급 가능 여부를 문의해 주세요.', null, array['순금 999.9', '중량 10g', '수량별 수급 확인'], 'hidden', 920, false, false, 'gold_24k_sell', 10, 70000, null, '현재 고시가 기준 참고가', '고중량 제품은 재고와 공급 조건을 확인한 뒤 안내합니다.', '여러 개 구매 문의는 수량과 희망 일정을 함께 알려주세요.'),
  ('gold_bar', '10돈 골드바', 'KCG 골드바 10돈', 'kcg-gold-bar-37-5g', '10돈 기준 고중량 순금 골드바', '10돈 골드바는 고중량 실물 보유 수요에 맞춘 상품입니다. 현재 고시가 기준 참고가와 별도로 수급·공임 조건 확인이 필요합니다.', '/products/kcg-approved-goldbar-10don-20260517.jpg', array['순금 999.9', '10돈 단위 상담', '고중량 수급 확인'], 'inquiry_required', 50, false, false, 'gold_24k_sell', 37.5, 0, null, '현재 고시가 기준 참고가', '고중량은 공임과 수급 조건을 별도 확인합니다.', '당일 상담 가능 여부와 수급 조건을 본사 전화로 확인해 주세요.'),
  ('gold_bar', '대형 골드바', 'KCG 골드바 100g', 'kcg-gold-bar-100g', '법인·고액 실물 보유 상담용 100g 골드바', '100g 골드바는 수량, 브랜드, 납기, 서류 필요 여부를 함께 확인해야 하는 고중량 상품입니다. 화면 가격은 현재 고시가 기준 참고가입니다.', null, array['순금 999.9', '중량 100g', '법인·대량 상담 가능'], 'hidden', 930, false, false, 'gold_24k_sell', 100, 0, null, '현재 고시가 기준 참고가', '고중량·대량 문의는 수급 조건 확인 후 안내합니다.', '법인 구매 또는 대량 문의는 수량과 납기 일정을 함께 알려주세요.'),
  ('silver_bar', '소형 실버바', 'KCG 실버바 100g', 'kcg-silver-bar-100g', '기념·소장용 100g 실버바', '100g 실버바는 기념품과 소량 실물 보유 수요에 적합합니다. 현재 은 판매 고시가와 상담 기준 공임 기준 참고가를 제공합니다.', null, array['순은 999', '중량 100g', '수급 확인 필요'], 'hidden', 110, true, false, 'silver_sell', 100, 25000, null, '현재 고시가 기준 참고가', '은 제품은 수급 상황에 따라 실제 안내 금액이 달라질 수 있습니다.', '실버바는 중량과 수량을 먼저 알려주시면 상담이 빠릅니다.'),
  ('silver_bar', '중량 실버바', 'KCG 실버바 500g', 'kcg-silver-bar-500g', '중량 실물 보유용 500g 실버바', '500g 실버바는 중량 실물 보유와 단체 기념품 상담에 활용할 수 있습니다. 화면 가격은 현재 고시가 기준 참고가입니다.', null, array['순은 999', '중량 500g', '대량 수량 상담'], 'hidden', 120, false, false, 'silver_sell', 500, 60000, null, '현재 고시가 기준 참고가', '수량과 납기 조건을 확인한 뒤 최종 안내합니다.', '고중량 실버바는 수급 가능 여부를 본사 전화로 확인해 주세요.'),
  ('silver_bar', '대형 실버바', 'KCG 실버바 1kg', 'kcg-silver-bar-1kg', '대량·법인 문의용 1kg 실버바', '1kg 실버바는 수급, 납기, 수량 조건을 함께 확인해야 하는 상품입니다. 가격은 현재 은 고시가 기준 참고가로만 표시됩니다.', null, array['순은 999', '중량 1kg', '법인·대량 상담'], 'hidden', 130, false, false, 'silver_sell', 1000, 0, null, '현재 고시가 기준 참고가', '대량 수급 조건과 공임은 별도 확인합니다.', '희망 수량, 납기, 사용 목적을 알려주시면 상담이 수월합니다.'),
  ('pure_gold', '순금 선물', '순금 돌반지 3.75g', 'pure-gold-baby-ring-3-75g', '선물용 1돈 순금 돌반지 상담', '순금 돌반지 3.75g은 선물용 수요가 높은 제품입니다. 현재 순금 판매 고시가와 상담 기준 공임 기준 참고가를 먼저 확인할 수 있습니다.', null, array['순금 999.9', '중량 3.75g', '선물 포장 확인'], 'hidden', 210, false, false, 'gold_24k_sell', 3.75, 55000, null, '현재 고시가 기준 참고가', '공임과 포장 조건에 따라 실제 금액이 달라질 수 있습니다.', '선물 일정과 희망 디자인을 함께 알려주세요.'),
  ('pure_gold', '순금 카드', '순금 카드 1g', 'pure-gold-card-1g', '소형 선물용 순금 카드 1g', '순금 카드 1g은 소형 선물과 기념품 문의에 적합한 제품입니다. 가격은 현재 고시가와 상담 기준 공임 기준 참고가입니다.', null, array['순금 999.9', '중량 1g', '패키지 상담'], 'hidden', 220, false, false, 'gold_24k_sell', 1, 25000, null, '현재 고시가 기준 참고가', '제작 공임과 포장 조건은 상담 후 안내합니다.', '기념일, 수량, 포장 필요 여부를 함께 알려주세요.'),
  ('pure_gold', '기념 메달', '순금 기념 메달', 'pure-gold-commemorative-medal', '행사·기념용 순금 메달 상담', '순금 기념 메달은 중량, 디자인, 수량, 제작 일정에 따라 상담 기준이 달라집니다. 기본 가격은 문의 기준으로 운영합니다.', null, array['중량별 상담', '디자인·문안 협의', '납기 일정 확인'], 'hidden', 230, false, false, 'inquiry', null, null, null, '사전 문의 필요', '디자인, 중량, 수량, 납기 확인 후 안내합니다.', '기업·단체 제작은 목적과 수량을 먼저 알려주세요.'),
  ('pure_gold', '순금 선물', '순금 선물 제품 상담', 'pure-gold-gift-consulting', '순금 선물·기념 제품 통합 상담', '순금 선물 제품은 중량, 공임, 포장, 수급 조건을 함께 확인합니다. 확정 결제 화면이 아니라 전화 문의 기준의 상품 카탈로그입니다.', null, array['선물용 순금 제품', '중량·공임 확인', '포장 상담'], 'hidden', 240, false, false, 'inquiry', null, null, null, '사전 문의 필요', '제품별 공임과 수급 조건을 확인한 뒤 안내합니다.', '희망 품목과 예산 범위를 알려주시면 상담이 빠릅니다.'),
  ('jewelry', '고금 매입', '고금 주얼리 매입', 'old-gold-jewelry-buying', '고금·예물·주얼리 통합 매입 상담', '고금 주얼리 매입은 순금, 18K, 14K, 백금, 은, 예물, 파손 제품을 한 항목에서 상담합니다. 최종 매입 금액은 실물의 순도, 중량, 부속, 제품 상태를 현장에서 확인한 뒤 안내합니다.', '/products/kcg-product-jewelry-buying-20260503.webp', array['순도·각인 확인', '중량 계근', '스톤·부속 별도 확인'], 'active', 110, true, false, 'inquiry', null, null, null, '실물 확인 후 안내', '최종 매입 금액은 실물 확인 후 확정됩니다.', '신분증과 보증서가 있으면 함께 준비해 주세요. 품목이 섞여 있어도 한 번에 상담합니다.'),
  ('jewelry', '18K 매입', '18K 주얼리 매입', '18k-jewelry-buying', '18K 반지·목걸이·예물 매입 기준 확인', '18K 주얼리는 순도, 중량, 큐빅·스톤·부속 상태를 확인한 뒤 당일 18K 매입 고시 시세를 기준으로 상담합니다.', null, array['18K 각인 확인', '스톤·부속 확인', '파손 상태 확인'], 'hidden', 320, false, false, 'gold_18k_buy', null, null, null, '18K 내가 팔 때 기준', '부속과 상태 확인 후 최종 안내합니다.', '큐빅, 스톤, 잠금 장식은 현장에서 별도 확인합니다.'),
  ('jewelry', '14K 매입', '14K 주얼리 매입', '14k-jewelry-buying', '14K 귀금속 매입 기준 확인', '14K 제품은 합금 상태와 부속을 확인한 뒤 당일 14K 매입 고시 시세를 기준으로 상담합니다.', null, array['14K 각인 확인', '중량 계근', '부속 분리 확인'], 'hidden', 330, false, false, 'gold_14k_buy', null, null, null, '14K 내가 팔 때 기준', '순도와 부속 확인 후 최종 안내합니다.', '제품 상태가 다양하므로 실물 확인이 필요합니다.'),
  ('jewelry', '백금·은 매입', '백금·은 제품 매입', 'platinum-silver-buying', '백금과 은 제품 매입 기준 확인', '백금과 은 제품은 순도와 제품 형태, 산업용 여부, 부속 상태를 확인한 뒤 매입 기준을 안내합니다.', null, array['백금·은 제품', '순도 확인', '제품 형태 확인'], 'hidden', 340, false, false, 'platinum_buy', null, null, null, '백금 내가 팔 때 기준', '은 제품은 별도 고시 기준과 제품 상태를 함께 확인합니다.', '백금과 은은 제품 형태에 따라 상담 기준이 달라질 수 있습니다.'),
  ('custom_order', '기업 기념품', '기업 기념품 제작', 'corporate-gift-production', '순금·실버 기념품 제작 상담', '기업 기념품 제작은 수량, 예산, 납기, 포장 조건을 확인한 뒤 상담 범위를 정합니다. 가격은 사전 문의 기준입니다.', null, array['수량·예산 확인', '납기 일정 확인', '포장·문안 협의'], 'hidden', 410, false, false, 'inquiry', null, null, null, '사전 문의 필요', '수량, 납기, 제작 범위 확인 후 안내합니다.', '기업명, 행사 일정, 예상 수량을 알려주시면 상담이 빠릅니다.'),
  ('custom_order', '법인 보유분', '법인 보유 귀금속 매입', 'corporate-precious-metal-buying', '법인 보유분·상속 정리·대량 매입 상담', '법인 보유 귀금속이나 상속 정리 품목은 품목 목록, 예상 중량, 필요 서류를 먼저 확인한 뒤 상담 일정을 잡습니다.', null, array['품목 목록 확인', '예상 중량 확인', '서류 필요 여부 확인'], 'hidden', 420, false, false, 'inquiry', null, null, null, '사전 문의 필요', '법인·대량 거래는 사전 확인 후 상담합니다.', '품목과 수량이 많을수록 전화 문의 후 상담 일정을 조율해 주세요.'),
  ('custom_order', '대량 상담', '대량 골드바 상담', 'bulk-gold-bar-consulting', '골드바 대량 수량 상담', '골드바 대량 상담은 중량, 수량, 납기, 결제 방식, 서류 필요 여부를 함께 확인합니다.', '/products/kcg-approved-goldbar-lineup-no-reflection-20260517.jpg', array['중량·수량 확인', '납기 조건 확인', '법인 서류 확인'], 'inquiry_required', 210, false, false, 'inquiry', null, null, null, '사전 문의 필요', '대량 수급 조건과 고시 기준을 함께 확인합니다.', '희망 중량과 수량을 알려주시면 수급 가능 범위를 확인합니다.'),
  ('purchase_guide', '거래 절차', '귀금속 매입 절차 안내', 'purchase-guide', '현장 감정, 계근, 정산 절차 안내', '실물 매입 전 준비사항과 현장 확인 기준을 정리한 안내 항목입니다. 공개 상품 탭에는 노출하지 않고 서비스 안내에서 사용합니다.', null, array['신분증 지참', '보증서·영수증 지참 권장', '현장 계근·순도 확인'], 'hidden', 900, false, false, 'inquiry', null, null, null, '당일 고시 시세 기준', '매입 금액은 당일 고시 시세와 감정 결과로 최종 확정됩니다.', '최종 금액은 실물 확인 후 현장에서 안내합니다.')
on conflict (slug) do update
set
  category = excluded.category,
  subcategory = excluded.subcategory,
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  specs = excluded.specs,
  status = excluded.status,
  display_order = excluded.display_order,
  is_featured = excluded.is_featured,
  price_visible = excluded.price_visible,
  price_basis = excluded.price_basis,
  weight_grams = excluded.weight_grams,
  making_fee = excluded.making_fee,
  manual_price = excluded.manual_price,
  price_label = excluded.price_label,
  price_note = excluded.price_note,
  public_note = excluded.public_note,
  updated_at = now();
