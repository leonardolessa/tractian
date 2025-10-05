import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import { TreeMetadataList } from "../../../../components/_ui/TreeMetadataList";
import type { TreeMetadataEntry } from "../../../../helpers/ui/treeNode";

const sampleEntries: TreeMetadataEntry[] = [
  { key: "id", label: "ID", value: "asset-01" },
  { key: "location", label: "Localização", value: "loc-01" },
];

describe("TreeMetadataList", () => {
  afterEach(() => {
    cleanup();
  });

  it("returns null when entries are empty", () => {
    const { container } = render(<TreeMetadataList entries={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders each entry as a definition pair", () => {
    const { container } = render(
      <TreeMetadataList entries={sampleEntries} data-testid="metadata-list" />,
    );

    const list = container.querySelector("dl");
    const terms = Array.from(container.querySelectorAll("dt"));
    const definitions = Array.from(container.querySelectorAll("dd"));

    expect(list?.className).toContain("grid gap-3 sm:grid-cols-2");
    expect(terms).toHaveLength(2);
    expect(definitions).toHaveLength(2);
    expect(terms[0]?.textContent).toBe("ID");
    expect(definitions[0]?.textContent).toBe("asset-01");
    expect(terms[1]?.textContent).toBe("Localização");
    expect(definitions[1]?.textContent).toBe("loc-01");
  });

  it("appends custom classes while preserving defaults", () => {
    const { container } = render(
      <TreeMetadataList entries={sampleEntries} className="md:grid-cols-3" />,
    );

    const list = container.querySelector("dl");

    expect(list?.className).toContain("grid gap-3 sm:grid-cols-2");
    expect(list?.className).toContain("md:grid-cols-3");
    expect((list?.className ?? "").trim().split(/\s+/)).not.toContain("");
  });
});
