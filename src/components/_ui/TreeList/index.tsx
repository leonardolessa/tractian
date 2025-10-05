import type { HTMLAttributes, ReactNode } from "react";

type TreeListVariant = "root" | "nested";

type TreeListProps = {
  children: ReactNode;
  variant?: TreeListVariant;
} & HTMLAttributes<HTMLUListElement>;

const variantStyles: Record<TreeListVariant, string> = {
  root: "pl-0",
  nested:
    "pl-6 border-l border-surface-800/70 dark:border-surface-700/60 ml-[18px] sm:ml-6",
};

export function TreeList({
  children,
  className = "",
  variant = "root",
  ...props
}: TreeListProps) {
  return (
    <ul
      className={`flex flex-col gap-3 sm:gap-4 ${variantStyles[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </ul>
  );
}

export default TreeList;
