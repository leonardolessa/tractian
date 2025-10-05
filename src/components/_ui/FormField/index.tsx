import type { HTMLAttributes, ReactNode } from "react";

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  htmlFor?: string;
  description?: ReactNode;
  spacing?: "default" | "tight";
  children: ReactNode;
}

const spacingStyles: Record<NonNullable<FormFieldProps["spacing"]>, string> = {
  default: "space-y-2",
  tight: "space-y-1.5",
};

export function FormField({
  label,
  htmlFor,
  description,
  children,
  spacing = "default",
  className = "",
  ...props
}: FormFieldProps) {
  return (
    <div
      className={`text-surface-400 ${spacingStyles[spacing]} ${className}`.trim()}
      {...props}
    >
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold tracking-wide uppercase"
      >
        {label}
      </label>
      {children}
      {description ? (
        <p className="text-surface-500 text-[0.68rem]">{description}</p>
      ) : null}
    </div>
  );
}

export default FormField;
