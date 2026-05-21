import {
  consultationScenarios,
  krxSafetyNotes,
  serviceFaqs,
  siteConfig,
  tradeProcess,
  visitChecklist,
} from "@/lib/site-config";

export type InquiryAssistantMode = "rules" | "openai" | "openai-disabled";

export type InquiryIntent =
  | "price_guide"
  | "old_gold"
  | "visit_prepare"
  | "product_inquiry"
  | "krx_reference"
  | "final_quote"
  | "human_handoff"
  | "out_of_scope";

export type InquiryActionType = "tel" | "internal" | "external";

export interface InquiryAction {
  label: string;
  href: string;
  type: InquiryActionType;
}

export interface InquiryAssistantRequest {
  message?: unknown;
  path?: unknown;
}

export interface InquiryAssistantResponse {
  answer: string;
  intent: InquiryIntent;
  confidence: number;
  handoffRequired: boolean;
  handoffReason: string | null;
  mode: InquiryAssistantMode;
  actions: InquiryAction[];
}

type OpenAiStructuredResponse = Omit<InquiryAssistantResponse, "mode" | "actions"> & {
  suggestedActionLabels: string[];
};

const MAX_MESSAGE_LENGTH = 240;
const openAiProviderFlag = "openai";
const finalQuoteKeywords = [
  "확정",
  "최종가",
  "얼마 받을",
  "얼마에 팔",
  "견적",
  "보장",
  "바로 거래",
  "입금",
  "결제",
  "주문",
  "수익",
  "투자 추천",
];
const staffHandoffKeywords = ["세금", "신고", "법률", "계약서", "감정서 발급", "카톡", "문자", "사람", "직원"];

const actionMap: Record<string, InquiryAction> = {
  phone: {
    label: "전화 상담",
    href: `tel:${siteConfig.contact.phone}`,
    type: "tel",
  },
  prices: {
    label: "시세표 보기",
    href: "/prices",
    type: "internal",
  },
  visit: {
    label: "방문 준비",
    href: "/about",
    type: "internal",
  },
  products: {
    label: "상품/매입 보기",
    href: "/products",
    type: "internal",
  },
  services: {
    label: "서비스 기준",
    href: "/services",
    type: "internal",
  },
};

function optionalMessagingActions(): InquiryAction[] {
  const actions: InquiryAction[] = [];

  if (siteConfig.contact.kakaoChatUrl) {
    actions.push({
      label: "카카오톡 문의",
      href: siteConfig.contact.kakaoChatUrl,
      type: "external",
    });
  } else if (siteConfig.contact.kakaoChannelUrl) {
    actions.push({
      label: "카카오톡 채널",
      href: siteConfig.contact.kakaoChannelUrl,
      type: "external",
    });
  }

  if (siteConfig.contact.naverTalkTalkUrl) {
    actions.push({
      label: "네이버 톡톡",
      href: siteConfig.contact.naverTalkTalkUrl,
      type: "external",
    });
  }

  return actions;
}

export function getInquiryAssistantMode(): InquiryAssistantMode {
  const provider = (process.env.INQUIRY_ASSISTANT_PROVIDER || "").toLowerCase();
  if (provider !== openAiProviderFlag) return "rules";
  return process.env.OPENAI_API_KEY ? "openai" : "openai-disabled";
}

export function getInquiryAssistantStatus() {
  return {
    mode: getInquiryAssistantMode(),
    storesMessages: false,
    collectsPersonalData: false,
    openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
    handoffChannels: [actionMap.phone, ...optionalMessagingActions()].map((action) => ({
      label: action.label,
      type: action.type,
    })),
  };
}

function cleanMessage(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_MESSAGE_LENGTH);
}

function cleanPath(value: unknown) {
  if (typeof value !== "string") return "/";
  return value.startsWith("/") ? value.slice(0, 80) : "/";
}

function includesAny(message: string, keywords: string[]) {
  return keywords.some((keyword) => message.includes(keyword));
}

