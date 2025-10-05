import type { HTMLAttributes, ReactNode } from "react";

export type TreeTagTone =
  | "neutral"
  | "info"
  | "positive"
  | "warning"
  | "critical";

export type TreeTagProps = {
  tone?: TreeTagTone;
  leadingIcon?: ReactNode;
  children: ReactNode;
} & HTMLAttributes<HTMLSpanElement>;

const toneStyles: Record<TreeTagTone, string> = {
  neutral:
    "bg-surface-800/70 text-surface-200 ring-1 ring-inset ring-surface-700/70",
  info: "bg-info-500/15 text-info-300 ring-1 ring-inset ring-info-500/35",
  positive:
    "bg-positive-500/15 text-positive-300 ring-1 ring-inset ring-positive-500/30",
  warning:
    "bg-warning-500/15 text-warning-300 ring-1 ring-inset ring-warning-500/30",
  critical:
    "bg-critical-500/15 text-critical-300 ring-1 ring-inset ring-critical-500/30",
};

export function TreeTag({
  tone = "neutral",
  leadingIcon,
  className = "",
  children,
  ...props
}: TreeTagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${toneStyles[tone]} ${className}`.trim()}
      {...props}
    >
      {leadingIcon ? (
        <span aria-hidden className="text-sm">
          {leadingIcon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

export default TreeTag;
