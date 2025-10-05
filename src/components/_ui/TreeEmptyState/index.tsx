import type { HTMLAttributes, ReactNode } from "react";

export interface TreeEmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
  title?: ReactNode;
  description?: ReactNode;
  illustration?: ReactNode;
}

export function TreeEmptyState({
  title = "Nenhum item encontrado",
  description = "Selecione uma empresa ou ajuste os filtros para ver os itens disponíveis.",
  illustration,
  className = "",
  ...props
}: TreeEmptyStateProps) {
  return (
    <div
      className={`border-surface-700/70 bg-surface-900/50 flex flex-col items-center gap-4 rounded-2xl border border-dashed p-10 text-center ${className}`.trim()}
      role="status"
      {...props}
    >
      {illustration ? (
        <div aria-hidden className="text-primary-400/80 text-4xl">
          {illustration}
        </div>
      ) : null}
      <div className="space-y-2">
        <p className="text-surface-200 text-base font-medium">{title}</p>
        <p className="text-surface-400 text-sm">{description}</p>
      </div>
    </div>
  );
}

export default TreeEmptyState;
