import type { HTMLAttributes } from "react";

export interface TreeLoadingStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  title?: string;
  description?: string;
  skeletonCount?: number;
}

export function TreeLoadingState({
  title = "Montando a árvore para você",
  description = "Estamos sincronizando os ativos e sensores da empresa selecionada.",
  skeletonCount = 4,
  className = "",
  ...props
}: TreeLoadingStateProps) {
  const skeletonItems = Array.from({ length: skeletonCount });

  return (
    <div
      className={`border-surface-800/60 bg-surface-900/40 flex flex-col gap-6 rounded-2xl border p-8 ${className}`.trim()}
      aria-live="polite"
      aria-busy="true"
      {...props}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-14 w-14">
          <div className="border-primary-500/20 absolute inset-0 rounded-full border" />
          <div
            className="border-primary-400/80 absolute inset-0 animate-spin rounded-full border-t-2 border-r-2 border-b-2 border-l-transparent"
            style={{
              animationDuration: "1.4s",
              animationTimingFunction: "cubic-bezier(0.45, 0, 0.55, 1)",
            }}
          />
          <div className="bg-surface-950/95 absolute inset-2 rounded-full" />
          <div className="bg-primary-500/80 absolute inset-[18%] rounded-full opacity-60 blur-[6px]" />
        </div>
        <div className="space-y-1">
          <p className="text-surface-100 text-base font-medium">{title}</p>
          <p className="text-surface-400 text-sm">{description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {skeletonItems.map((_, index) => (
          <div
            key={index}
            className="border-surface-800/40 bg-surface-900/60 relative h-10 overflow-hidden rounded-xl border"
          >
            <div className="bg-surface-700/40 absolute inset-0 animate-pulse" />
            <div
              className="via-primary-500/10 absolute inset-y-1 -left-full w-1/2 origin-left skew-x-[-12deg] bg-gradient-to-r from-transparent to-transparent"
              style={{
                animation: "loading-shimmer 1.6s ease-in-out infinite",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TreeLoadingState;
