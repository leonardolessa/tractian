import type { HTMLAttributes, ReactNode } from "react";

export type StatusBannerTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "critical";

export interface StatusBannerProps extends HTMLAttributes<HTMLDivElement> {
  tone?: StatusBannerTone;
  leadingIcon?: ReactNode;
  children: ReactNode;
}

const toneStyles: Record<StatusBannerTone, string> = {
  neutral: "border-surface-800/50 bg-surface-900/60 text-surface-300",
  info: "border-info-500/50 bg-info-900/30 text-info-200",
  success: "border-positive-500/40 bg-positive-950/30 text-positive-200",
  warning: "border-warning-500/45 bg-warning-950/25 text-warning-200",
  critical: "border-critical-500/50 bg-critical-950/30 text-critical-200",
};

export function StatusBanner({
  tone = "neutral",
  leadingIcon,
  children,
  className = "",
  ...props
}: StatusBannerProps) {
  const role = tone === "critical" ? "alert" : "status";
  const ariaLive = tone === "critical" ? "assertive" : "polite";

  return (
    <div
      className={`rounded-3xl border p-6 text-sm ${toneStyles[tone]} ${className}`.trim()}
      role={role}
      aria-live={ariaLive}
      {...props}
    >
      <div className="flex items-start gap-3">
        {leadingIcon ? (
          <span aria-hidden className="mt-0.5 flex items-center text-base">
            {leadingIcon}
          </span>
        ) : null}
        <div className="flex-1 space-y-1">{children}</div>
      </div>
    </div>
  );
}

export default StatusBanner;
