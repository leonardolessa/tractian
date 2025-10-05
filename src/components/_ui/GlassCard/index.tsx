import type { HTMLAttributes, ReactNode } from "react";

type GlassCardElement = "div" | "section" | "header" | "article" | "aside";

export type GlassCardProps = {
  as?: GlassCardElement;
  heading?: ReactNode;
  subheading?: ReactNode;
  topHeading?: ReactNode;
  actions?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
} & HTMLAttributes<HTMLElement>;

const baseClasses =
  "border-surface-800/60 bg-surface-900/65 rounded-3xl border p-6 shadow-[0_25px_55px_rgba(2,6,23,0.6)] sm:p-8";

const headerClasses = "flex flex-col gap-1.5";

export function GlassCard({
  as,
  heading,
  subheading,
  topHeading,
  description,
  actions,
  children,
  className = "",
  ...props
}: GlassCardProps) {
  const Component = (as ?? "div") as GlassCardElement;

  const hasHeader = heading || subheading || description;

  return (
    <Component className={`${baseClasses} ${className}`.trim()} {...props}>
      {(hasHeader || actions || topHeading) && (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-4">
            {topHeading ? (
              <span className="text-primary-500/90 text-xs font-semibold tracking-[0.3em] uppercase">
                {topHeading}
              </span>
            ) : null}
            {hasHeader ? (
              <div className={headerClasses}>
                {heading ? (
                  <h1 className="text-3xl font-semibold sm:text-4xl">
                    {heading}
                  </h1>
                ) : null}
                {subheading ? (
                  <p className="text-surface-400 max-w-2xl text-sm sm:text-base">
                    {subheading}
                  </p>
                ) : null}
                {description ? (
                  <p className="text-surface-400 max-w-2xl text-sm sm:text-base">
                    {description}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          {actions ? (
            <div className="w-full max-w-md sm:w-auto">{actions}</div>
          ) : null}
        </div>
      )}
      {children ? <div className="mt-6">{children}</div> : null}
    </Component>
  );
}

export default GlassCard;
