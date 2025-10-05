import { forwardRef } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";

import { InputShell } from "../InputShell";

export interface SelectInputProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  shellClassName?: string;
  selectClassName?: string;
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    {
      leadingIcon,
      trailingIcon,
      shellClassName = "",
      selectClassName = "",
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <InputShell
        leadingIcon={leadingIcon}
        trailingIcon={trailingIcon}
        disabled={disabled}
        className={`${className} ${shellClassName}`.trim()}
      >
        <select
          ref={ref}
          disabled={disabled}
          className={`placeholder:text-surface-600 w-full bg-transparent focus:outline-none ${selectClassName}`.trim()}
          {...props}
        >
          {children}
        </select>
      </InputShell>
    );
  },
);

SelectInput.displayName = "SelectInput";

export default SelectInput;
