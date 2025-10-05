import type { ButtonHTMLAttributes } from "react";

export interface TreeToggleButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "aria-label"> {
  expanded: boolean;
  label: string;
}

export function TreeToggleButton({
  expanded,
  label,
  onClick,
  className = "",
  ...props
}: TreeToggleButtonProps) {
  const ariaLabel = `${expanded ? "Recolher" : "Expandir"} ${label}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`hover:border-primary-500/70 hover:text-primary-100 border-surface-700/80 bg-surface-900/80 text-surface-300 inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${className}`.trim()}
      aria-label={ariaLabel}
      {...props}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
        className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`.trim()}
      >
        <path
          d="M7 5l6 5-6 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default TreeToggleButton;
