import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen } from "@testing-library/react";

import { mockTreeApiSelectors } from "../../mocks/treeApi";
import { renderTreeView } from "./treeViewTestUtils";

describe("TreeView loading states", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows a loading message while queries are fetching", () => {
    mockTreeApiSelectors({
      locations: { isLoading: true },
      assets: { data: [] },
    });

    renderTreeView("company-loading");

    expect(screen.getByText("Montando a árvore para você")).toBeTruthy();
    expect(screen.queryByText("Nenhum item disponível")).toBeNull();
  });

  it("surfaces the API error banner when requests fail", () => {
    mockTreeApiSelectors({
      locations: {
        isError: true,
        error: { status: 500, data: { message: "Locations crashed" } },
      },
      assets: { data: [] },
    });

    renderTreeView("company-error");

    const banner = screen.getByRole("alert");
    expect(banner.textContent).toContain("Locations crashed");
  });

  it("falls back to the empty state when the tree has no nodes", () => {
    mockTreeApiSelectors({
      locations: { data: [] },
      assets: { data: [] },
    });

    renderTreeView("company-empty");

    expect(screen.getByText("Nenhum item encontrado")).toBeTruthy();
  });
});
