import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import { TreeEmptyState } from "../../../../components/_ui/TreeEmptyState";

describe("TreeEmptyState", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders default title, description and status role", () => {
    const { getByRole, getByText } = render(
      <TreeEmptyState data-testid="empty-state" />,
    );

    const container = getByRole("status");

    expect(container).toBeDefined();
    expect(container.getAttribute("data-testid")).toBe("empty-state");
    expect(getByText("Nenhum item encontrado").textContent).toBe(
      "Nenhum item encontrado",
    );
    expect(
      getByText(
        "Selecione uma empresa ou ajuste os filtros para ver os itens disponíveis.",
      ).textContent,
    ).toBe(
      "Selecione uma empresa ou ajuste os filtros para ver os itens disponíveis.",
    );
    expect(getByRole("status")).toMatchInlineSnapshot(`
      <div
        class="border-surface-700/70 bg-surface-900/50 flex flex-col items-center gap-4 rounded-2xl border border-dashed p-10 text-center"
        data-testid="empty-state"
        role="status"
      >
        <div
          class="space-y-2"
        >
          <p
            class="text-surface-200 text-base font-medium"
          >
            Nenhum item encontrado
          </p>
          <p
            class="text-surface-400 text-sm"
          >
            Selecione uma empresa ou ajuste os filtros para ver os itens disponíveis.
          </p>
        </div>
      </div>
    `);
  });

  it("renders optional illustration and merges custom class names", () => {
    const { getByRole, getByTestId } = render(
      <TreeEmptyState
        className="shadow-lg"
        illustration={<span data-testid="illustration">🌳</span>}
        title="Sem ativos"
        description="Ajuste os filtros ou selecione outra empresa."
      />,
    );

    const container = getByRole("status");

    expect(container.className).toContain("border border-dashed");
    expect(container.className).toContain("shadow-lg");
    expect(container.className.trim().split(/\s+/)).not.toContain("");

    const illustration = getByTestId("illustration");

    expect(illustration).toBeDefined();
    expect(illustration.parentElement?.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  it("forwards other props to the root element", () => {
    const { getByRole } = render(
      <TreeEmptyState aria-label="empty tree" data-testid="forwarded" />,
    );

    const container = getByRole("status");

    expect(container.getAttribute("aria-label")).toBe("empty tree");
    expect(container.getAttribute("data-testid")).toBe("forwarded");
  });
});