function containsPersonalContactInfo(message: string) {
  const phonePattern = /(?:\+?82[-.\s]?)?(?:0?1[016789]|0[2-9]\d?)[-.\s]?\d{3,4}[-.\s]?\d{4}/;
  const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const residentNumberPattern = /\d{6}\s*[-]\s*[1-4]\d{6}/;

  return phonePattern.test(message) || emailPattern.test(message) || residentNumberPattern.test(message);
}

function requiresDeterministicHandoff(message: string) {
  const normalized = message.toLowerCase();
  return (
    containsPersonalContactInfo(message) ||
    includesAny(normalized, finalQuoteKeywords) ||
    includesAny(normalized, staffHandoffKeywords)
  );
}

function actionsFor(keys: Array<keyof typeof actionMap>, includeMessaging = true) {
  const base = keys.map((key) => actionMap[key]);
  return includeMessaging ? [...base, ...optionalMessagingActions()] : base;
}

function buildResponse(
  response: Omit<InquiryAssistantResponse, "mode">,
  mode: InquiryAssistantMode,
): InquiryAssistantResponse {
  return {
    ...response,
    mode,
  };
}

function faqAnswer(questionIncludes: string) {
  const matched = serviceFaqs.find((item) => item.question.includes(questionIncludes));
  return matched?.answer;
}

