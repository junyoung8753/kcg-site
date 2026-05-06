import { NextResponse } from "next/server";
import { answerInquiryAssistant, getInquiryAssistantStatus } from "@/lib/inquiry-assistant";

export async function GET() {
  return NextResponse.json({
    ok: true,
    ...getInquiryAssistantStatus(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await answerInquiryAssistant(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        answer:
          "자동 상담 안내를 불러오지 못했습니다. 본사 전화로 문의하시면 상담 가능 범위와 준비 사항을 안내해 드립니다.",
        intent: "human_handoff",
        confidence: 0,
        handoffRequired: true,
        handoffReason: "상담 도우미 API 처리 중 오류가 발생했습니다.",
        mode: getInquiryAssistantStatus().mode,
        actions: [
          {
            label: "전화 상담",
            href: "tel:02-747-1807",
            type: "tel",
          },
        ],
      },
      { status: 200 },
    );
  }
}
