import type { HTMLAttributes } from "react";
import type { TreeMetadataEntry } from "../../../helpers/ui/treeNode";

interface TreeMetadataListProps extends HTMLAttributes<HTMLDListElement> {
  entries: TreeMetadataEntry[];
}

export function TreeMetadataList({
  entries,
  className = "",
  ...props
}: TreeMetadataListProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <dl className={`grid gap-3 sm:grid-cols-2 ${className}`.trim()} {...props}>
      {entries.map((entry) => (
        <div key={entry.key} className="space-y-1">
          <dt className="text-surface-500 text-[0.65rem] font-semibold tracking-wide uppercase">
            {entry.label}
          </dt>
          <dd className="text-surface-200 text-sm">{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default TreeMetadataList;