function answerWithRules(message: string, mode: InquiryAssistantMode): InquiryAssistantResponse {
  const normalized = message.toLowerCase();

  if (!message) {
    return buildResponse(
      {
        answer:
          "궁금한 내용을 짧게 입력해 주세요. 시세표 보는 법, 고금 매입 절차, 방문 준비물은 바로 안내하고, 확정 금액이 필요한 건은 직원 상담으로 연결합니다.",
        intent: "human_handoff",
        confidence: 0.72,
        handoffRequired: false,
        handoffReason: null,
        actions: actionsFor(["prices", "visit", "phone"]),
      },
      mode,
    );
  }

  if (containsPersonalContactInfo(message)) {
    return buildResponse(
      {
        answer:
          "연락처, 이메일, 주민등록번호 같은 개인정보는 이 자동 안내창에 남기지 마세요. 현재 버전은 문의 내용을 저장하지 않으며, 직원 연결은 전화 또는 공식 채널에서 진행해 주세요.",
        intent: "human_handoff",
        confidence: 0.98,
        handoffRequired: true,
        handoffReason: "개인정보가 포함될 수 있어 자동 답변 대신 사람 상담으로 전환합니다.",
        actions: actionsFor(["phone"], true),
      },
      mode,
    );
  }

  if (includesAny(normalized, finalQuoteKeywords)) {
    return buildResponse(
      {
        answer:
          "화면이나 자동 답변만으로 최종 금액을 확정하지 않습니다. 실제 금액은 당일 회사 고시 시세, 순도, 중량, 부속, 제품 상태를 현장에서 확인한 뒤 안내합니다.",
        intent: "final_quote",
        confidence: 0.92,
        handoffRequired: true,
        handoffReason: "확정가, 결제, 투자 판단 또는 직원 확인이 필요한 질문입니다.",
        actions: actionsFor(["phone", "prices", "visit"]),
      },
      mode,
    );
  }

  if (includesAny(normalized, ["krx", "한국거래소", "금시장", "api", "공식 시세", "금현물"])) {
    return buildResponse(
      {
        answer: `${krxSafetyNotes[0]} KCG 화면의 회사 고시 시세와 자동 참고 시세는 별도입니다. KRX 데이터는 승인·계약 범위가 확인되기 전까지 KCG 산식이나 공개 참고 시세로 사용하지 않습니다.`,
        intent: "krx_reference",
        confidence: 0.9,
        handoffRequired: false,
        handoffReason: null,
        actions: actionsFor(["prices", "services"]),
      },
      mode,
    );
  }

  if (includesAny(normalized, ["시세표", "살 때", "팔 때", "고시", "가격표", "자동 참고", "참고시세"])) {
    return buildResponse(
      {
        answer:
          faqAnswer("자동 참고시세") ||
          "고객이 구매할 때는 `내가 살 때`, 매입 상담을 받을 때는 `내가 팔 때` 기준을 먼저 확인합니다. 회사 고시 시세가 우선이며 자동 참고 시세는 시장 흐름 확인용입니다.",
        intent: "price_guide",
        confidence: 0.88,
        handoffRequired: false,
        handoffReason: null,
        actions: actionsFor(["prices", "phone"]),
      },
      mode,
    );
  }

  if (includesAny(normalized, ["고금", "18k", "14k", "주얼리", "반지", "목걸이", "사진", "영수증", "보증서"])) {
    return buildResponse(
      {
        answer:
          faqAnswer("고금은 사진만으로") ||
          "사진으로는 품목과 준비 사항만 대략 확인할 수 있습니다. 고금·주얼리 매입은 실물의 함량, 중량, 부속, 제품 상태를 현장에서 확인한 뒤 최종 안내합니다.",
        intent: "old_gold",
        confidence: 0.9,
        handoffRequired: false,
        handoffReason: null,
        actions: actionsFor(["services", "visit", "phone"]),
      },
      mode,
    );
  }

  if (includesAny(normalized, ["방문", "예약", "신분증", "준비", "주소", "위치", "영업시간", "주차", "대리", "상속"])) {
    return buildResponse(
      {
        answer: `${visitChecklist[0]} ${visitChecklist[1]} 품목이 많거나 법인·대리·상속 정리 건이면 방문 전 전화로 필요 서류와 상담 가능 시간을 먼저 확인해 주세요.`,
        intent: "visit_prepare",
        confidence: 0.9,
        handoffRequired: false,
        handoffReason: null,
        actions: actionsFor(["visit", "phone"]),
      },
      mode,
    );
  }

  if (includesAny(normalized, ["골드바", "실버바", "순금", "제품", "수량", "법인", "기업", "대량", "제작"])) {
    const scenario = consultationScenarios.find((item) => item.title.includes("골드바"));
    return buildResponse(
      {
        answer:
          scenario?.description ||
          "골드바·실버바와 순금 제품은 희망 중량, 수량, 상담 희망 시점을 먼저 알려주시면 수급 가능 여부와 상담 범위를 안내합니다.",
        intent: "product_inquiry",
        confidence: 0.86,
        handoffRequired: false,
        handoffReason: null,
        actions: actionsFor(["products", "phone"]),
      },
      mode,
    );
  }

  if (includesAny(normalized, staffHandoffKeywords)) {
    return buildResponse(
      {
        answer:
          "법률·세무 판단, 서류 발급, 문자/카카오톡 회신처럼 직원 확인이 필요한 내용은 자동 답변으로 확정하지 않습니다. 본사 전화로 문의하시면 담당자가 상담 범위를 확인합니다.",
        intent: "human_handoff",
        confidence: 0.84,
        handoffRequired: true,
        handoffReason: "직원 확인 또는 외부 채널 연결이 필요한 질문입니다.",
        actions: actionsFor(["phone"], true),
      },
      mode,
    );
  }

  return buildResponse(
    {
      answer: `${tradeProcess[0].body} 자동 안내가 부족하면 직원 상담으로 넘기는 것이 맞습니다. 확정 금액은 현장 확인 후 안내됩니다.`,
      intent: "out_of_scope",
      confidence: 0.58,
      handoffRequired: true,
      handoffReason: "허용된 FAQ 범위를 벗어났거나 상담원이 확인해야 할 수 있습니다.",
      actions: actionsFor(["phone", "services", "prices"]),
    },
    mode,
  );
}

