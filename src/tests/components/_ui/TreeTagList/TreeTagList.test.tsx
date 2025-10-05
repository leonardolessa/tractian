import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { TreeTagList } from "../../../../components/_ui/TreeTagList";
import type { TreeTagDescriptor } from "../../../../helpers/ui/treeNode";

const sampleDescriptors: TreeTagDescriptor[] = [
  { key: "info", tone: "info", label: "3 sensores" },
  { key: "warning", tone: "warning", label: "2 componentes" },
];

describe("TreeTagList", () => {
  afterEach(() => {
    cleanup();
  });

  it("returns null when there are no descriptors", () => {
    const { container } = render(<TreeTagList descriptors={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders every descriptor inside tag elements", () => {
    const { container } = render(
      <TreeTagList descriptors={sampleDescriptors} />,
    );

    const wrapper = container.firstElementChild as HTMLDivElement | null;

    expect(wrapper?.className).toContain("flex flex-wrap items-center gap-2");
    const firstTag = screen.getByText("3 sensores");
    const secondTag = screen.getByText("2 componentes");

    expect(firstTag.tagName).toBe("SPAN");
    expect(secondTag.tagName).toBe("SPAN");
    // Each TreeTag renders a <span> element; ensure both are present.
    expect(container.querySelectorAll("span")).toHaveLength(2);
  });

  it("combines default layout classes with custom ones", () => {
    const { container } = render(
      <TreeTagList descriptors={sampleDescriptors} className="justify-end" />,
    );

    const wrapper = container.firstElementChild as HTMLDivElement | null;

    expect(wrapper?.className).toContain("flex flex-wrap items-center gap-2");
    expect(wrapper?.className).toContain("justify-end");
    expect((wrapper?.className ?? "").trim().split(/\s+/)).not.toContain("");
  });

  it("forwards tone styles to the rendered tags", () => {
    render(<TreeTagList descriptors={sampleDescriptors} />);

    expect(screen.getByText("3 sensores").className).toContain(
      "bg-info-500/15",
    );
    expect(screen.getByText("2 componentes").className).toContain(
      "bg-warning-500/15",
    );
  });
});
