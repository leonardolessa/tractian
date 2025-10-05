import type { HTMLAttributes } from "react";
import { TreeTag } from "../TreeTag";
import type { TreeTagDescriptor } from "../../../helpers/ui/treeNode";

interface TreeTagListProps extends HTMLAttributes<HTMLDivElement> {
  descriptors: TreeTagDescriptor[];
}

export function TreeTagList({
  descriptors,
  className = "",
  ...props
}: TreeTagListProps) {
  if (descriptors.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`.trim()}
      {...props}
    >
      {descriptors.map((descriptor) => (
        <TreeTag key={descriptor.key} tone={descriptor.tone}>
          {descriptor.label}
        </TreeTag>
      ))}
    </div>
  );
}

export default TreeTagList;