function buildOpenAiInstructions() {
  const faqLines = serviceFaqs.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n");
  const visitLines = visitChecklist.join("\n- ");

  return [
    "You answer for Korea Center Gold Exchange public website users in Korean.",
    "Only answer from the provided KCG public-safe facts.",
    "Never promise final prices, payment, live trading, investment returns, legal/tax conclusions, or KRX affiliation.",
    "If a question requires final price, payment, legal/tax, employee confirmation, private document review, or personal data handling, set handoffRequired true.",
    "Do not ask the user to enter phone numbers, resident registration numbers, emails, API keys, passwords, MFA codes, card data, or secrets.",
    "Keep answers under 420 Korean characters.",
    "",
    "KCG public-safe facts:",
    `- Phone: ${siteConfig.contact.phone}`,
    `- Business hours: ${siteConfig.contact.businessHours}`,
    `- Address: ${siteConfig.contact.address}`,
    `- Visit checklist: ${visitLines}`,
    "- Company posted prices are primary. Automatic reference prices are secondary.",
    "- Final transaction amount is confirmed after on-site checks of purity, weight, accessories, product condition, quantity, and posted time.",
    `- KRX safety: ${krxSafetyNotes.join(" ")}`,
    "",
    "Approved FAQ:",
    faqLines,
  ].join("\n");
}

function parseOpenAiText(payload: unknown) {
  const record = payload as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ text?: unknown; type?: unknown }> }>;
  };

  if (typeof record.output_text === "string") return record.output_text;

  const text = record.output
    ?.flatMap((item) => item.content || [])
    .map((content) => (typeof content.text === "string" ? content.text : ""))
    .filter(Boolean)
    .join("");

  return text || "";
}

function actionLabelsToActions(labels: string[]) {
  const keys = new Set<keyof typeof actionMap>();
  for (const label of labels) {
    if (label.includes("시세")) keys.add("prices");
    if (label.includes("방문") || label.includes("위치")) keys.add("visit");
    if (label.includes("상품") || label.includes("매입")) keys.add("products");
    if (label.includes("서비스")) keys.add("services");
    if (label.includes("전화") || label.includes("상담")) keys.add("phone");
  }

  if (keys.size === 0) keys.add("phone");
  return actionsFor([...keys]);
}

async function answerWithOpenAi(message: string, path: string): Promise<InquiryAssistantResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_INQUIRY_MODEL || "gpt-5.4-mini",
      store: false,
      instructions: buildOpenAiInstructions(),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Path: ${path}\nQuestion: ${message}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "kcg_inquiry_answer",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              answer: { type: "string" },
              intent: {
                type: "string",
                enum: [
                  "price_guide",
                  "old_gold",
                  "visit_prepare",
                  "product_inquiry",
                  "krx_reference",
                  "final_quote",
                  "human_handoff",
                  "out_of_scope",
                ],
              },
              confidence: { type: "number", minimum: 0, maximum: 1 },
              handoffRequired: { type: "boolean" },
              handoffReason: { type: ["string", "null"] },
              suggestedActionLabels: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["전화 상담", "시세표 보기", "방문 준비", "상품/매입 보기", "서비스 기준"],
                },
              },
            },
            required: [
              "answer",
              "intent",
              "confidence",
              "handoffRequired",
              "handoffReason",
              "suggestedActionLabels",
            ],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI inquiry assistant failed: ${response.status}`);
  }

  const text = parseOpenAiText(await response.json());
  const parsed = JSON.parse(text) as OpenAiStructuredResponse;

  return {
    answer: parsed.answer,
    intent: parsed.intent,
    confidence: parsed.confidence,
    handoffRequired: parsed.handoffRequired,
    handoffReason: parsed.handoffReason,
    mode: "openai",
    actions: actionLabelsToActions(parsed.suggestedActionLabels),
  };
}

export async function answerInquiryAssistant(
  request: InquiryAssistantRequest,
): Promise<InquiryAssistantResponse> {
  const message = cleanMessage(request.message);
  const path = cleanPath(request.path);
  const mode = getInquiryAssistantMode();

  if (mode === "openai" && !requiresDeterministicHandoff(message)) {
    try {
      return await answerWithOpenAi(message, path);
    } catch {
      return answerWithRules(message, "rules");
    }
  }

  return answerWithRules(message, mode);
}
