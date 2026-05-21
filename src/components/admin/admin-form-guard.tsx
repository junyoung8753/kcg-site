"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isGuardedForm(target: EventTarget | null): HTMLFormElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest("form[data-admin-save-guard]");
}

function AdminFormGuardInner() {
  const [status, setStatus] = useState("저장 상태 대기 중");

  useEffect(() => {
    const dirtyForms = new Set<HTMLFormElement>();
    let pendingForm: HTMLFormElement | null = null;

    const markDirty = (event: Event) => {
      const form = isGuardedForm(event.target);
      if (!form || form.dataset.adminDirtyIgnore === "true") return;
      dirtyForms.add(form);
      setStatus("저장되지 않은 변경사항이 있습니다.");
    };

    const markPending = (event: Event) => {
      const form = isGuardedForm(event.target);
      if (!form) return;
      pendingForm = form;
      dirtyForms.delete(form);
      setStatus(form.dataset.adminPendingMessage || "저장 중입니다. 완료될 때까지 창을 닫지 마세요.");
    };

    const blockUnload = (event: BeforeUnloadEvent) => {
      if (!pendingForm && dirtyForms.size === 0) return;
      event.preventDefault();
      event.returnValue = "";
    };

    const blockAdminNavigation = (event: MouseEvent) => {
      if (!pendingForm && dirtyForms.size === 0) return;
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(target instanceof HTMLAnchorElement)) return;
      const href = target.getAttribute("href") || "";
      if (!href.startsWith("/admin")) return;

      const message = pendingForm
        ? "저장/반영 작업이 아직 끝나지 않았습니다. 이동하면 결과를 확인하지 못할 수 있습니다. 이동할까요?"
        : "저장되지 않은 변경사항이 있습니다. 이동할까요?";
      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", blockUnload);
    document.addEventListener("input", markDirty, true);
    document.addEventListener("change", markDirty, true);
    document.addEventListener("submit", markPending, true);
    document.addEventListener("click", blockAdminNavigation, true);

    return () => {
      window.removeEventListener("beforeunload", blockUnload);
      document.removeEventListener("input", markDirty, true);
      document.removeEventListener("change", markDirty, true);
      document.removeEventListener("submit", markPending, true);
      document.removeEventListener("click", blockAdminNavigation, true);
    };
  }, []);

  return (
    <p className="sr-only" aria-live="polite" data-testid="admin-save-live-region">
      {status}
    </p>
  );
}

export function AdminFormGuard() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locationKey = `${pathname}?${searchParams.toString()}`;

  return <AdminFormGuardInner key={locationKey} />;
}
