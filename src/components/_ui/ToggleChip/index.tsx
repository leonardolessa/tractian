import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ToggleChipProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
  leadingIcon?: ReactNode;
}

const baseClasses =
  "border-surface-700/70 bg-surface-900/70 text-surface-400 hover:text-surface-200 hover:border-primary-500/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70 relative overflow-hidden";

const activeClasses =
  "bg-primary-500/30 text-primary-50 border-primary-400 shadow-[0_8px_20px_rgba(99,102,241,0.35)] after:absolute after:inset-0 after:rounded-full after:border after:border-primary-300/50 after:content-['']";

const inactiveClasses =
  "bg-surface-950/80 text-surface-500 border-surface-700/80";

export function ToggleChip({
  pressed = false,
  leadingIcon,
  children,
  className = "",
  type = "button",
  ...props
}: ToggleChipProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={`${baseClasses} ${pressed ? activeClasses : inactiveClasses} ${className}`.trim()}
      {...props}
    >
      {leadingIcon ? (
        <span aria-hidden className="text-primary-300/80">
          {leadingIcon}
        </span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export default ToggleChip;
