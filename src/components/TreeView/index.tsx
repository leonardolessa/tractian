import { useEffect, useState } from "react";
import type { TreeNode } from "../../types";
import { TreeActionButton } from "../_ui/TreeActionButton";
import { TreeList } from "../_ui/TreeList";
import { TreeListItem } from "../_ui/TreeListItem";
import { TreeEmptyState } from "../_ui/TreeEmptyState";
import { TreeLoadingState } from "../_ui/TreeLoadingState";
import { TreeViewNode } from "../TreeViewNode";

interface TreeViewProps {
  nodes: TreeNode[];
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export function TreeView({
  nodes,
  isLoading = false,
  title = "Árvore de ativos",
  description = "Visualize toda a hierarquia de localizações, ativos e componentes em uma única visão estruturada.",
}: TreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setExpandedIds(new Set());
  }, [nodes]);

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const hasNodes = nodes.length > 0;
  const showLoadingState = isLoading && !hasNodes;

  return (
    <section className="border-surface-800/70 bg-surface-900/75 flex flex-col gap-6 rounded-3xl border p-6 shadow-[0_20px_45px_rgba(2,6,23,0.55)] sm:p-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <p className="text-primary-500/90 text-xs font-semibold tracking-[0.3em] uppercase">
            Explorador
          </p>
          <h2 className="text-surface-100 text-2xl font-semibold sm:text-3xl">
            {title}
          </h2>
          <p className="text-surface-400 max-w-2xl text-sm sm:text-base">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <TreeActionButton onClick={handleCollapseAll} icon="—">
            Recolher tudo
          </TreeActionButton>
        </div>
      </header>
      {showLoadingState ? (
        <TreeLoadingState />
      ) : hasNodes ? (
        <TreeList>
          {nodes.map((node) => (
            <TreeListItem key={node.id} depth={0}>
              <TreeViewNode
                node={node}
                depth={0}
                expandedIds={expandedIds}
                onToggle={handleToggle}
              />
            </TreeListItem>
          ))}
        </TreeList>
      ) : (
        <TreeEmptyState />
      )}
    </section>
  );
}

export default TreeView;
