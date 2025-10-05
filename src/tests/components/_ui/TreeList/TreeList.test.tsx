import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import { TreeList } from "../../../../components/_ui/TreeList";

describe("TreeList", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders children using root variant styles by default", () => {
    const { getByRole } = render(
      <TreeList>
        <li>Asset</li>
        <li>Sensor</li>
      </TreeList>,
    );

    const list = getByRole("list");
    const items = list.querySelectorAll("li");

    expect(list.className).toContain("flex flex-col gap-3 sm:gap-4");
    expect(list.className).toContain("pl-0");
    expect(items.length).toBe(2);
    expect(list).toMatchInlineSnapshot(`
      <ul
        class="flex flex-col gap-3 sm:gap-4 pl-0"
      >
        <li>
          Asset
        </li>
        <li>
          Sensor
        </li>
      </ul>
    `);
  });

  it("applies nested variant styles when requested", () => {
    const { getByRole } = render(
      <TreeList
        variant="nested"
        data-testid="nested-list"
        aria-label="nested tree"
      >
        <li>Nested item</li>
      </TreeList>,
    );

    const list = getByRole("list");

    expect(list.getAttribute("data-testid")).toBe("nested-list");
    expect(list.getAttribute("aria-label")).toBe("nested tree");
    expect(list.className).toContain("border-l");
    expect(list.className).toContain("ml-[18px]");
    expect(list).toMatchInlineSnapshot(`
      <ul
        aria-label="nested tree"
        class="flex flex-col gap-3 sm:gap-4 pl-6 border-l border-surface-800/70 dark:border-surface-700/60 ml-[18px] sm:ml-6"
        data-testid="nested-list"
      >
        <li>
          Nested item
        </li>
      </ul>
    `);
  });

  it("merges custom classes without introducing extra whitespace", () => {
    const { getByRole } = render(
      <TreeList className="text-surface-200" variant="nested">
        <li>Metadata</li>
      </TreeList>,
    );

    const list = getByRole("list");

    expect(list.className).toContain("text-surface-200");
    expect(list.className.trim().split(/\s+/)).not.toContain("");
  });
});
