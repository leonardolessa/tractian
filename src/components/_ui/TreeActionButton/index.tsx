import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface TreeActionButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  children: ReactNode;
}

export function TreeActionButton({
  icon,
  iconPosition = "left",
  children,
  className = "",
  ...props
}: TreeActionButtonProps) {
  const baseClasses =
    "hover:border-primary-500/70 hover:text-primary-100 border-surface-700/80 bg-surface-900/80 text-surface-200 inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-medium transition";

  const iconElement = icon ? (
    <span aria-hidden className="text-base leading-none">
      {icon}
    </span>
  ) : null;

  return (
    <button
      type="button"
      className={`${baseClasses} ${className}`.trim()}
      {...props}
    >
      {iconPosition === "left" && iconElement}
      <span className="whitespace-nowrap">{children}</span>
      {iconPosition === "right" && iconElement}
    </button>
  );
}

export default TreeActionButton;
