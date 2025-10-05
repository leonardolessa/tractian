import type { HTMLAttributes, ReactNode } from "react";

export interface InputShellProps extends HTMLAttributes<HTMLDivElement> {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
}

const baseClasses =
  "focus-within:border-primary-500/80 border-surface-800/70 bg-surface-950/40 text-surface-200 flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm transition";

export function InputShell({
  leadingIcon,
  trailingIcon,
  disabled,
  children,
  className = "",
  ...props
}: InputShellProps) {
  return (
    <div
      className={`${baseClasses} ${disabled ? "cursor-not-allowed opacity-70" : ""} ${className}`.trim()}
      data-disabled={disabled}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {leadingIcon ? (
        <span aria-hidden className="text-surface-500 flex items-center">
          {leadingIcon}
        </span>
      ) : null}
      <div className="flex-1">{children}</div>
      {trailingIcon ? (
        <span aria-hidden className="text-surface-500 flex items-center">
          {trailingIcon}
        </span>
      ) : null}
    </div>
  );
}

export default InputShell;
