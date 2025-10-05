import type { HTMLAttributes, ReactNode } from "react";

type TreeListItemProps = {
  children: ReactNode;
  depth?: number;
} & HTMLAttributes<HTMLLIElement>;

export function TreeListItem({
  children,
  className = "",
  depth = 0,
  ...props
}: TreeListItemProps) {
  const hasParent = depth > 0;

  return (
    <li
      className={`relative ${hasParent ? "pl-6" : ""} ${className}`.trim()}
      {...props}
    >
      {hasParent ? (
        <span
          aria-hidden
          className="border-surface-800/60 dark:border-surface-700/60 absolute top-6 left-[-24px] hidden h-px w-6 border-t sm:block"
        />
      ) : null}
      {children}
    </li>
  );
}

export default TreeListItem;
