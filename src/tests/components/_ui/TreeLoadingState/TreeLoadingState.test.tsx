import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import { TreeLoadingState } from "../../../../components/_ui/TreeLoadingState";

describe("TreeLoadingState", () => {
  afterEach(() => {
    cleanup();
  });

  it("exposes polite live region with default skeleton count", () => {
    const { getByTestId, container, getByText } = render(
      <TreeLoadingState data-testid="loading-state" />,
    );

    const root = getByTestId("loading-state");
    const skeletonBlocks = container.querySelectorAll("div.relative.h-10");

    expect(root.getAttribute("aria-live")).toBe("polite");
    expect(root.getAttribute("aria-busy")).toBe("true");
    expect(getByText("Montando a árvore para você").textContent).toBe(
      "Montando a árvore para você",
    );
    expect(skeletonBlocks.length).toBe(4);
    expect(root).toMatchInlineSnapshot(`
      <div
        aria-busy="true"
        aria-live="polite"
        class="border-surface-800/60 bg-surface-900/40 flex flex-col gap-6 rounded-2xl border p-8"
        data-testid="loading-state"
      >
        <div
          class="flex flex-col items-center gap-4 text-center"
        >
          <div
            class="relative h-14 w-14"
          >
            <div
              class="border-primary-500/20 absolute inset-0 rounded-full border"
            />
            <div
              class="border-primary-400/80 absolute inset-0 animate-spin rounded-full border-t-2 border-r-2 border-b-2 border-l-transparent"
              style="animation-duration: 1.4s; animation-timing-function: cubic-bezier(0.45, 0, 0.55, 1);"
            />
            <div
              class="bg-surface-950/95 absolute inset-2 rounded-full"
            />
            <div
              class="bg-primary-500/80 absolute inset-[18%] rounded-full opacity-60 blur-[6px]"
            />
          </div>
          <div
            class="space-y-1"
          >
            <p
              class="text-surface-100 text-base font-medium"
            >
              Montando a árvore para você
            </p>
            <p
              class="text-surface-400 text-sm"
            >
              Estamos sincronizando os ativos e sensores da empresa selecionada.
            </p>
          </div>
        </div>
        <div
          class="flex flex-col gap-2"
        >
          <div
            class="border-surface-800/40 bg-surface-900/60 relative h-10 overflow-hidden rounded-xl border"
          >
            <div
              class="bg-surface-700/40 absolute inset-0 animate-pulse"
            />
            <div
              class="via-primary-500/10 absolute inset-y-1 -left-full w-1/2 origin-left skew-x-[-12deg] bg-gradient-to-r from-transparent to-transparent"
              style="animation: loading-shimmer 1.6s ease-in-out infinite;"
            />
          </div>
          <div
            class="border-surface-800/40 bg-surface-900/60 relative h-10 overflow-hidden rounded-xl border"
          >
            <div
              class="bg-surface-700/40 absolute inset-0 animate-pulse"
            />
            <div
              class="via-primary-500/10 absolute inset-y-1 -left-full w-1/2 origin-left skew-x-[-12deg] bg-gradient-to-r from-transparent to-transparent"
              style="animation: loading-shimmer 1.6s ease-in-out infinite;"
            />
          </div>
          <div
            class="border-surface-800/40 bg-surface-900/60 relative h-10 overflow-hidden rounded-xl border"
          >
            <div
              class="bg-surface-700/40 absolute inset-0 animate-pulse"
            />
            <div
              class="via-primary-500/10 absolute inset-y-1 -left-full w-1/2 origin-left skew-x-[-12deg] bg-gradient-to-r from-transparent to-transparent"
              style="animation: loading-shimmer 1.6s ease-in-out infinite;"
            />
          </div>
          <div
            class="border-surface-800/40 bg-surface-900/60 relative h-10 overflow-hidden rounded-xl border"
          >
            <div
              class="bg-surface-700/40 absolute inset-0 animate-pulse"
            />
            <div
              class="via-primary-500/10 absolute inset-y-1 -left-full w-1/2 origin-left skew-x-[-12deg] bg-gradient-to-r from-transparent to-transparent"
              style="animation: loading-shimmer 1.6s ease-in-out infinite;"
            />
          </div>
        </div>
      </div>
    `);
  });

  it("respects custom skeleton count and merges classes", () => {
    const { getByTestId, container } = render(
      <TreeLoadingState
        data-testid="custom-loading"
        skeletonCount={2}
        className="shadow-inner"
        title="Gerando estrutura"
        description="Carregando dados de ativos"
      />,
    );

    const root = getByTestId("custom-loading");
    const skeletonBlocks = container.querySelectorAll("div.relative.h-10");

    expect(root.className).toContain("shadow-inner");
    expect(root.className.trim().split(/\s+/)).not.toContain("");
    expect(root.textContent).toContain("Gerando estrutura");
    expect(root.textContent).toContain("Carregando dados de ativos");
    expect(skeletonBlocks.length).toBe(2);
  });

  it("forwards arbitrary props to the container", () => {
    const { getByTestId } = render(
      <TreeLoadingState data-testid="forwarded" aria-label="loading tree" />,
    );

    const root = getByTestId("forwarded");

    expect(root.getAttribute("aria-label")).toBe("loading tree");
  });
});
