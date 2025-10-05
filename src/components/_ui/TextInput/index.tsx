import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

import { InputShell } from "../InputShell";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  shellClassName?: string;
  inputClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      leadingIcon,
      trailingIcon,
      shellClassName = "",
      inputClassName = "",
      disabled,
      className = "",
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
        <input
          ref={ref}
          disabled={disabled}
          className={`placeholder:text-surface-600 w-full bg-transparent focus:outline-none ${inputClassName}`.trim()}
          {...props}
        />
      </InputShell>
    );
  },
);

TextInput.displayName = "TextInput";

export default TextInput;
