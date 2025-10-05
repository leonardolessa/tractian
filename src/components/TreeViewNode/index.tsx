import { useMemo } from "react";
import type { TreeNode } from "../../types";
import { TreeList } from "../_ui/TreeList";
import { TreeListItem } from "../_ui/TreeListItem";
import { TreeNodeCard } from "../_ui/TreeNodeCard";
import { TreeTag } from "../_ui/TreeTag";
import { TreeTagList } from "../_ui/TreeTagList";
import { TreeMetadataList } from "../_ui/TreeMetadataList";
import { TreeToggleButton } from "../_ui/TreeToggleButton";
import { describeTreeNode } from "../../helpers/ui/treeNode";

interface TreeViewNodeProps {
  node: TreeNode;
  depth: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}

export function TreeViewNode({
  node,
  depth,
  expandedIds,
  onToggle,
}: TreeViewNodeProps) {
  const isExpandable = node.children.length > 0;
  const isExpanded = isExpandable ? expandedIds.has(node.id) : false;
  const presentation = useMemo(() => describeTreeNode(node), [node]);

  const statusSlot = presentation.statusTag ? (
    <TreeTag tone={presentation.statusTag.tone}>
      {presentation.statusTag.label}
    </TreeTag>
  ) : undefined;

  const actionSlot = isExpandable ? (
    <TreeToggleButton
      expanded={isExpanded}
      label={node.name}
      onClick={() => onToggle(node.id)}
    />
  ) : undefined;

  return (
    <div className="space-y-3">
      <TreeNodeCard
        iconSrc={presentation.icon.src}
        iconAlt={presentation.icon.alt}
        title={node.name}
        subtitle={presentation.subtitle}
        statusSlot={statusSlot}
        tagsSlot={
          presentation.tags.length ? (
            <TreeTagList descriptors={presentation.tags} />
          ) : undefined
        }
        actionsSlot={actionSlot}
        className={presentation.highlightClass}
      >
        <TreeMetadataList entries={presentation.metadata} />
      </TreeNodeCard>
      {isExpandable && isExpanded ? (
        <TreeList variant="nested" aria-label={`Subitens de ${node.name}`}>
          {node.children.map((child) => (
            <TreeListItem depth={depth + 1} key={child.id}>
              <TreeViewNode
                node={child}
                depth={depth + 1}
                expandedIds={expandedIds}
                onToggle={onToggle}
              />
            </TreeListItem>
          ))}
        </TreeList>
      ) : null}
    </div>
  );
}

export default TreeViewNode;
