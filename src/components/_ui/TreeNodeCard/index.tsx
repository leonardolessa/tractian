import type { HTMLAttributes, ReactNode } from "react";

type TreeNodeCardProps = {
  iconSrc: string;
  iconAlt: string;
  title: string;
  subtitle?: string;
  description?: string;
  statusSlot?: ReactNode;
  tagsSlot?: ReactNode;
  actionsSlot?: ReactNode;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function TreeNodeCard({
  iconSrc,
  iconAlt,
  title,
  subtitle,
  description,
  statusSlot,
  tagsSlot,
  actionsSlot,
  className = "",
  children,
  ...props
}: TreeNodeCardProps) {
  return (
    <div
      className={`group hover:border-primary-500/80 border-surface-800/60 bg-surface-900/60 hover:bg-surface-900/90 relative overflow-hidden rounded-xl border shadow-[0_6px_30px_rgba(15,23,42,0.45)] transition-colors ${className}`.trim()}
      {...props}
    >
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="bg-surface-900/80 ring-surface-800/80 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ring-1 ring-inset">
            <img
              src={iconSrc}
              alt={iconAlt}
              className="h-7 w-7 sm:h-8 sm:w-8"
            />
          </span>
          <div className="min-w-0 text-left">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h3 className="text-surface-100 truncate text-base font-semibold sm:text-lg">
                {title}
              </h3>
              {statusSlot ? (
                <div className="text-surface-300 flex items-center gap-2 text-sm font-medium">
                  {statusSlot}
                </div>
              ) : null}
            </div>
            {subtitle ? (
              <p className="text-surface-400 text-sm sm:text-[0.95rem]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {actionsSlot ? (
          <div className="ml-auto flex items-center gap-2 sm:self-start">
            {actionsSlot}
          </div>
        ) : null}
      </div>
      {description ? (
        <p className="text-surface-400/90 px-5 text-sm">{description}</p>
      ) : null}
      {children ? (
        <div className="text-surface-300 px-5 pb-4 text-sm">{children}</div>
      ) : null}
      {tagsSlot ? (
        <div className="border-surface-800/70 bg-surface-900/70 flex flex-wrap items-center gap-2 border-t px-4 py-3 sm:px-5">
          {tagsSlot}
        </div>
      ) : null}
    </div>
  );
}

export default TreeNodeCard;
