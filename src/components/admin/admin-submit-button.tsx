"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

interface AdminSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  pendingLabel?: string;
}

export function AdminSubmitButton({
  children,
  pendingLabel = "처리 중...",
  className = "",
  disabled,
  ...props
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={disabled || pending}
      aria-busy={pending}
      data-admin-pending={pending ? "true" : "false"}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}
    >
      <span aria-live="polite">{pending ? pendingLabel : children}</span>
    </button>
  );
}
