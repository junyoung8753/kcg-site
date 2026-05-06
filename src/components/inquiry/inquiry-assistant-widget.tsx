"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import type { InquiryAction, InquiryAssistantResponse } from "@/lib/inquiry-assistant";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  actions?: InquiryAction[];
  handoffRequired?: boolean;
};

const quickPrompts = [
  {
    label: "시세표",
    message: "시세표에서 살 때와 팔 때는 어떻게 보면 되나요?",
  },
  {
    label: "고금매입",
    message: "고금이나 18K 주얼리는 사진만으로 견적이 가능한가요?",
  },
  {
    label: "방문준비",
    message: "방문 전에 신분증이나 준비물이 필요한가요?",
  },
  {
    label: "KRX",
    message: "KRX 금시장 시세와 한국센터금거래소 시세는 무엇이 다른가요?",
  },
] as const;

const defaultActions: InquiryAction[] = [
  { label: "전화 상담", href: "tel:02-747-1807", type: "tel" },
  { label: "시세표 보기", href: "/prices", type: "internal" },
  { label: "방문 준비", href: "/about", type: "internal" },
];

const initialMessage: ChatMessage = {
  role: "assistant",
  text:
    "시세표 보는 법, 고금 매입 절차, 방문 준비물은 자동으로 안내합니다. 확정 금액이나 특수 건은 직원 상담으로 넘깁니다.",
  actions: defaultActions,
};

export function InquiryAssistantWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [isPending, startTransition] = useTransition();

  const visibleMessages = useMemo(() => messages.slice(-5), [messages]);

  useEffect(() => {
    function openFromMobileBar() {
      setIsOpen(true);
    }

    window.addEventListener("kcg:open-inquiry-assistant", openFromMobileBar);
    return () => window.removeEventListener("kcg:open-inquiry-assistant", openFromMobileBar);
  }, []);

  function ask(message: string) {
    const trimmed = message.trim();
    if (!trimmed || isPending) return;

    setInput("");
    setIsOpen(true);
    setMessages((current) => [...current, { role: "user", text: trimmed }]);

    startTransition(async () => {
      try {
        const response = await fetch("/api/inquiry-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, path: pathname }),
        });
        const data = (await response.json()) as InquiryAssistantResponse;
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            text: data.answer,
            actions: data.actions,
            handoffRequired: data.handoffRequired,
          },
        ]);
      } catch {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            text: "자동 안내가 지연되고 있습니다. 본사 전화로 문의하시면 상담 가능 범위와 준비 사항을 안내해 드립니다.",
            actions: defaultActions,
            handoffRequired: true,
          },
        ]);
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(input);
  }

  return (
    <div
      data-testid="inquiry-assistant-widget"
      className="fixed bottom-[calc(6.9rem+env(safe-area-inset-bottom))] right-3 z-50 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-3 lg:bottom-6 lg:right-6"
    >
      {isOpen ? (
        <section
          role="dialog"
          aria-label="거래 상담 도우미"
          className="w-[22.5rem] max-w-full overflow-hidden border border-[#d8e1df] bg-white shadow-[0_24px_70px_rgba(18,24,24,0.2)]"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[#e3ebe8] bg-[#15191b] px-4 py-4 text-white">
            <div>
              <p className="kcg-fine-label text-[#ffcc00]">KCG 상담</p>
              <h2 className="mt-1 text-base font-bold tracking-[-0.02em]">거래 상담 도우미</h2>
              <p className="mt-1 text-xs leading-5 text-white/70">개인정보 저장 없이 기본 문의만 안내합니다</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 shrink-0 border border-white/20 text-sm font-bold text-white/82 transition hover:bg-white/10"
              aria-label="상담 도우미 닫기"
            >
              X
            </button>
          </div>

          <div className="max-h-[52vh] space-y-3 overflow-y-auto bg-[#f7fbf8] px-4 py-4">
            {visibleMessages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === "user" ? "text-right" : "text-left"}>
                <p
                  className={
                    message.role === "user"
                      ? "ml-auto inline-block max-w-[18rem] bg-[#ffcc00] px-3 py-2 text-sm font-semibold leading-6 text-[#171717]"
                      : "inline-block max-w-[19rem] border border-[#dfe7e5] bg-white px-3 py-2 text-sm leading-6 text-[#15191b]"
                  }
                >
                  {message.text}
                </p>
                {message.actions && message.role === "assistant" ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <a
                        key={`${action.href}-${action.label}`}
                        href={action.href}
                        target={action.type === "external" ? "_blank" : undefined}
                        rel={action.type === "external" ? "noreferrer" : undefined}
                        className="border border-[#d7e0dd] bg-white px-3 py-1.5 text-xs font-bold text-[#15191b] transition hover:bg-[#fff8d8]"
                      >
                        {action.label}
                      </a>
                    ))}
                  </div>
                ) : null}
                {message.handoffRequired ? (
                  <p className="mt-2 text-xs leading-5 text-[#8a5a00]">
                    직원 확인이 필요한 문의입니다. 확정 금액은 현장 확인 후 안내합니다.
                  </p>
                ) : null}
              </div>
            ))}
            {isPending ? (
              <p className="inline-block border border-[#dfe7e5] bg-white px-3 py-2 text-sm leading-6 text-[#687171]">
                상담 기준을 확인하는 중입니다...
              </p>
            ) : null}
          </div>

          <div className="border-t border-[#e3ebe8] bg-white px-4 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => ask(item.message)}
                  className="border border-[#d7e0dd] px-3 py-1.5 text-xs font-bold text-[#15191b] transition hover:bg-[#fff8d8]"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_auto] gap-2">
              <label className="sr-only" htmlFor="inquiry-assistant-input">
                상담 질문 입력
              </label>
              <input
                id="inquiry-assistant-input"
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 180))}
                placeholder="예: 고금 팔 때 준비물"
                className="min-w-0 border border-[#d7e0dd] px-3 py-2 text-sm text-[#15191b] outline-none focus:border-[#d9ad00] focus:ring-2 focus:ring-[#ffcc00]/30"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isPending || input.trim().length === 0}
                className="bg-[#15191b] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#30383a] disabled:cursor-not-allowed disabled:bg-[#b9c3c0]"
              >
                질문
              </button>
            </form>
            <p className="mt-2 text-[0.72rem] leading-5 text-[#7a8381]">
              연락처·주민등록번호·카드정보는 입력하지 마세요.
            </p>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="inquiry-assistant-input"
        onClick={() => setIsOpen((value) => !value)}
        className="hidden border border-[#cbb25b] bg-[#15191b] px-4 py-3 text-sm font-bold text-white shadow-[0_16px_38px_rgba(18,24,24,0.22)] transition hover:bg-[#2a3032] lg:inline-flex"
      >
        상담 도우미
      </button>
    </div>
  );
}
